// src/components/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndInvites = async () => {
      try {
        const userData = await AuthAPI.getUser();
        setUser(userData);

        const invites = await TripAPI.getPendingInvites();
        setPendingInvites(invites);
      } catch (err) {
        console.error("Error loading profile", err);
      }
    };

    fetchProfileAndInvites();
  }, []);

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/signin"); // Redirect to sign-in after logout
  };

  const handleAcceptInvite = async (tripId) => {
    try {
      await TripAPI.acceptInvite(tripId);
      setPendingInvites((prev) =>
        prev.filter((invite) => invite.trip_id !== tripId)
      );
    } catch (err) {
      console.error("Error accepting invite", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>

      {user ? (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <p className="text-lg font-medium">Username: {user.username}</p>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      <h3 className="text-xl font-semibold mb-2">Pending Invites</h3>
      {pendingInvites.length > 0 ? (
        <ul className="space-y-3">
          {pendingInvites.map((invite) => (
            <li
              key={invite.trip_id}
              className="flex justify-between items-center border rounded-lg p-3 bg-gray-50"
            >
              <span>{invite.trip_name}</span>
              <button
                onClick={() => handleAcceptInvite(invite.trip_id)}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending invites.</p>
      )}

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
