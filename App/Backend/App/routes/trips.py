from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors

trips_bp = Blueprint("trips", __name__)


def get_user_object_id():
    identity = get_jwt_identity()  # this should be your user_id as string
    try:
        return ObjectId(identity)
    except errors.InvalidId:
        return None


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
    }

    result = db.trips.insert_one(trip_data)

    trip_data["_id"] = str(result.inserted_id)
    trip_data["owner"] = str(user_id)
    trip_data["members"] = [str(m) for m in members]

    return jsonify({"message": "Trip created successfully", "trip": trip_data}), 201


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

    trip["_id"] = str(trip["_id"])
    trip["members"] = [str(mid) for mid in trip.get("members", [])]
    trip["owner"] = str(trip["owner"])
    return jsonify(trip)


@trips_bp.route("/my-trips", methods=["GET"])
@jwt_required()
def get_user_trips():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    trips = list(db.trips.find({"members": user_id}))
    for t in trips:
        t["_id"] = str(t["_id"])
        t["members"] = [str(uid) for uid in t.get("members", [])]
        t["owner"] = str(t["owner"])
    return jsonify(trips)


@trips_bp.route("/<trip_id>/add-user", methods=["POST"])
@jwt_required()
def add_user_to_trip(trip_id):
    db = current_app.db
    current_user = get_user_object_id()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    user_id_str = request.json.get("user_id")
    if not user_id_str:
        return jsonify({"error": "Missing user_id"}), 400

    try:
        user_id = ObjectId(user_id_str)
    except errors.InvalidId:
        return jsonify({"error": "Invalid user_id"}), 400

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    update_result = db.trips.update_one(
        {"_id": trip_obj_id}, {"$addToSet": {"members": user_id}}
    )

    if update_result.matched_count == 0:
        return jsonify({"error": "Trip not found"}), 404

    return jsonify({"message": "User added to trip"})
