from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime

trips_bp = Blueprint("trips", __name__)


def get_user_object_id():
    identity = get_jwt_identity()  # this should be your user_id as string
    try:
        return ObjectId(identity)
    except errors.InvalidId:
        return None


def enhance_trip_data(db, trip):
    """Add member usernames and owner username to trip data"""
    # Convert ObjectIds to strings
    trip["_id"] = str(trip["_id"])
    trip["owner"] = str(trip["owner"])
    
    # Get member usernames
    member_ids = trip.get("members", [])
    members_info = []
    
    for member_id in member_ids:
        user = db.users.find_one({"_id": member_id}, {"username": 1, "_id": 1})
        if user:
            members_info.append({
                "user_id": str(user["_id"]),
                "username": user["username"]
            })
    
    trip["members"] = [str(mid) for mid in member_ids]  # Keep original format
    trip["members_info"] = members_info  # Add detailed member info
    
    # Get owner username
    owner = db.users.find_one({"_id": ObjectId(trip["owner"])}, {"username": 1})
    trip["owner_username"] = owner["username"] if owner else "Unknown"
    
    return trip


@trips_bp.route("/", methods=["POST"])
@jwt_required()
def create_trip():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    arrival = data.get("arrival")
    departure = data.get("departure")
    member_usernames = data.get("memberUsernames", [])

    if not title or not arrival or not departure:
        return jsonify({"error": "Missing required fields"}), 400

    # Validate date format
    try:
        datetime.fromisoformat(arrival.replace('Z', '+00:00'))
        datetime.fromisoformat(departure.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    member_usernames = [username.strip().lower() for username in member_usernames]

    members = []
    for username in member_usernames:
        user = db.users.find_one({"username": username})
        if user:
            members.append(user["_id"])

    members = list(set(members + [user_id]))

    trip_data = {
        "title": title,
        "arrival": arrival,
        "departure": departure,
        "owner": user_id,
        "members": members,
        "created_at": datetime.utcnow().isoformat()
    }

    result = db.trips.insert_one(trip_data)
    trip_data["_id"] = result.inserted_id

    # Enhance the trip data before returning
    enhanced_trip = enhance_trip_data(db, trip_data)

    return jsonify({"message": "Trip created successfully", "trip": enhanced_trip}), 201

@trips_bp.route("/<trip_id>/invite", methods=["POST"])
@jwt_required()
def invite_user_to_trip(trip_id):
    db = current_app.db
    current_user = get_user_object_id()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    identifier = data.get("identifier")  # Can be username or email

    if not identifier:
        return jsonify({"error": "Username or email is required"}), 400

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    if current_user not in trip.get("members", []):
        return jsonify({"error": "You do not have permission to invite users to this trip"}), 403

    # Find user by username OR email
    user = db.users.find_one({
        "$or": [
            {"username": identifier.strip().lower()},
            {"email": identifier.strip().lower()}
        ]
    })

    if not user:
        return jsonify({"error": "User not found"}), 404
   
    db.users.update_one(
    {"_id": user["_id"]},
    {"$addToSet": {"pending_trip_invites": trip_obj_id}}
    )

    db.trips.update_one(
        {"_id": trip_obj_id},
        {"$addToSet": {"members": user["_id"]}}
    )

    updated_trip = db.trips.find_one({"_id": trip_obj_id})
    enhanced_trip = enhance_trip_data(db, updated_trip)

    return jsonify({
        "message": f"User '{identifier}' invited successfully",
        "trip": enhanced_trip
    }), 200

@trips_bp.route('/<trip_id>/accept-invite', methods=['POST'])
@jwt_required()
def accept_trip_invite(trip_id):
    db = current_app.db
    current_user = get_user_object_id()

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    user = db.users.find_one({"_id": current_user})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the invite exists
    if trip_obj_id not in user.get("pending_trip_invites", []):
        return jsonify({"error": "No pending invite for this trip"}), 403

    # Add the user to the trip
    db.trips.update_one(
        {"_id": trip_obj_id},
        {"$addToSet": {"members": current_user}}
    )

    # Remove the trip from pending invites
    db.users.update_one(
        {"_id": current_user},
        {"$pull": {"pending_trip_invites": trip_obj_id}}
    )

    return jsonify({"message": "Trip invite accepted"}), 200

@trips_bp.route("/<trip_id>", methods=["GET"])
@jwt_required()
def get_trip(trip_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})

    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    enhanced_trip = enhance_trip_data(db, trip)
    return jsonify(enhanced_trip)


@trips_bp.route("/my-trips", methods=["GET"])
@jwt_required()
def get_user_trips():
    """Get user trips with enhanced data for dashboard"""
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Find trips where user is a member, sorted by arrival date
    trips = list(db.trips.find({"members": user_id}).sort("arrival", 1))
    
    enhanced_trips = []
    for trip in trips:
        enhanced_trip = enhance_trip_data(db, trip)
        enhanced_trips.append(enhanced_trip)
    
    return jsonify(enhanced_trips)


@trips_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    """Get trip statistics for dashboard"""
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    now = datetime.utcnow().isoformat()
    
    # Get all user trips
    all_trips = list(db.trips.find({"members": user_id}))
    
    # Categorize trips
    upcoming = [t for t in all_trips if t["arrival"] > now]
    active = [t for t in all_trips if t["arrival"] <= now <= t["departure"]]
    past = [t for t in all_trips if t["departure"] < now]
    owned = [t for t in all_trips if t["owner"] == user_id]
    
    return jsonify({
        "total_trips": len(all_trips),
        "upcoming_trips": len(upcoming),
        "active_trips": len(active),
        "past_trips": len(past),
        "owned_trips": len(owned),
        "member_trips": len(all_trips) - len(owned)
    })


@trips_bp.route("/<trip_id>/add-user", methods=["POST"])
@jwt_required()
def add_user_to_trip(trip_id):
    db = current_app.db
    current_user = get_user_object_id()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    user_id_str = data.get("user_id")
    username = data.get("username")  # Allow adding by username too
    
    if not user_id_str and not username:
        return jsonify({"error": "Missing user_id or username"}), 400

    # Find user by username if provided
    if username and not user_id_str:
        user = db.users.find_one({"username": username.strip().lower()})
        if not user:
            return jsonify({"error": "User not found"}), 404
        user_id_str = str(user["_id"])

    try:
        user_id = ObjectId(user_id_str)
    except errors.InvalidId:
        return jsonify({"error": "Invalid user_id"}), 400

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    # Check if current user has permission to add users to this trip
    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    
    if current_user not in trip.get("members", []):
        return jsonify({"error": "You don't have permission to add users to this trip"}), 403

    update_result = db.trips.update_one(
        {"_id": trip_obj_id}, 
        {"$addToSet": {"members": user_id}}
    )

    if update_result.matched_count == 0:
        return jsonify({"error": "Trip not found"}), 404

    # Get updated trip data
    updated_trip = db.trips.find_one({"_id": trip_obj_id})
    enhanced_trip = enhance_trip_data(db, updated_trip)

    return jsonify({
        "message": "User added to trip successfully",
        "trip": enhanced_trip
    })


@trips_bp.route("/<trip_id>/remove-user", methods=["POST"])
@jwt_required()
def remove_user_from_trip(trip_id):
    """Remove a user from a trip (only owner can do this)"""
    db = current_app.db
    current_user = get_user_object_id()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    user_id_str = data.get("user_id")
    
    if not user_id_str:
        return jsonify({"error": "Missing user_id"}), 400

    try:
        user_id = ObjectId(user_id_str)
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid ID"}), 400

    # Check if current user is the owner
    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    
    if trip["owner"] != current_user:
        return jsonify({"error": "Only trip owner can remove users"}), 403
    
    if user_id == current_user:
        return jsonify({"error": "Cannot remove yourself from your own trip"}), 400

    update_result = db.trips.update_one(
        {"_id": trip_obj_id}, 
        {"$pull": {"members": user_id}}
    )

    if update_result.modified_count == 0:
        return jsonify({"error": "User was not a member of this trip"}), 400

    return jsonify({"message": "User removed from trip successfully"})


@trips_bp.route("/<trip_id>", methods=["PUT"])
@jwt_required()
def update_trip(trip_id):
    """Update trip details (only owner can do this)"""
    db = current_app.db
    current_user = get_user_object_id()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    # Check if current user is the owner
    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    
    if trip["owner"] != current_user:
        return jsonify({"error": "Only trip owner can update trip details"}), 403

    data = request.get_json()
    update_data = {}
    
    # Only allow updating certain fields
    allowed_fields = ["title", "arrival", "departure"]
    for field in allowed_fields:
        if field in data:
            if field in ["arrival", "departure"]:
                # Validate date format
                try:
                    datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({"error": f"Invalid date format for {field}"}), 400
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = db.trips.update_one(
        {"_id": trip_obj_id},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        return jsonify({"error": "No changes made"}), 400

    # Get updated trip
    updated_trip = db.trips.find_one({"_id": trip_obj_id})
    enhanced_trip = enhance_trip_data(db, updated_trip)

    return jsonify({
        "message": "Trip updated successfully",
        "trip": enhanced_trip
    })

@trips_bp.route("/pending-invites", methods=["GET"])
@jwt_required()
def get_pending_trip_invites():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = db.users.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    pending_ids = user.get("pending_trip_invites", [])

    if not pending_ids:
        return jsonify([])  # return empty list if none

    trips = db.trips.find({"_id": {"$in": pending_ids}})
    enhanced = [enhance_trip_data(db, trip) for trip in trips]

    return jsonify(enhanced), 200   