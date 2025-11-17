from flask import Flask


def _any_route_with_prefix(app: Flask, prefix: str) -> bool:
    """
    Helper: check if any registered route starts with a prefix.
    """
    return any(rule.rule.startswith(prefix) for rule in app.url_map.iter_rules())


def test_blueprints_registered(app):
    """
    Ensure the main blueprints are registered.

    This assumes in your route files you did something like:
        auth_bp = Blueprint("auth", __name__)
        trips_bp = Blueprint("trips", __name__)
        events_bp = Blueprint("events", __name__)
        booking_bp = Blueprint("booking", __name__)
    """
    assert "auth" in app.blueprints
    assert "trips" in app.blueprints
    assert "events" in app.blueprints
    assert "booking" in app.blueprints


def test_api_route_prefixes_exist(app):
    """
    Make sure the expected API prefixes are in the URL map.
    """
    assert _any_route_with_prefix(app, "/api/auth")
    assert _any_route_with_prefix(app, "/api/trips")
    assert _any_route_with_prefix(app, "/api/events")
    assert _any_route_with_prefix(app, "/api/booking")


def test_auth_register_does_not_500(client):
    """
    Smoke test: POST to /api/auth/register should not 500.

    4xx responses are OK here if validation fails; goal is
    to prove the route is wired and handled.
    """
    resp = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )

    assert resp.status_code != 500
