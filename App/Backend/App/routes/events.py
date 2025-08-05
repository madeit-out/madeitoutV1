from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime
from ..models.event import Event # Make sure Event model is imported

events_bp = Blueprint("events", __name__)

def get_user_object_id():
    """Helper to get the current user's ID as an ObjectId."""
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
    data["created_by"] = user_id

    try:
        trip_obj_id = ObjectId(data.get("trip_id"))
        event = Event.from_dict(data)
    except (KeyError, TypeError):
        return jsonify({"error": "Missing required fields"}), 400
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID format"}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id, "members": user_id})
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    # Insert the database-ready dictionary
    db.events.insert_one(event.to_dict())

    # Use the to_json() method for the API response to convert ObjectIds
    return jsonify({
        "message": "Event created",
        "event": event.to_json() 
    }), 201

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

    events_from_db = list(db.events.find({"trip_id": trip_obj_id}).sort("start_time", 1))
    
    # FIX: Use the .to_json() method to ensure all ObjectIds are strings
    events_list = [Event.from_dict(event).to_json() for event in events_from_db]

    return jsonify(events_list)

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
        if k in ["title", "notes", "location", "start_time", "end_time", "type", "cost", "status"]
    }

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    db.events.update_one({"_id": event_obj_id}, {"$set": update_fields})

    return jsonify({"message": "Event updated successfully"})

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

    db.events.delete_one({"_id": event_obj_id})

    return jsonify({"message": "Event deleted successfully"})
