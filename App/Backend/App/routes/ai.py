from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from .. import limiter
import os
import requests

ai_bp = Blueprint("ai", __name__)

DEFAULT_GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.6-flash:generateContent"
)


@ai_bp.route("/itinerary", methods=["POST"])
@jwt_required()
@limiter.limit("20 per minute")
def generate_itinerary():
    """
    Proxies a chat turn to Gemini on the server, so the API key never
    ships in the frontend bundle. Takes the same {prompt, history} shape
    CreateTrip.jsx already builds and returns the same {candidates: [...]}
    shape it already parses.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        current_app.logger.error("GEMINI_API_KEY is not set")
        return jsonify({"error": "AI service is not configured"}), 503

    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt")
    history = data.get("history", [])

    if not prompt or not isinstance(prompt, str):
        return jsonify({"error": "A 'prompt' string is required"}), 400
    if not isinstance(history, list):
        return jsonify({"error": "'history' must be a list"}), 400

    formatted_history = [
        {"role": msg.get("role"), "parts": [{"text": msg.get("text", "")}]}
        for msg in history
        if isinstance(msg, dict)
    ]

    payload = {
        "contents": formatted_history + [{"role": "user", "parts": [{"text": prompt}]}]
    }

    api_url = os.getenv("GEMINI_API_URL", DEFAULT_GEMINI_API_URL)

    try:
        response = requests.post(
            api_url,
            params={"key": api_key},
            json=payload,
            timeout=30,
        )
    except requests.RequestException as e:
        current_app.logger.error(f"Gemini request failed: {e}")
        return jsonify({"error": "Failed to reach the AI service"}), 502

    if not response.ok:
        try:
            error_body = response.json()
            message = error_body.get("error", {}).get(
                "message", "The AI service returned an error."
            )
        except ValueError:
            message = "The AI service returned an error."
        return jsonify({"error": message}), response.status_code

    return jsonify(response.json()), 200
