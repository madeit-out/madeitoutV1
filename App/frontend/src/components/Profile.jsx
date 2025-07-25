// src/components/Profile.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Link is not needed if using navigate
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
        console.log("Profile Debug: Fetched pending invites:", invites); // Log fetched invites
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

  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Navigate to the dashboard
  };

  const handleAcceptInvite = async (tripIdToAccept) => {
    // Renamed parameter for clarity
    try {
      console.log(
        "Profile Debug: Attempting to accept invite for tripId:",
        tripIdToAccept
      ); // Log the ID being passed
      if (!tripIdToAccept) {
        console.error(
          "Profile Error: tripIdToAccept is undefined or null. Cannot accept invite."
        );
        alert("Failed to accept invite: Invalid trip ID provided.");
        return;
      }

      await TripAPI.acceptInvite(tripIdToAccept);
      console.log(
        "Profile Debug: Invite accepted successfully for tripId:",
        tripIdToAccept
      );

      // Filter out the accepted invite using _id, as confirmed by console logs
      setPendingInvites((prev) =>
        prev.filter((invite) => invite._id !== tripIdToAccept)
      );
    } catch (err) {
      console.error("Error accepting invite", err);
      // Use err.response.data.message for more specific backend error messages
      alert(
        err?.response?.data?.message ||
          "Failed to accept invite. Please try again."
      );
    }
  };

  return (
    // Main container: Dark background, generous padding
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Title: Accent color, bold */}
        <h2 className="text-3xl font-bold mb-6 text-[#72ADBF]">Profile</h2>
        {loadingProfile ? (
          <p className="text-gray-300">Loading profile...</p>
        ) : user ? (
          // User Info Card: Darker Ocean Blue background, rounded-xl, subtle shadow, white/gray text
          <div className="bg-[#012A3D] rounded-xl shadow-lg p-6 mb-8 border border-[#01374A]">
            <p className="text-xl font-medium text-[#72ADBF] mb-2">
              Username: {user.username}
            </p>{" "}
            {/* Accent for username */}
            <p className="text-gray-300">Email: {user.email}</p>{" "}
            {/* Lighter gray for email */}
          </div>
        ) : (
          <p className="text-red-400">Failed to load user profile.</p> // Error if user is null after loading
        )}
        <h3 className="text-xl font-semibold mb-4 text-[#72ADBF]">
          Pending Invites
        </h3>{" "}
        {/* Accent for heading */}
        {pendingInvites.length > 0 ? (
          <ul className="space-y-4">
            {" "}
            {/* Increased space-y */}
            {pendingInvites.map((invite) => {
              console.log("Profile Debug: Rendering invite item:", invite); // Log each invite object before rendering
              return (
                <li
                  key={invite._id} // Use invite._id for the key
                  className="flex justify-between items-center border border-[#012A3D] rounded-lg p-4 bg-[#01374A] shadow-md"
                >
                  <span className="text-lg font-medium text-white">
                    {invite.title} {/* Use invite.title for the trip name */}
                  </span>
                  {/* Accept Button: Primary style */}
                  <button
                    onClick={() => handleAcceptInvite(invite._id)} // Pass invite._id
                    className="text-white text-md font-semibold uppercase
                             py-2 px-6 rounded-lg border border-[#0395A7]
                             bg-[#0395A7] hover:bg-[#5E877D]
                             transition-all duration-300 ease-in-out
                             shadow-md hover:shadow-lg transform hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
                  >
                    Accept {invite.owner_username}'s {invite.title}{" "}
                    {/* Use invite.title here for consistency */}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-300">No pending invites.</p>
        )}
        <div className="mt-10 flex justify-between">
          {" "}
          {/* Added flex and justify-between */}
          {/* Go to Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            className="text-white text-lg font-semibold uppercase
                       py-3 px-8 rounded-lg border border-[#72ADBF]
                       bg-[#01374A] hover:bg-[#0395A7] hover:bg-opacity-20
                       transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-lg transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
          >
            Go to Dashboard
          </button>
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
