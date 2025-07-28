# routes/sockets.py

from flask import request, current_app
from flask_socketio import Namespace, join_room, leave_room, emit
from flask_jwt_extended import decode_token
from bson import ObjectId, errors
from datetime import datetime

# Import the global socketio instance from the main app package
from app import socketio

# Custom JWT authentication decorator for SocketIO
def jwt_socket_required(f):
    def wrapper(self, *args, **kwargs):
        try:
            token = request.args.get("token")
            if not token:
                self.emit(
                    "error",
                    {"message": "Authentication token missing."},
                    room=request.sid,
                )
                return False

            decoded_token = decode_token(token)
            user_id = decoded_token["sub"]
            request.sid_data = {"user_id": user_id}
            return f(self, *args, **kwargs)
        except Exception as e:
            print(f"SocketIO authentication failed: {e}")
            self.emit(
                "error", {"message": "Authentication failed."}, room=request.sid
            )
            return False
    return wrapper

# Define a SocketIO Namespace for trip chat events
class TripChatNamespace(Namespace):
    def on_connect(self):
        user_id = getattr(request, "sid_data", {}).get("user_id", "anonymous")
        print(f"Client connected: {request.sid}, User ID: {user_id}")

    def on_disconnect(self):
        user_id = getattr(request, "sid_data", {}).get("user_id", "anonymous")
        print(f"Client disconnected: {request.sid}, User ID: {user_id}")

    @jwt_socket_required
    def on_joinTripRoom(self, trip_id):
        db = current_app.db
        user_id = request.sid_data["user_id"]

        try:
            trip_obj_id = ObjectId(trip_id)
            user_obj_id = ObjectId(user_id)
        except errors.InvalidId:
            self.emit("error", {"message": "Invalid ID provided."})
            return

        trip = db.trips.find_one({"_id": trip_obj_id, "members": user_obj_id})
        if not trip:
            self.emit("error", {"message": "Unauthorized to join this trip chat."})
            return

        join_room(trip_id)
        print(f"User {user_id} (SID: {request.sid}) joined trip room: {trip_id}")
        self.emit(
            "status message",
            {"text": f"User {user_id[:8]}... has joined the chat."},
            room=trip_id,
        )

        messages_cursor = db.chat_messages.find({"trip_id": trip_obj_id}).sort(
            "timestamp", 1
        )

        historical_messages = []
        for msg in messages_cursor:
            msg["_id"] = str(msg["_id"])
            msg["trip_id"] = str(msg["trip_id"])
            msg["sender_id"] = str(msg["sender_id"])
            msg["timestamp"] = msg["timestamp"].isoformat()
            historical_messages.append(msg)

        self.emit("historical messages", historical_messages, room=request.sid)

    @jwt_socket_required
    def on_leaveTripRoom(self, trip_id):
        user_id = request.sid_data["user_id"]
        leave_room(trip_id)
        print(f"User {user_id} (SID: {request.sid}) left trip room: {trip_id}")
        self.emit(
            "status message",
            {"text": f"User {user_id[:8]}... has left the chat."},
            room=trip_id,
        )

    @jwt_socket_required
    def on_chat_message(self, data):
        db = current_app.db

        print(f"SocketIO Debug: Received 'chat message' event with data: {data}")

        text = data.get("text")
        sender_id_from_frontend = data.get("senderId")
        timestamp_str = data.get("timestamp")
        trip_id = data.get("tripId")

        if not all([text, sender_id_from_frontend, timestamp_str, trip_id]):
            print(f"SocketIO Debug: Invalid message data received: {data}")
            self.emit("error", {"message": "Invalid message data."})
            return

        authenticated_user_id = request.sid_data["user_id"]
        if str(authenticated_user_id) != str(sender_id_from_frontend):
            print(
                f"SocketIO Debug: Unauthorized sender. Authenticated: {authenticated_user_id}, Frontend: {sender_id_from_frontend}"
            )
            self.emit("error", {"message": "Unauthorized message sender."})
            return

        try:
            trip_obj_id = ObjectId(trip_id)
            sender_obj_id = ObjectId(authenticated_user_id)
            timestamp_dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except (errors.InvalidId, ValueError) as e:
            print(f"SocketIO Debug: Invalid ID or timestamp format: {e}, Data: {data}")
            self.emit("error", {"message": f"Invalid ID or timestamp format: {e}"})
            return

        trip = db.trips.find_one({"_id": trip_obj_id, "members": sender_obj_id})
        if not trip:
            print(
                f"SocketIO Debug: User {authenticated_user_id} not authorized for trip {trip_id}"
            )
            self.emit(
                "error", {"message": "Unauthorized to send messages in this trip chat."}
            )
            return

        message_doc = {
            "trip_id": trip_obj_id,
            "sender_id": sender_obj_id,
            "text": text,
            "timestamp": timestamp_dt,
            "created_at": datetime.utcnow(),
        }

        result = db.chat_messages.insert_one(message_doc)

        broadcast_message = {
            "_id": str(result.inserted_id),
            "trip_id": str(message_doc["trip_id"]),
            "sender_id": str(message_doc["sender_id"]),
            "text": message_doc["text"],
            "timestamp": message_doc["timestamp"].isoformat(),
        }

        print(f"SocketIO Debug: Message saved and broadcasting: {broadcast_message}")
        self.emit("chat message", broadcast_message, room=trip_id)

# Catch-all handler for any event not explicitly handled within the namespace.
def on_event(event_name, *args, **kwargs):
    print(f"SocketIO Debug: TripChatNamespace received unhandled event: '{event_name}' with args: {args} and kwargs: {kwargs}")

# Register the namespace at the root path when the module is imported
socketio.on_namespace(TripChatNamespace('/'))
