from datetime import datetime
from bson import ObjectId
from flask import current_app


class TripChatMessage:
    collection = "chat_messages"

    @classmethod
    def insert(cls, trip_id, sender_id, text):
        message = {
            "tripId": ObjectId(trip_id),
            "senderId": ObjectId(sender_id),
            "text": text,
            "timestamp": datetime.utcnow()
        }
        # FIX: Changed 'current_app.mongo.db' to 'current_app.db'
        db = current_app.db
        result = db[cls.collection].insert_one(message)
        message["_id"] = str(result.inserted_id)
        message["tripId"] = str(message["tripId"])
        message["senderId"] = str(message["senderId"])
        message["timestamp"] = message["timestamp"].isoformat()
        return message

    @classmethod
    def get_by_trip(cls, trip_id, limit=50):
        # FIX: Changed 'current_app.mongo.db' to 'current_app.db'
        db = current_app.db
        messages = (
            db[cls.collection]
            .find({"tripId": ObjectId(trip_id)})
            .sort("timestamp", 1)
            .limit(limit)
        )
        return [
            {
                "_id": str(msg["_id"]),
                "tripId": str(msg["tripId"]),
                "senderId": str(msg["senderId"]),
                "text": msg["text"],
                "timestamp": msg["timestamp"].isoformat(),
            }
            for msg in messages
        ]