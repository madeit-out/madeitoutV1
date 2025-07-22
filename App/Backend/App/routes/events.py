from datetime import datetime
from collections import defaultdict
from flask import jsonify, request, current_app
from bson import ObjectId
from .auth import get_current_user_id  # adjust if needed

# 🗓️ Get full trip itinerary grouped by date
@trips_bp.route('/<trip_id>/itinerary', methods=['GET'])
def get_trip_itinerary(trip_id):
    db = current_app.db
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
    except:
        return jsonify({"error": "Invalid trip ID"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    events_cursor = db.events.find({"trip_id": trip_obj_id}).sort("datetime", 1)
    
    itinerary = defaultdict(list)
    for event in events_cursor:
        event_date = datetime.fromisoformat(event["datetime"]).date().isoformat()
        itinerary[event_date].append({
            "_id": str(event["_id"]),
            "title": event["title"],
            "datetime": event["datetime"],
            "description": event.get("description", ""),
            "location": event.get("location", "")
        })

    itinerary_sorted = [{"date": date, "events": itinerary[date]} for date in sorted(itinerary.keys())]

    return jsonify({
        "trip_id": trip_id,
        "title": trip["title"],
        "itinerary": itinerary_sorted
    })

# ➕ Add an event to a trip
@trips_bp.route('/<trip_id>/events', methods=['POST'])
def add_event_to_trip(trip_id):
    db = current_app.db
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    datetime_str = data.get("datetime")
    description = data.get("description", "")
    location = data.get("location", "")

    if not title or not datetime_str:
        return jsonify({"error": "Missing title or datetime"}), 400

    try:
        trip_obj_id = ObjectId(trip_id)
        datetime.fromisoformat(datetime_str)
    except:
        return jsonify({"error": "Invalid input"}), 400

    event_data = {
        "trip_id": trip_obj_id,
        "title": title,
        "datetime": datetime_str,
        "description": description,
        "location": location
    }

    result = db.events.insert_one(event_data)
    event_data["_id"] = str(result.inserted_id)

    return jsonify({"message": "Event added", "event": event_data}), 201

# ❌ Delete an event from a trip
@trips_bp.route('/<trip_id>/events/<event_id>', methods=['DELETE'])
def delete_event_from_trip(trip_id, event_id):
    db = current_app.db
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        trip_obj_id = ObjectId(trip_id)
        event_obj_id = ObjectId(event_id)
    except:
        return jsonify({"error": "Invalid ID(s)"}), 400

    trip = db.trips.find_one({"_id": trip_obj_id})
    if not trip or user_id not in trip.get("members", []):
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    result = db.events.delete_one({
        "_id": event_obj_id,
        "trip_id": trip_obj_id
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Event not found or not deleted"}), 404

    return jsonify({"message": "Event deleted successfully"}), 200
