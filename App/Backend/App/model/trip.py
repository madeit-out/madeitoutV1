from datetime import datetime
from bson import ObjectId

class Trip:
    def __init__(self, title, created_by, arrival, departure, members=None, created_at=None):
        self.title = title
        self.created_by = ObjectId(created_by)
        self.arrival = arrival
        self.departure = departure
        self.members = members or [self.created_by]
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "title": self.title,
            "created_by": self.created_by,
            "arrival": self.arrival,
            "departure": self.departure,
            "members": self.members,
            "created_at": self.created_at
        }
