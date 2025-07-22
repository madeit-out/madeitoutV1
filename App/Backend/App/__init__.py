from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

def create_app():
    load_dotenv()
    app = Flask(__name__)
    
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False

    # Apply CORS globally - this is the key fix
    CORS(app, supports_credentials=True,  # ✅ Fixed indentation
         origins=["http://localhost:5173"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=[
             "Content-Type", 
             "Authorization", 
             "Access-Control-Allow-Credentials",
             "Access-Control-Allow-Origin"
         ],
         expose_headers=["Content-Type", "Authorization",'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true'])

    # Bcrypt init
    bcrypt = Bcrypt(app)
    app.bcrypt = bcrypt 
    app.extensions['bcrypt'] = bcrypt

    # Mongo init
    client = MongoClient(app.config["MONGO_URI"])
    app.db = client["made_it_out"]

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.trips import trips_bp
    from .routes.events import events_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(trips_bp, url_prefix="/api/trips")
    app.register_blueprint(events_bp, url_prefix="/api/events")

    return app