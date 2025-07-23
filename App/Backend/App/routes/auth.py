from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.user import User
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()

    if not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing fields"}), 400

    email = data["email"].lower().strip()

    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(username=data["username"], email=email, password=hashed_pw)
    result = db.users.insert_one(new_user.to_dict())

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    db = current_app.db
    bcrypt = current_app.extensions["bcrypt"]
    data = request.get_json()

    if not all(k in data for k in ("email", "password")):
        return jsonify({"error": "Missing fields"}), 400

    email = data["email"].lower().strip()
    user = db.users.find_one({"email": email})

    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user["_id"]))

    return (
        jsonify(
            {
                "access_token": access_token,
                "user": {
                    "id": str(user["_id"]),
                    "username": user["username"],
                    "email": user["email"],
                },
            }
        ),
        200,
    )


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # JWT is stateless; "logout" can be handled on frontend or using token revocation
    return jsonify({"message": "Logout handled on client"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    db = current_app.db
    user_id = get_jwt_identity()

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return (
        jsonify(
            {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
            }
        ),
        200,
    )
