from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO  # Import SocketIO
from amadeus import Client

# Initialize SocketIO globally, but without the app instance yet.
# This instance will be initialized with the app inside create_app().
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

    try:
        app.amadeus = Client(
            client_id=os.getenv("AMADEUS_CLIENT_ID"),
            client_secret=os.getenv("AMADEUS_CLIENT_SECRET"),
        )
    except Exception as e:
        print(f"Failed to initialize Amadeus client: {e}")
        app.amadeus = None
        
    # Apply CORS globally for HTTP requests
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    jwt = JWTManager(app)

    # Initialize SocketIO with the Flask app here with proper configuration
    socketio.init_app(
        app, 
        cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        async_mode='threading',  # Specify async mode
        logger=True,  # Enable logging for debugging
        engineio_logger=True,  # Enable engine.io logging
        transports=['polling', 'websocket'],  # Support both transports
        allow_upgrades=True,
        ping_timeout=60,
        ping_interval=25
    )
    
    # Store socketio instance in app.extensions for access in other modules
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
    from .routes.booking import booking_bp

    # CRUCIAL: Import the sockets module to register namespace handlers
    # This must come AFTER socketio.init_app() so the socketio instance is ready
    from .routes import sockets

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(booking_bp, url_prefix="/api/booking")

    # Add some debug event handlers (optional, for troubleshooting)
    @socketio.on("connect")
    def handle_connect():
        print(f"🔌 Client connected to main namespace: {request.sid}")

    @socketio.on("disconnect")
    def handle_disconnect():
        print(f"🔌 Client disconnected from main namespace: {request.sid}")

    # Return both the Flask app and the global socketio instance
    return app, socketio