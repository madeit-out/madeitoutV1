from flask import Blueprint, request, jsonify, current_app, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.user import User
from bson import ObjectId
import os
import requests  # <-- FIX: Add this import
from ..models.user import User
from ..routes.trips import Trip

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()

    if not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing required fields"}), 400

    email = data["email"].lower().strip()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(username=data["username"], email=email, password=hashed_pw)

    db.users.insert_one(new_user.to_mongo_dict())

    access_token = create_access_token(identity=str(new_user._id))

    return (
        jsonify(
            {
                "message": "User registered successfully",
                "access_token": access_token,
                "user": new_user.to_dict(),
            }
        ),
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()
    email = data.get("email").lower().strip()
    password = data.get("password").strip()

    user_data = db.users.find_one({"email": email})
    if not user_data:
        return jsonify({"error": "Invalid email or password"}), 401

    user = User.from_dict(user_data)
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user._id))

    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    db = current_app.db
    user_id = get_jwt_identity()
    user_data = db.users.find_one({"_id": ObjectId(user_id)})
    if not user_data:
        return jsonify({"error": "User not found"}), 404

    user = User.from_dict(user_data)
    user_json = user.to_dict()

    # Find pending invites for this user
    pending_invites = db.trips.find({"pending_invitations": ObjectId(user_id)})
    pending_invite_details = []

    for trip in pending_invites:
        # **FIX: Add a safety check for the trip owner**
        inviter_user = db.users.find_one({"_id": trip.get("owner")}, {"username": 1})
        inviter_username = (
            inviter_user.get("username") if inviter_user else "Unknown User"
        )

        pending_invite_details.append(
            {
                "trip_id": str(trip["_id"]),
                "trip_title": trip.get("title", "Untitled Trip"),
                "inviter_username": inviter_username,
            }
        )

    user_json["pending_invite_details"] = pending_invite_details
    return jsonify(user_json), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    db = current_app.db
    user_id = get_jwt_identity()
    data = request.get_json()
    allowed_fields = ["username", "bio", "profile_picture_url"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}
    if not update_fields:
        return jsonify({"error": "No fields to update provided"}), 400
    if "username" in update_fields:
        existing_user = db.users.find_one(
            {"username": update_fields["username"], "_id": {"$ne": ObjectId(user_id)}}
        )
        if existing_user:
            return jsonify({"error": "Username is already taken"}), 409
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    updated_user_data = db.users.find_one({"_id": ObjectId(user_id)})
    user = User.from_dict(updated_user_data)
    return jsonify({"message": "Profile updated successfully", "user": user.to_dict()})


# Google OAuth Routes
@auth_bp.route("/google_login")
def google_login():
    google_discovery_url = current_app.google_discovery_url
    google_provider_cfg = requests.get(google_discovery_url).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    request_uri = current_app.google_oauth_client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@auth_bp.route("/google_login/callback")
def google_login_callback():
    db = current_app.db
    code = request.args.get("code")
    google_discovery_url = current_app.google_discovery_url
    google_provider_cfg = requests.get(google_discovery_url).json()
    token_endpoint = google_provider_cfg["token_endpoint"]
    token_response = current_app.google_oauth_client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code,
    )
    token_response = requests.post(
        token_response[0],
        headers=token_response[1],
        data=token_response[2],
        auth=(
            current_app.config["GOOGLE_CLIENT_ID"],
            current_app.config["GOOGLE_CLIENT_SECRET"],
        ),
    )
    current_app.google_oauth_client.parse_request_body_response(token_response.text)
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = current_app.google_oauth_client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers).json()
    if userinfo_response.get("email_verified"):
        email = userinfo_response["email"]
        username = userinfo_response.get("given_name", email.split("@")[0])
        existing_user = db.users.find_one({"email": email})
        if not existing_user:
            new_user = User(username=username, email=email, password=None)
            db.users.insert_one(new_user.to_mongo_dict())
            user_id = new_user._id
        else:
            user_id = existing_user["_id"]
        access_token = create_access_token(identity=str(user_id))
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
        return redirect(f"{frontend_url}/auth/callback?token={access_token}")
    return jsonify({"error": "Failed to authenticate with Google"}), 400
