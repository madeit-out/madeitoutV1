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
    ):
        """
        Initializes a Trip object.

        Args:
            title (str): The title of the trip.
            created_by (str | ObjectId): The ID of the user who created the trip.
            arrival (str): The arrival date (YYYY-MM-DD).
            departure (str): The departure date (YYYY-MM-DD).
            destination (str, optional): The main destination of the trip. Defaults to None.
            description (str, optional): A brief description of the trip. Defaults to None.
            members (list, optional): A list of ObjectId strings of members in the trip.
                                      Defaults to None, in which case it will be initialized
                                      with the created_by user's ID.
            member_emails (list, optional): A list of emails of invited members.
                                            This is distinct from 'members' which stores ObjectIds.
                                            Defaults to None.
            is_public (bool, optional): Whether the trip is publicly visible. Defaults to False.
            cover_image_url (str, optional): URL to a cover image for the trip. Defaults to None.
            budget (float, optional): Estimated budget for the trip. Defaults to None.
            created_at (datetime, optional): The timestamp when the trip was created.
                                             Defaults to current UTC time.
        """
        self.title = title
        # Ensure created_by is an ObjectId
        self.created_by = (
            ObjectId(created_by) if isinstance(created_by, str) else created_by
        )
        self.arrival = arrival
        self.departure = departure
        self.destination = destination
        self.description = description
        # Initialize members with created_by if not provided. Ensure all are ObjectIds.
        if members is None:
            self.members = [self.created_by]
        else:
            self.members = [ObjectId(m) if isinstance(m, str) else m for m in members]

        self.member_emails = member_emails or []  # Store invited emails as strings
        self.is_public = is_public
        self.cover_image_url = cover_image_url
        self.budget = budget
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        """
        Converts the Trip object to a dictionary suitable for MongoDB insertion.
        """
        return {
            "title": self.title,
            "created_by": self.created_by,
            "arrival": self.arrival,
            "departure": self.departure,
            "destination": self.destination,
            "description": self.description,
            "members": self.members,
            "member_emails": self.member_emails,  # Include new field
            "is_public": self.is_public,  # Include new field
            "cover_image_url": self.cover_image_url,  # Include new field
            "budget": self.budget,  # Include new field
            "created_at": self.created_at,
        }

    @staticmethod
    def from_dict(data):
        """
        Creates a Trip object from a dictionary (e.g., retrieved from MongoDB).
        """
        return Trip(
            title=data.get("title"),
            created_by=data.get("created_by"),
            arrival=data.get("arrival"),
            departure=data.get("departure"),
            destination=data.get("destination"),
            description=data.get("description"),
            members=data.get("members"),
            member_emails=data.get("member_emails"),
            is_public=data.get("is_public", False),  # Default to False if not present
            cover_image_url=data.get("cover_image_url"),
            budget=data.get("budget"),
            created_at=data.get("created_at"),
        )
