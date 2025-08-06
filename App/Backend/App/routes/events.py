from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime
from ..models.event import Event

events_bp = Blueprint("events", __name__)


def get_user_object_id():
    identity = get_jwt_identity()
    try:
        return ObjectId(identity)
    except (errors.InvalidId, TypeError):
        return None


@events_bp.route("/", methods=["POST"])
@jwt_required()
def create_event():
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data.get("trip_id") or not data.get("title"):
        return jsonify({"error": "Missing trip_id and title"}), 400

    try:
        trip_obj_id = ObjectId(data["trip_id"])
        trip = db.trips.find_one({"_id": trip_obj_id, "members": user_id})
        if not trip:
            return jsonify({"error": "Trip not found or you are not a member"}), 403

        event = Event.from_dict({**data, "created_by": user_id})
        result = db.events.insert_one(event.to_dict())
        created_event = db.events.find_one({"_id": result.inserted_id})
        return jsonify(Event.from_dict(created_event).to_json()), 201
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip_id format"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@events_bp.route("/<trip_id>", methods=["GET"])
@jwt_required()
def get_trip_events(trip_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
        trip = db.trips.find_one({"_id": trip_obj_id, "members": user_id})
        if not trip:
            return jsonify({"error": "Trip not found or unauthorized"}), 404

        events_from_db = list(
            db.events.find({"trip_id": trip_obj_id}).sort("start_time", 1)
        )
        return jsonify([Event.from_dict(e).to_json() for e in events_from_db])
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400


@events_bp.route("/event/<event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    db = current_app.db
    user_id = get_user_object_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    event_to_update = db.events.find_one({"_id": event_obj_id})
    if not event_to_update:
        return jsonify({"error": "Event not found"}), 404

    trip = db.trips.find_one({"_id": event_to_update["trip_id"], "members": user_id})
    if not trip:
        return jsonify({"error": "You do not have permission to edit this event"}), 403

    data = request.get_json()
    update_fields = {
        k: v
        for k, v in data.items()
        if k
        in [
            "title",
            "notes",
            "location",
            "start_time",
            "end_time",
            "type",
            "cost",
            "status",
        ]
    }

    if not update_fields:
        return jsonify({"error": "No update fields provided"}), 400

    db.events.update_one({"_id": event_obj_id}, {"$set": update_fields})
    updated_event = db.events.find_one({"_id": event_obj_id})
    return jsonify(Event.from_dict(updated_event).to_json())


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

    event_to_delete = db.events.find_one({"_id": event_obj_id})
    if not event_to_delete:
        return jsonify({"message": "Event already deleted"}), 200

    trip = db.trips.find_one({"_id": event_to_delete["trip_id"], "members": user_id})
    if not trip:
        return (
            jsonify({"error": "You do not have permission to delete this event"}),
            403,
        )

    db.events.delete_one({"_id": event_obj_id})
    return jsonify({"message": "Event deleted successfully"})
