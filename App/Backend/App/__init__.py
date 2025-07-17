from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

def create_app():
    load_dotenv()
    app = Flask(__name__)
    
    # Set config from environment
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Initialize extensions
    CORS(app)
    bcrypt = Bcrypt(app)
    app.bcrypt = bcrypt 
    app.extensions['bcrypt'] = bcrypt  # Make bcrypt accessible app-wide

    # Initialize DB
    client = MongoClient(app.config["MONGO_URI"])
    app.db = client["made_it_out"]

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.trips import trips_bp
    from .routes.events import events_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")

    return app
