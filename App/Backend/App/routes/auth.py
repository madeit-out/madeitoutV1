from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.user import User
from bson import ObjectId

# Assuming the User class is in a models file
from ..models.user import User
from ..routes.trips import Trip
# For demonstration, assume the updated User class from the previous step is available
# (User class definition would be here or imported)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()

    if not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing required fields"}), 400

    email = data["email"].lower().strip()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(username=data["username"], email=email, password=hashed_pw)
    
    db.users.insert_one(new_user.to_mongo_dict())

    access_token = create_access_token(identity=str(new_user._id))

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": new_user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()

    if not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing required fields"}), 400

    email = data["email"].lower().strip()
    user_data = db.users.find_one({"email": email})

    if not user_data or not bcrypt.check_password_hash(user_data["password"], data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    user = User.from_dict(user_data)
    access_token = create_access_token(identity=str(user._id))

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    db = current_app.db
    user_id = get_jwt_identity()

    user_data = db.users.find_one({"_id": ObjectId(user_id)})
    if not user_data:
        return jsonify({"error": "User not found"}), 404

    user = User.from_dict(user_data)

    # Make sure trip IDs are ObjectIds
    try:
        pending_trip_ids = [ObjectId(tid) for tid in (user.pending_invitations or [])]
    except Exception:
        return jsonify({"error": "Invalid trip ID in pending invitations"}), 400

    pending_trips = list(db.trips.find({"_id": {"$in": pending_trip_ids}}))

    invite_details = []
    for trip in pending_trips:
        creator = db.users.find_one({"_id": trip.get("created_by")})
        invite_details.append({
            "_id": str(trip["_id"]),
            "title": trip.get("title"),
            "destination": trip.get("destination"),
            "start_date": trip.get("start_date").isoformat() if trip.get("start_date") else None,
            "end_date": trip.get("end_date").isoformat() if trip.get("end_date") else None,
            "created_by": str(trip.get("created_by")),
            "created_by_username": creator.get("username", "Unknown") if creator else "Unknown"
        })

    user_json = user.to_dict()
    user_json["pending_invite_details"] = invite_details

    return jsonify(user_json), 200




@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    """Updates the current user's profile information."""
    db = current_app.db
    user_id = get_jwt_identity()
    data = request.get_json()

    # Whitelist the fields that are allowed to be updated
    allowed_fields = ["username", "bio", "profile_picture_url"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({"error": "No fields to update provided"}), 400

    # If username is being updated, check for uniqueness
    if "username" in update_fields:
        existing_user = db.users.find_one({
            "username": update_fields["username"],
            "_id": {"$ne": ObjectId(user_id)}
        })
        if existing_user:
            return jsonify({"error": "Username is already taken"}), 409

    # Update the user document in the database
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    # Fetch and return the updated user profile
    updated_user_data = db.users.find_one({"_id": ObjectId(user_id)})
    user = User.from_dict(updated_user_data)

    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logout handled on client"}), 200