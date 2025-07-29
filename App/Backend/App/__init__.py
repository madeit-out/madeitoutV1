from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO  # Import SocketIO

# Initialize SocketIO globally, but without the app instance yet.
# This instance will be initialized with the app inside create_app().
socketio = SocketIO()


# --- NEW GLOBAL CHAT MESSAGE LISTENER START ---
@socketio.on("chat message")  # Catches the specific 'chat message' event globally
def handle_global_chat_message(data):
    print(
        f"SocketIO Debug: GLOBAL listener received 'chat message' event with data: {data}"
    )
    # You would typically not process the message here if using a namespace,
    # but for debugging, this confirms reception.


# --- NEW GLOBAL CHAT MESSAGE LISTENER END ---


@socketio.on("message")  # Catches generic 'message' events
def handle_message(data):
    print(f"SocketIO Debug: GLOBAL 'message' event received: {data}")


@socketio.on("json")  # Catches generic 'json' events
def handle_json(data):
    print(f"SocketIO Debug: GLOBAL 'json' event received: {data}")


@socketio.on_error()  # Catches errors during event handling
def error_handler(e):
    print(f"SocketIO Debug: GLOBAL error handler caught: {e}")


@socketio.on_error_default  # Catches errors for unhandled events
def default_error_handler(e):
    print(f"SocketIO Debug: GLOBAL default error handler caught: {e}")


@socketio.on("*")  # Catches ALL events (including custom ones like 'chat message')
def catch_all(event, sid, *args, **kwargs):
    print(
        f"SocketIO Debug: GLOBAL CATCH-ALL event: '{event}' from SID: {sid}, Args: {args}, Kwargs: {kwargs}"
    )


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
    # This associates the global socketio instance with the app.
    socketio.init_app(
        app, cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
    )
    # Store socketio instance in app.extensions for access in other modules
    app.extensions["socketio"] = socketio  # Now storing the global instance

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

    # CRUCIAL: Simply import the sockets module here.
    # This import will cause the module to be executed, and its @socketio.on decorators
    # (or socketio.on_namespace call) will bind to the global 'socketio' instance initialized above.
    from .routes import sockets  # Just import the module, no specific function/class

    # END CRUCIAL SECTION

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")

    # Return both the Flask app and the global socketio instance
    return app, socketio
