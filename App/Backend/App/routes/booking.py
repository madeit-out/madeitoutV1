from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from amadeus import ResponseError

booking_bp = Blueprint("booking", __name__)

@booking_bp.route("/search-flights", methods=["GET"])
@jwt_required()
def search_flights():
    """
    Searches for flight offers using the Amadeus API.
    Expects query parameters: origin, destination, departureDate, adults
    """
    amadeus = current_app.amadeus
    if not amadeus:
        return jsonify({"error": "Booking engine is not configured"}), 503

    # --- Get search parameters from the request ---
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    departure_date = request.args.get("departureDate")
    adults = request.args.get("adults", 1) # Default to 1 adult

    if not all([origin, destination, departure_date]):
        return jsonify({"error": "Missing required search parameters"}), 400

    try:
        # --- Call the Amadeus API ---
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=departure_date,
            adults=adults,
            max=10 # Limit to 10 results for performance
        )

        # --- Process and simplify the response ---
        flight_results = []
        for offer in response.data:
            simplified_offer = {
                "id": offer["id"],
                "price": offer["price"]["total"],
                "currency": offer["price"]["currency"],
                "stops": len(offer["itineraries"][0]["segments"]) - 1,
                "departureTime": offer["itineraries"][0]["segments"][0]["departure"]["at"],
                "arrivalTime": offer["itineraries"][0]["segments"][-1]["arrival"]["at"],
                "carrier": offer["itineraries"][0]["segments"][0]["carrierCode"], # Airline code
            }
            flight_results.append(simplified_offer)

        return jsonify(flight_results)

    except ResponseError as error:
        print(f"Amadeus API Error: {error}")
        return jsonify({"error": "Failed to fetch flight data from provider", "details": str(error)}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
