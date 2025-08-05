from datetime import datetime
from bson import ObjectId

class Trip:
    def __init__(
        self,
        title,
        created_by,
        arrival,
        departure,
        destination=None,
        description=None,
        members=None,
        member_emails=None,
        is_public=False,
        cover_image_url=None,
        budget=None,
        created_at=None,
        _id=None,
    ):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.title = title
        self.created_by = ObjectId(created_by) if isinstance(created_by, str) else created_by
        self.arrival = arrival
        self.departure = departure
        self.destination = destination
        self.description = description
        if members is None:
            self.members = [self.created_by]
        else:
            self.members = [ObjectId(m) if isinstance(m, str) else m for m in members]
        self.member_emails = member_emails or []
        self.is_public = is_public
        self.cover_image_url = cover_image_url
        self.budget = budget
        self.created_at = created_at or datetime.utcnow()

    @property
    def duration(self):
        try:
            arrival_date = datetime.fromisoformat(self.arrival.replace('Z', '+00:00'))
            departure_date = datetime.fromisoformat(self.departure.replace('Z', '+00:00'))
            return (departure_date - arrival_date).days
        except (ValueError, TypeError):
            return None

    def __repr__(self):
        return f"<Trip id='{self._id}' title='{self.title}' duration={self.duration} days>"

    def to_dict(self):
        """Converts to a dictionary suitable for MongoDB (keeps ObjectIds)."""
        return {
            "_id": self._id,
            "title": self.title,
            "created_by": self.created_by,
            "arrival": self.arrival,
            "departure": self.departure,
            "destination": self.destination,
            "description": self.description,
            "members": self.members,
            "member_emails": self.member_emails,
            "is_public": self.is_public,
            "cover_image_url": self.cover_image_url,
            "budget": self.budget,
            "created_at": self.created_at,
        }

    def to_json(self):
        """Converts to a dictionary suitable for JSON responses (strings)."""
        return {
            "_id": str(self._id),
            "title": self.title,
            "created_by": str(self.created_by),
            "arrival": self.arrival,
            "departure": self.departure,
            "destination": self.destination,
            "description": self.description,
            "members": [str(m) for m in self.members],
            "member_emails": self.member_emails,
            "is_public": self.is_public,
            "cover_image_url": self.cover_image_url,
            "budget": self.budget,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    @staticmethod
    def from_dict(data):
        return Trip(
            _id=data.get("_id"),
            title=data.get("title"),
            created_by=data.get("created_by"),
            arrival=data.get("arrival"),
            departure=data.get("departure"),
            destination=data.get("destination"),
            description=data.get("description"),
            members=data.get("members"),
            member_emails=data.get("member_emails"),
            is_public=data.get("is_public", False),
            cover_image_url=data.get("cover_image_url"),
            budget=data.get("budget"),
            created_at=data.get("created_at"),
        )
