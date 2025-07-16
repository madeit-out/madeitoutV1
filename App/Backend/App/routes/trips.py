from flask import Blueprint, request, jsonify, current_app
from ..models.trip import Trip
from bson import ObjectId
import jwt

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('/', methods=['POST'])
def create_trip():
    db = current_app.db
    data = request.get_json()
    trip = Trip(
        title=data['title'],
        created_by=data['created_by'],
        arrival=data['arrival'],
        departure=data['departure'],
        members=[ObjectId(uid) for uid in data.get('members', [])]
    )
    db.trips.insert_one(trip.to_dict())
    return jsonify({"message": "Trip created successfully"}), 201

@trips_bp.route('/<trip_id>', methods=['GET'])
def get_trip(trip_id):
    db = current_app.db
    trip = db.trips.find_one({'_id': ObjectId(trip_id)})
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    trip["_id"] = str(trip["_id"])
    trip["members"] = [str(mid) for mid in trip.get("members", [])]
    return jsonify(trip)

@trips_bp.route('/user/<user_id>', methods=['GET'])
def get_user_trips(user_id):
    db = current_app.db
    trips = list(db.trips.find({"members": ObjectId(user_id)}))
    for t in trips:
        t["_id"] = str(t["_id"])
        t["members"] = [str(uid) for uid in t.get("members", [])]
    return jsonify(trips)

@trips_bp.route('/<trip_id>/add-user', methods=['POST'])
def add_user_to_trip(trip_id):
    db = current_app.db
    user_id = request.json.get('user_id')
    db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$addToSet": {"members": ObjectId(user_id)}}
    )
    return jsonify({"message": "User added to trip"})
