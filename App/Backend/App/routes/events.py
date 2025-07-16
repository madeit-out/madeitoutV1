from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from models.event import Event

events_bp = Blueprint('events', __name__)

@events_bp.route('/trip/<trip_id>', methods=['POST'])
def create_event(trip_id):
    db = current_app.db
    data = request.get_json()
    event = Event(
        trip_id=trip_id,
        title=data['title'],
        location=data['location'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        created_by=data['created_by'],
        type=data.get('type', 'activity'),
        notes=data.get('notes', '')
    )
    db.events.insert_one(event.to_dict())
    return jsonify({"message": "Event created"}), 201

@events_bp.route('/trip/<trip_id>', methods=['GET'])
def get_events_for_trip(trip_id):
    db = current_app.db
    events = list(db.events.find({"trip_id": ObjectId(trip_id)}))
    for e in events:
        e["_id"] = str(e["_id"])
        e["trip_id"] = str(e["trip_id"])
        e["created_by"] = str(e["created_by"])
    return jsonify(events)
