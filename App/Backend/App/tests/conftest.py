import os
import sys
import pytest

# === Make sure 'App' can be imported ===
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
# BACKEND_ROOT now points to: .../App/Backend

if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from App import create_app  # App/__init__.py must define create_app


@pytest.fixture(scope="session")
def app():
    """
    Create a Flask app configured for testing.
    """
    # Your factory returns (app, socketio)
    app, socketio = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture()
def client(app):
    """
    Flask test client for making HTTP requests.
    """
    return app.test_client()
