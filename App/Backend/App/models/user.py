from datetime import datetime
from bson import ObjectId

class User:
    def __init__(
        self, username, email, password, role="user", profile_picture_url=None,
        bio=None, last_login=None, pending_invitations=None, created_at=None, _id=None
    ):
        self._id = ObjectId(_id) if _id else ObjectId()
        self.username = username
        self.email = email
        self.password = password
        self.role = role
        self.profile_picture_url = profile_picture_url
        self.bio = bio
        self.last_login = last_login
        if pending_invitations is None:
            self.pending_invitations = []
        else:
            self.pending_invitations = [ObjectId(inv) if isinstance(inv, str) else inv for inv in pending_invitations]
        self.created_at = created_at or datetime.utcnow()

    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"), username=data.get("username"), email=data.get("email"),
            password=data.get("password"), role=data.get("role", "user"),
            profile_picture_url=data.get("profile_picture_url"), bio=data.get("bio"),
            last_login=data.get("last_login"), pending_invitations=data.get("pending_invitations"),
            created_at=data.get("created_at")
        )

    def to_mongo_dict(self):
        """Returns a dictionary suitable for MongoDB insertion (keeps ObjectIds)."""
        return self.__dict__

    def to_dict(self):
        """Returns a JSON-serializable dictionary, excluding the password."""
        return {
            "_id": str(self._id),
            "username": self.username,
            "email": self.email,
            # The password hash is intentionally excluded for security.
            "role": self.role,
            "profile_picture_url": self.profile_picture_url,
            "bio": self.bio,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "pending_invitations": [str(inv) for inv in self.pending_invitations],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }