from bson import ObjectId
from datetime import datetime

class User:
    def __init__(self, username, email, password, role='user', created_at=None):
        self.username = username
        self.email = email
        self.password = password
        self.role = role
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "role": self.role,
            "created_at": self.created_at
        }
