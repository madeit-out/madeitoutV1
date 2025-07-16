from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    client = MongoClient(app.config["MONGO_URI"])
    app.db = client["made_it_out"]

    # Blueprints
    from .routes.auth import auth_bp
    from .routes.trips import trips_bp
    from .routes.events import events_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")

    return app
