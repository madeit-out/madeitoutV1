from flask import Blueprint, request, jsonify

trips_bp = Blueprint('trips', __name__)

@trips_bp.route("/", methods=["GET"])
def list_trips():
    # example static data, will replace with Mongo later
    trips = [
        {"trip_id": 1, "location": "Tulum", "departure": "2025-07-01", "arrival": "2025-07-07"},
    ]
    return jsonify(trips)

@trips_bp.route("/", methods=["POST"])
def create_trip():
    data = request.get_json()
    # Save to MongoDB in later steps
    return jsonify({"message": "Trip created", "data": data}), 201
