from flask import Flask


def _any_route_with_prefix(app: Flask, prefix: str) -> bool:
    """
    Helper: check if any registered route starts with the given prefix.
    """
    return any(rule.rule.startswith(prefix) for rule in app.url_map.iter_rules())


def test_blueprints_registered(app):
    """
    Ensure core blueprints are registered.

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
    Ensure API prefixes are present in the URL map.
    """
    assert _any_route_with_prefix(app, "/api/auth")
    assert _any_route_with_prefix(app, "/api/trips")
    assert _any_route_with_prefix(app, "/api/events")
    assert _any_route_with_prefix(app, "/api/booking")


def test_auth_register_does_not_500(client):
    """
    Smoke test: posting to the auth register route should not 500.

    We don't care about specific response body or status code here,
    just that the endpoint is wired correctly and handled gracefully
    (4xx is fine if validation fails).
    """
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "password123"},
    )

    # Any non-500 status is acceptable for this smoke test
    assert response.status_code != 500
