from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

# Initialize SocketIO globally, but without the app instance yet.
socketio = SocketIO()

def create_app():
    load_dotenv()
    app = Flask(__name__)

    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.secret_key = os.environ.get("SECRET_KEY") or "super-secret-key"

    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = (
        False  # Use True in production, False for local dev
    )
    app.config["SESSION_TYPE"] = "filesystem"  # This stores sessions on disk
    app.config["SESSION_PERMANENT"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # add to .env

    # Apply CORS globally for HTTP requests
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    jwt = JWTManager(app)

    # Initialize SocketIO with the Flask app here
    socketio.init_app(
        app, cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
    )
    app.extensions["socketio"] = socketio

    # Bcrypt init
    bcrypt = Bcrypt(app)
    app.bcrypt = bcrypt
    app.extensions["bcrypt"] = bcrypt

    # Mongo init
    client = MongoClient(app.config["MONGO_URI"])
    app.db = client["made_it_out"]

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.trips import trips_bp
    from .routes.events import events_bp

    # Import sockets module to bind events
    from .routes import sockets

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")

    # Return both the Flask app and the global socketio instance
    return app, socketio
