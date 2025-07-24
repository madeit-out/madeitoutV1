from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime

events_bp = Blueprint("events", __name__)

def get_user_object_id():
    identity = get_jwt_identity()
    try:
        return ObjectId(identity)
    except errors.InvalidId:
        return None


@events_bp.route("/<trip_id>", methods=["POST"])
@jwt_required()
def create_event(trip_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    description = data.get("description", "")
    location = data.get("location", "")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if not title or not start_time or not end_time:
        return jsonify({"error": "Missing required fields"}), 400

    # Validate dates (ISO format)
    try:
        start_time_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_time_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Check trip exists and user is a member
    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    event = {
        "trip_id": trip_obj_id,
        "title": title,
        "description": description,
        "location": location,
        "start_time": start_time_dt.isoformat(),
        "end_time": end_time_dt.isoformat(),
        "created_by": user_id,
        "created_at": datetime.utcnow().isoformat()
    }

    result = db.events.insert_one(event)

    event["_id"] = str(result.inserted_id)
    event["trip_id"] = str(trip_obj_id)
    event["created_by"] = str(user_id)

    return jsonify({"message": "Event created", "event": event}), 201


@events_bp.route("/<trip_id>", methods=["GET"])
@jwt_required()
def get_trip_events(trip_id):
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

    events = list(db.events.find({"trip_id": trip_obj_id}).sort("start_time", 1))
    for event in events:
        event["_id"] = str(event["_id"])
        event["trip_id"] = str(event["trip_id"])
        event["created_by"] = str(event["created_by"])

    return jsonify(events)


@events_bp.route("/event/<event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    update_fields = {
        k: v for k, v in data.items()
        if k in ["title", "description", "location", "start_time", "end_time"]
    }

    if "start_time" in update_fields or "end_time" in update_fields:
        try:
            if "start_time" in update_fields:
                update_fields["start_time"] = datetime.fromisoformat(update_fields["start_time"].replace('Z', '+00:00')).isoformat()
            if "end_time" in update_fields:
                update_fields["end_time"] = datetime.fromisoformat(update_fields["end_time"].replace('Z', '+00:00')).isoformat()
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    event = db.events.find_one({"_id": event_obj_id})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Check that user is creator or trip member
    trip = db.trips.find_one({"_id": event["trip_id"]})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Unauthorized"}), 401

    db.events.update_one({"_id": event_obj_id}, {"$set": update_fields})

    return jsonify({"message": "Event updated"})


@events_bp.route("/event/<event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    event = db.events.find_one({"_id": event_obj_id})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    trip = db.trips.find_one({"_id": event["trip_id"]})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Unauthorized"}), 401

    db.events.delete_one({"_id": event_obj_id})

    return jsonify({"message": "Event deleted"})
