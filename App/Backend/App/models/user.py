from datetime import datetime
from bson import ObjectId


class User:
    def __init__(
        self,
        username,
        email,
        password,
        role="user",
        profile_picture_url=None,
        bio=None,
        last_login=None,
        pending_invitations=None,
        created_at=None,
        _id=None,
    ):
        """
        Initializes a User object.

        Args:
            username (str): The user's unique username.
            email (str): The user's unique email address.
            password (str): The user's hashed password.
            role (str, optional): The user's role (e.g., 'user', 'admin'). Defaults to 'user'.
            profile_picture_url (str, optional): URL to the user's profile picture. Defaults to None.
            bio (str, optional): A short biography for the user. Defaults to None.
            last_login (datetime, optional): Timestamp of the user's last login. Defaults to None.
            pending_invitations (list, optional): List of ObjectId strings for trip invites. Defaults to None.
            created_at (datetime, optional): The timestamp when the user account was created.
                                             Defaults to current UTC time.
            _id (str | ObjectId, optional): The MongoDB ObjectId for the user. If None, a new one is generated.
        """
        self._id = (
            ObjectId(_id) if _id else ObjectId()
        )  # Ensure _id is always an ObjectId
        self.username = username
        self.email = email
        self.password = password  # This should store the hashed password
        self.role = role
        self.profile_picture_url = profile_picture_url
        self.bio = bio
        self.last_login = last_login
        # Ensure pending_invitations are ObjectIds if provided as strings
        if pending_invitations is None:
            self.pending_invitations = []
        else:
            self.pending_invitations = [
                ObjectId(inv) if isinstance(inv, str) else inv
                for inv in pending_invitations
            ]

        self.created_at = created_at or datetime.utcnow()

    @classmethod
    def from_dict(cls, data):
        """
        Creates a User object from a dictionary (e.g., retrieved from MongoDB).
        Handles default values for new fields.
        """
        return cls(
            _id=data.get("_id"),
            username=data.get("username"),
            email=data.get("email"),
            password=data.get("password"),  # This will be the hashed password from DB
            role=data.get("role", "user"),
            profile_picture_url=data.get("profile_picture_url"),
            bio=data.get("bio"),
            last_login=data.get("last_login"),
            pending_invitations=data.get("pending_invitations"),
            created_at=data.get("created_at"),
        )

    def to_dict(self):
        """
        Converts the User object to a dictionary suitable for MongoDB insertion.
        Converts ObjectId to string for JSON serialization.
        """
        return {
            "_id": str(self._id),
            "username": self.username,
            "email": self.email,
            "password": self.password,  # This will be the hashed password
            "role": self.role,
            "profile_picture_url": self.profile_picture_url,
            "bio": self.bio,
            "last_login": self.last_login,
            "pending_invitations": [
                str(inv) for inv in self.pending_invitations
            ],  # Convert to strings for JSON
            "created_at": self.created_at,
        }
