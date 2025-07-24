// src/components/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true); // Added loading state for profile

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndInvites = async () => {
      try {
        setLoadingProfile(true); // Start loading
        const userData = await AuthAPI.getUser();
        setUser(userData);

        const invites = await TripAPI.getPendingInvites();
        setPendingInvites(invites);
      } catch (err) {
        console.error("Error loading profile", err);
        // Handle error, e.g., redirect to login if unauthorized
        if (err.response && err.response.status === 401) {
          AuthAPI.logout(); // Clear invalid token
          navigate("/signin");
        }
      } finally {
        setLoadingProfile(false); // End loading
      }
    };

    fetchProfileAndInvites();
  }, [navigate]); // Added navigate to dependency array

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
      alert("Failed to accept invite. Please try again."); // Provide user feedback
    }
  };

  return (
    // Main container: Dark background, generous padding
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Title: Accent color, bold */}
        <h2 className="text-3xl font-bold mb-6 text-[#72ADBF]">Profile</h2>

        {loadingProfile ? ( // Loading state for profile
          <p className="text-gray-300">Loading profile...</p>
        ) : user ? (
          // User Info Card: Darker Ocean Blue background, rounded-xl, subtle shadow, white/gray text
          <div className="bg-[#012A3D] rounded-xl shadow-lg p-6 mb-8 border border-[#01374A]">
            <p className="text-xl font-medium text-[#72ADBF] mb-2">Username: {user.username}</p> {/* Accent for username */}
            <p className="text-gray-300">Email: {user.email}</p> {/* Lighter gray for email */}
          </div>
        ) : (
          <p className="text-red-400">Failed to load user profile.</p> // Error if user is null after loading
        )}

        {/* Pending Invites Section */}
        <h3 className="text-xl font-semibold mb-4 text-[#72ADBF]">Pending Invites</h3> {/* Accent for heading */}
        {pendingInvites.length > 0 ? (
          <ul className="space-y-4"> {/* Increased space-y */}
            {pendingInvites.map((invite) => (
              // Invite Card: Deep Ocean Blue background, rounded-lg, subtle shadow
              <li
                key={invite.trip_id}
                className="flex justify-between items-center border border-[#012A3D] rounded-lg p-4 bg-[#01374A] shadow-md"
              >
                <span className="text-lg font-medium text-white">{invite.trip_name}</span>
                {/* Accept Button: Primary style */}
                <button
                  onClick={() => handleAcceptInvite(invite.trip_id)}
                  className="text-white text-md font-semibold uppercase
                             py-2 px-6 rounded-lg border border-[#0395A7]
                             bg-[#0395A7] hover:bg-[#5E877D]
                             transition-all duration-300 ease-in-out
                             shadow-md hover:shadow-lg transform hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-300">No pending invites.</p> 
        )}

        <div className="mt-10"> {/* Increased mt */}
          {/* Log Out Button: Red primary style */}
          <button
            onClick={handleLogout}
            className="text-white text-lg font-semibold uppercase
                       py-3 px-8 rounded-lg bg-red-600 hover:bg-red-700
                       transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-lg transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

