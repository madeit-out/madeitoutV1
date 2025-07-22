import os
from dotenv import load_dotenv

# Load variables from .env into environment
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")  # fallback for dev
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/madeitout")
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    MONGO_URI = "mongodb://localhost:27017/test_madeitout"
