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
        participants=None,
        cost=None,
        status="planned",
        created_at=None,
        _id=None,
    ):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.trip_id = ObjectId(trip_id)
        self.title = title
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
        self.created_by = ObjectId(created_by)
        self.type = type
        self.notes = notes
        if participants is None:
            self.participants = []
        else:
            self.participants = [
                ObjectId(p) if isinstance(p, str) else p for p in participants
            ]
        self.cost = cost
        self.status = status
        self.created_at = created_at or datetime.utcnow()
    
    def __repr__(self):
        """Provides a developer-friendly string representation of the Event object."""
        return f"<Event id='{self._id}' title='{self.title}'>"

    @classmethod
    def from_dict(cls, data):
        """Creates an Event object from a dictionary."""
        return cls(
            trip_id=data["trip_id"],
            title=data["title"],
            location=data.get("location", ""),
            start_time=data["start_time"],
            end_time=data["end_time"],
            created_by=data["created_by"],
            type=data.get("type", "activity"),
            notes=data.get("notes", ""),
            participants=data.get("participants"),
            cost=data.get("cost"),
            status=data.get("status", "planned"),
            created_at=data.get("created_at"),
            _id=data.get("_id"),
        )

    def to_dict(self):
        """Converts the Event object to a dictionary suitable for MongoDB insertion."""
        return {
            "_id": self._id,
            "trip_id": self.trip_id,
            "title": self.title,
            "location": self.location,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "created_by": self.created_by,
            "type": self.type,
            "notes": self.notes,
            "participants": self.participants,
            "cost": self.cost,
            "status": self.status,
            "created_at": self.created_at,
        }

   
    def to_json(self):
        """Converts the Event object to a JSON-serializable dictionary."""
        return {
            "_id": str(self._id),
            "trip_id": str(self.trip_id),
            "title": self.title,
            "location": self.location,
            "start_time": self.start_time.isoformat() if isinstance(self.start_time, datetime) else self.start_time,
            "end_time": self.end_time.isoformat() if isinstance(self.end_time, datetime) else self.end_time,
            "created_by": str(self.created_by),
            "type": self.type,
            "notes": self.notes,
            "participants": [str(p) for p in self.participants],
            "cost": self.cost,
            "status": self.status,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
        }
