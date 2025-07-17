from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import Bcrypt
from ..models.user import User
import jwt, datetime, os
from flask import current_app

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = current_app.db
    bcrypt = current_app.extensions['bcrypt']  # ← Fix: get bcrypt here
    data = request.get_json()

    if db.users.find_one({'email': data['email']}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password=hashed_pw)
    db.users.insert_one(new_user.to_dict())

    return jsonify({"message": "User registered successfully"}), 201



@auth_bp.route('/login', methods=['POST'])
def login():
    db = current_app.db
    bcrypt = current_app.extensions['bcrypt']

    data = request.get_json()

    user = db.users.find_one({'email': data['email']})
    if not user or not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": str(user['_id']),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, os.getenv("SECRET_KEY"), algorithm="HS256")

    return jsonify({"token": token}), 200
