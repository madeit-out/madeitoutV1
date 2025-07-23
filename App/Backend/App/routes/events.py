from flask import Blueprint, request, jsonify, current_app, session
from flask_cors import cross_origin
from bson import ObjectId, errors

events_bp = Blueprint('events', __name__)

# Same pattern as trips.py
def get_current_user_id():
    user_id = session.get('user_id')
    if not user_id:
        return None
    try:
        return ObjectId(user_id)
    except errors.InvalidId:
        return None


@events_bp.route('/<trip_id>', methods=['POST'])
@cross_origin(origin='http://localhost:5173')
def create_event(trip_id):
    db = current_app.db
    user_id = get_current_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not title or not start_time or not end_time:
        return jsonify({"error": "Missing required fields"}), 400

    event = {
        "trip_id": ObjectId(trip_id),
        "title": title,
        "description": description,
        "location": location,
        "start_time": start_time,
        "end_time": end_time,
        "created_by": user_id
    }

    result = db.events.insert_one(event)
    event["_id"] = str(result.inserted_id)
    event["trip_id"] = trip_id
    event["created_by"] = str(user_id)

    return jsonify({"message": "Event created", "event": event}), 201


@events_bp.route('/<trip_id>', methods=['GET'])
@cross_origin(origin='http://localhost:5173')
def get_trip_events(trip_id):
    db = current_app.db
    user_id = get_current_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid trip ID"}), 400

    events = list(db.events.find({"trip_id": trip_obj_id}).sort("start_time", 1))
    for event in events:
        event["_id"] = str(event["_id"])
        event["trip_id"] = str(event["trip_id"])
        event["created_by"] = str(event["created_by"])
    return jsonify(events)


@events_bp.route('/event/<event_id>', methods=['PUT'])
@cross_origin(origin='http://localhost:5173')
def update_event(event_id):
    db = current_app.db
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    update_fields = {
        k: v for k, v in data.items()
        if k in ["title", "description", "location", "start_time", "end_time"]
    }

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    db.events.update_one({"_id": event_obj_id}, {"$set": update_fields})
    return jsonify({"message": "Event updated"})


@events_bp.route('/event/<event_id>', methods=['DELETE'])
@cross_origin(origin='http://localhost:5173')
def delete_event(event_id):
    db = current_app.db
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        event_obj_id = ObjectId(event_id)
    except errors.InvalidId:
        return jsonify({"error": "Invalid event ID"}), 400

    db.events.delete_one({"_id": event_obj_id})
    return jsonify({"message": "Event deleted"})
