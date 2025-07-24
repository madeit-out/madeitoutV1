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
        created_at=None,
        _id=None
    ):
        self._id = ObjectId(_id) if _id else None
        self.trip_id = ObjectId(trip_id)
        self.title = title
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
        self.created_by = ObjectId(created_by)
        self.type = type
        self.notes = notes
        self.created_at = created_at or datetime.utcnow()

    @classmethod
    def from_dict(cls, data):
        return cls(
            trip_id=data["trip_id"],
            title=data["title"],
            location=data.get("location", ""),
            start_time=data["start_time"],
            end_time=data["end_time"],
            created_by=data["created_by"],
            type=data.get("type", "activity"),
            notes=data.get("notes", ""),
            created_at=data.get("created_at"),
            _id=data.get("_id")
        )

    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "trip_id": str(self.trip_id),
            "title": self.title,
            "location": self.location,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "created_by": str(self.created_by),
            "type": self.type,
            "notes": self.notes,
            "created_at": self.created_at
        }
