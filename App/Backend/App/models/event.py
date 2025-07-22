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
        created_at=None
    ):
        self.trip_id = ObjectId(trip_id)
        self.title = title
        self.location = location
        self.start_time = start_time
        self.end_time = end_time
        self.created_by = ObjectId(created_by)
        self.type = type
        self.notes = notes
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "trip_id": self.trip_id,
            "title": self.title,
            "location": self.location,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "created_by": self.created_by,
            "type": self.type,
            "notes": self.notes,
            "created_at": self.created_at
        }
