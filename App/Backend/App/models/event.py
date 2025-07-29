from datetime import datetime
from bson import ObjectId


class Event:
    def __init__(
        self,
        trip_id,
        title,
        location,
        start_time,
        end_time,
        created_by,
        type="activity",
        notes="",
        participants=None,  # New field: list of ObjectIds for event participants
        cost=None,  # New field: optional cost for the event
        status="planned",  # New field: status of the event (e.g., "planned", "confirmed", "cancelled")
        created_at=None,
        _id=None,
    ):
        self._id = (
            ObjectId(_id) if _id else ObjectId()
        )  # Ensure _id is always an ObjectId
        self.trip_id = ObjectId(trip_id)
        self.title = title
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
        self.created_by = ObjectId(created_by)
        self.type = type
        self.notes = notes
        # Initialize participants, ensuring they are ObjectIds if provided as strings
        if participants is None:
            self.participants = []
        else:
            self.participants = [
                ObjectId(p) if isinstance(p, str) else p for p in participants
            ]

        self.cost = cost
        self.status = status
        self.created_at = created_at or datetime.utcnow()

    @classmethod
    def from_dict(cls, data):
        """
        Creates an Event object from a dictionary (e.g., retrieved from MongoDB).
        Handles default values for new fields.
        """
        return cls(
            trip_id=data["trip_id"],
            title=data["title"],
            location=data.get("location", ""),
            start_time=data["start_time"],
            end_time=data["end_time"],
            created_by=data["created_by"],
            type=data.get("type", "activity"),
            notes=data.get("notes", ""),
            participants=data.get("participants"),  # Retrieve new field
            cost=data.get("cost"),  # Retrieve new field
            status=data.get("status", "planned"),  # Retrieve new field with default
            created_at=data.get("created_at"),
            _id=data.get("_id"),
        )

    def to_dict(self):
        """
        Converts the Event object to a dictionary suitable for MongoDB insertion.
        Converts ObjectIds to strings for JSON serialization.
        """
        return {
            "_id": str(self._id),
            "trip_id": str(self.trip_id),
            "title": self.title,
            "location": self.location,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "created_by": str(self.created_by),
            "type": self.type,
            "notes": self.notes,
            "participants": [
                str(p) for p in self.participants
            ],  # Convert participants to strings
            "cost": self.cost,
            "status": self.status,
            "created_at": self.created_at,
        }
