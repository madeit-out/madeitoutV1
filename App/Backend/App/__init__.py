from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # MongoDB config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    client = MongoClient(app.config["MONGO_URI"])
    app.db = client["made_it_out"]

    from .routes.trips import trips_bp
    app.register_blueprint(trips_bp, url_prefix="/api/trips")

    return app
