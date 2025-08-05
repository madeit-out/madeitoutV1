from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime

from ..models.trip import Trip
from ..models.user import User
from ..models.event import Event # Make sure to import the Event model

trips_bp = Blueprint("trips", __name__)


def get_user_object_id():
    """Helper to get current user's ObjectId from JWT identity."""
    identity = get_jwt_identity()
    try:
        return ObjectId(identity)
    except (errors.InvalidId, TypeError):
        return None


def enhance_trip_data(db, trip_doc):
    """
    Enhances trip data for frontend display, converting ObjectIds to strings
    and adding detailed member and owner information.
    Accepts a raw trip dictionary from MongoDB.
    """
    trip = Trip.from_dict(trip_doc)
    
    enhanced_data = trip.to_dict()

    member_ids = enhanced_data.get("members", [])
    members_info = []
    for member_id_str in member_ids:
        try:
            member_obj_id = ObjectId(member_id_str)
            user = db.users.find_one({"_id": member_obj_id}, {"username": 1, "email": 1, "_id": 1})
            if user:
                members_info.append({
                    "id": str(user["_id"]),
                    "username": user.get("username"),
                    "email": user.get("email")
                })
        except errors.InvalidId:
            continue
    enhanced_data["members_info"] = members_info

    owner_id = enhanced_data.get("created_by")
    owner_username = "Unknown"
    if owner_id:
        try:
            owner_user = db.users.find_one({"_id": ObjectId(owner_id)}, {"username": 1})
            if owner_user:
                owner_username = owner_user["username"]
        except errors.InvalidId:
            pass
    enhanced_data["owner_username"] = owner_username
    
    enhanced_data["trip_name"] = enhanced_data["title"]

    return enhanced_data


@trips_bp.route("/", methods=["POST"])
@jwt_required()
def create_trip():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    destination = data.get("destination")
    arrival = data.get("arrival")
    departure = data.get("departure")
    description = data.get("description", "")
    member_emails = data.get("memberEmails", [])
    is_public = data.get("is_public", False)
    cover_image_url = data.get("cover_image_url", "")
    budget = data.get("budget")

    if not all([title, destination, arrival, departure]):
        return jsonify({"error": "Missing required fields (title, destination, arrival, departure)"}), 400

    try:
        datetime.fromisoformat(arrival.replace('Z', '+00:00'))
        datetime.fromisoformat(departure.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    invited_user_ids = []
    for email in member_emails:
        user_to_invite = db.users.find_one({"email": email.strip().lower()})
        if user_to_invite:
            invited_user_ids.append(user_to_invite["_id"])
    
    initial_members = [user_id]
    
    new_trip = Trip(
        title=title,
        created_by=user_id,
        arrival=arrival,
        departure=departure,
        destination=destination,
        description=description,
        members=list(set(initial_members + invited_user_ids)),
        member_emails=member_emails,
        is_public=is_public,
        cover_image_url=cover_image_url,
        budget=budget
    )

    result = db.trips.insert_one(new_trip.to_dict())
    new_trip._id = result.inserted_id

    for invited_id in invited_user_ids:
        db.users.update_one(
            {"_id": invited_id},
            {"$addToSet": {"pending_invitations": new_trip._id}}
        )

    enhanced_trip = enhance_trip_data(db, new_trip.to_dict())

    return jsonify({"message": "Trip created successfully", "trip": enhanced_trip}), 201


@trips_bp.route("/pending-invites", methods=["GET"])
@jwt_required()
def get_pending_trip_invites():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = db.users.find_one({"_id": user_id})
    if not user_doc:
        return jsonify({"error": "User not found"}), 404

    pending_ids = user_doc.get("pending_invitations", [])

    if not pending_ids:
        return jsonify([]), 200

    trips_cursor = db.trips.find({"_id": {"$in": pending_ids}})
    
    enhanced_invites = []
    for trip_doc in trips_cursor:
        enhanced_trip = enhance_trip_data(db, trip_doc)
        
        invite_info = {
            "id": enhanced_trip["_id"],
            "trip_id": enhanced_trip["_id"],
            "trip_name": enhanced_trip["title"],
            "title": enhanced_trip["title"],
            "owner_username": enhanced_trip["owner_username"],
            "destination": enhanced_trip.get("destination"),
            "arrival": enhanced_trip.get("arrival"),
            "departure": enhanced_trip.get("departure"),
        }
        enhanced_invites.append(invite_info)

    return jsonify(enhanced_invites), 200


@trips_bp.route('/<trip_id>/accept-invite', methods=['POST'])
@jwt_required()
def accept_trip_invite(trip_id):
    db = current_app.db
    current_user_id = get_user_object_id()

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    user_doc = db.users.find_one({"_id": current_user_id})
    if not user_doc:
        return jsonify({"error": "User not found"}), 404

    if trip_obj_id not in user_doc.get("pending_invitations", []):
        return jsonify({"error": "No pending invite for this trip"}), 403

    db.trips.update_one(
        {"_id": trip_obj_id},
        {"$addToSet": {"members": current_user_id}}
    )

    db.users.update_one(
        {"_id": current_user_id},
        {"$pull": {"pending_invitations": trip_obj_id}}
    )

    return jsonify({"message": "Trip invite accepted"}), 200

@trips_bp.route("/<trip_id>", methods=["GET"])
@jwt_required()
def get_trip(trip_id):
    db = current_app.db
    user_id = get_user_object_id()
    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    return jsonify(enhance_trip_data(db, trip))


@trips_bp.route("/my-trips", methods=["GET"])
@jwt_required()
def get_user_trips():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    trips = list(db.trips.find({"members": user_id}).sort("arrival", 1))
    return jsonify([enhance_trip_data(db, trip) for trip in trips])


@trips_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    now_iso = datetime.utcnow().isoformat()
    
    all_trips_cursor = db.trips.find({"members": user_id})
    all_trips = list(all_trips_cursor)
    
    upcoming = [t for t in all_trips if t["arrival"] > now_iso]
    active = [t for t in all_trips if t["arrival"] <= now_iso and t["departure"] >= now_iso]
    past = [t for t in all_trips if t["departure"] < now_iso]
    
    owned = [t for t in all_trips if t.get("created_by") == user_id]
    
    return jsonify({
        "total_trips": len(all_trips),
        "upcoming_trips": len(upcoming),
        "active_trips": len(active),
        "past_trips": len(past),
        "owned_trips": len(owned),
        "member_trips": len(all_trips) - len(owned)
    })
