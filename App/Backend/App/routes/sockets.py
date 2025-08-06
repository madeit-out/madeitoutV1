from flask import request, current_app
from flask_socketio import Namespace, join_room, emit
from flask_jwt_extended import decode_token
from bson import ObjectId, errors

from .. import socketio
from ..models.trip_chat import TripChatMessage # Import the refactored OOP model

class TripChatNamespace(Namespace):
    connected_users = {}

    def on_connect(self, auth):
        print(f"🔍 Connection attempt received with auth: {auth}")
        try:
            token = auth.get("token") if auth else None
            if not token:
                print("❌ No token provided")
                return False

            print(f"🔑 Attempting to decode token: {token[:50]}...")
            decoded_token = decode_token(token)
            user_id = decoded_token["sub"]
            self.connected_users[request.sid] = user_id
            print(f"✅ Client connected to /chat namespace: SID={request.sid}, User ID={user_id}")
            return True  # Explicitly return True for successful connection
        except Exception as e:
            print(f"❌ SocketIO Connect: Authentication failed: {e}. Disconnecting.")
            return False

    def on_disconnect(self):
        user_id = self.connected_users.pop(request.sid, "anonymous")
        print(f"Client disconnected from /chat namespace: SID={request.sid}, User ID={user_id}")

    def on_joinTripRoom(self, trip_id):
        user_id = self.connected_users.get(request.sid)
        if not user_id:
            return self.emit("error", {"message": "Not authenticated."}, room=request.sid)

        try:
            trip_obj_id = ObjectId(trip_id)
            user_obj_id = ObjectId(user_id)
        except errors.InvalidId:
            return self.emit("error", {"message": "Invalid ID provided."}, room=request.sid)

        trip = current_app.db.trips.find_one({"_id": trip_obj_id, "members": user_obj_id})
        if not trip:
            return self.emit("error", {"message": "Unauthorized to join this trip chat."}, room=request.sid)

        join_room(trip_id)
        print(f"User {user_id} joined trip room {trip_id} (SID: {request.sid})")

        # This part no longer needs the model; it queries the DB directly.
        messages_from_db = current_app.db.trip_chats.find({"tripId": trip_obj_id}).sort("timestamp", 1).limit(50)
        
        # Convert the raw DB documents to JSON-friendly format
        historical_messages = [TripChatMessage.from_dict(msg).to_json() for msg in messages_from_db]
        
        self.emit("historical messages", historical_messages, room=request.sid)

    def on_chat_message(self, data):
        # 1. Check if the handler is being called
        print("--- 1. 'on_chat_message' handler started.")
        print(f"---    Received data: {data}")

        try:
            db = current_app.db
            user_id = self.connected_users.get(request.sid)

            # 2. Check if validation is passing
            if not user_id:
                print("--- FAILED: User not authenticated.")
                return

            sender_id = data.get("senderId")
            if str(user_id) != str(sender_id):
                print(f"--- FAILED: Unauthorized sender. User ID {user_id} does not match sender ID {sender_id}.")
                return
            
            print("--- 2. Validation passed.")

            # 3. Check if the code is reaching the database command
            new_message = TripChatMessage(
                trip_id=data.get("tripId"),
                sender_id=sender_id,
                text=data.get("text")
            )
            
            print(f"--- 3. Attempting to insert message with ID: {new_message._id}")
            
            # 4. Check if the database command itself throws an error
            db.trip_chats.insert_one(new_message.to_dict())
            
            print(f"--- 4. SUCCESS: Message {new_message._id} inserted into database.")

            self.emit("chat message", new_message.to_json(), room=data.get("tripId"))
            print(f"--- 5. Emitted message to room {data.get('tripId')}")

        except Exception as e:
            print(f"--- AN ERROR OCCURRED: {e}")

# Register namespace at "/chat"
socketio.on_namespace(TripChatNamespace("/chat"))