import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";
import { Dialog } from "@headlessui/react"; // Import Dialog for the modal

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvite, setSelectedInvite] = useState(null); // State for the details modal

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        setError("");
        const userData = await AuthAPI.getUser();
        setUser(userData);
        setPendingInvites(userData.pending_invitations || []);
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Could not load your profile data. Please try again.");
        if (err.response && err.response.status === 401) {
          AuthAPI.logout();
          navigate("/signin");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/signin");
  };

  const handleAcceptInvite = async (tripIdToAccept) => {
    try {
      await TripAPI.acceptInvite(tripIdToAccept);
      setPendingInvites((prev) =>
        prev.filter((invite) => invite._id !== tripIdToAccept)
      );
      setSelectedInvite(null); // Close the modal if open
    } catch (err) {
      console.error("Error accepting invite", err);
      alert(
        err?.response?.data?.message ||
          "Failed to accept invite. Please try again."
      );
    }
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endDate = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startDate} - ${endDate}`;
  };

  const Avatar = ({ user }) => (
    <div className="w-24 h-24 rounded-full bg-[#01374A] border-2 border-[#72ADBF] flex items-center justify-center text-4xl font-bold text-[#72ADBF] mb-4">
      {user.profile_picture_url ? (
        <img
          src={user.profile_picture_url}
          alt={user.username}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        user.username.charAt(0).toUpperCase()
      )}
    </div>
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D]">
        <p className="text-[#72ADBF] text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D]">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-bold text-[#72ADBF]">Your Profile</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-[#72ADBF] hover:text-white font-medium hover:underline transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {user && (
          <div className="bg-[#012A3D] rounded-xl shadow-lg p-6 mb-8 border border-[#01374A] flex flex-col items-center text-center">
            <Avatar user={user} />
            <p className="text-2xl font-bold text-white">{user.username}</p>
            <p className="text-md text-gray-400 mb-4">{user.email}</p>
            {user.bio && (
              <p className="text-gray-300 italic max-w-md">"{user.bio}"</p>
            )}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => navigate("/profile/edit")}
                className="text-white text-sm font-semibold py-2 px-5 rounded-lg border border-[#72ADBF] bg-[#01374A] hover:bg-opacity-20 hover:bg-[#0395A7] transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-white text-sm font-semibold py-2 px-5 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4 text-[#72ADBF]">
          Pending Invites
        </h3>
        {pendingInvites.length > 0 ? (
          <ul className="space-y-4">
            {pendingInvites.map((invite) => (
              <li
                key={invite._id}
                className="bg-[#01374A] rounded-lg shadow-md overflow-hidden flex"
              >
                <img
                  src={
                    invite.cover_image_url ||
                    "https://placehold.co/400x400/01374A/72ADBF?text=Trip"
                  }
                  alt={invite.title}
                  className="w-32 h-full object-cover"
                />
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <p className="font-bold text-lg text-white">
                      {invite.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      to {invite.destination || "an amazing place"}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {formatDateRange(invite.arrival, invite.departure)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Invited by {invite.created_by_username}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3 mt-3">
                    <button
                      onClick={() => setSelectedInvite(invite)}
                      className="text-sm font-semibold py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleAcceptInvite(invite._id)}
                      className="text-white text-sm font-semibold py-2 px-5 rounded-lg bg-[#0395A7] hover:bg-[#5E877D] transition-all shadow-md"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">You have no pending invites.</p>
        )}
      </div>

      {/* Trip Details Modal */}
      <Dialog
        open={!!selectedInvite}
        onClose={() => setSelectedInvite(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#012A3D] rounded-xl max-w-lg w-full p-8 shadow-2xl text-white border border-[#01374A]">
            <Dialog.Title className="text-2xl font-bold mb-4 text-[#72ADBF]">
              {selectedInvite?.title}
            </Dialog.Title>
            <p className="text-md text-gray-300 mb-4">
              to {selectedInvite?.destination}
            </p>
            <p className="text-gray-400 mb-6">
              {selectedInvite?.description || "No description provided."}
            </p>

            <div className="text-sm space-y-2 text-gray-300">
              <p>
                <strong>Dates:</strong>{" "}
                {formatDateRange(
                  selectedInvite?.arrival,
                  selectedInvite?.departure
                )}
              </p>
              <p>
                <strong>Budget:</strong> $
                {selectedInvite?.budget?.toLocaleString() || "Not set"}
              </p>
              <p>
                <strong>Visibility:</strong>{" "}
                {selectedInvite?.is_public ? "Public" : "Private"}
              </p>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setSelectedInvite(null)}
                className="py-2 px-5 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleAcceptInvite(selectedInvite?._id)}
                className="py-2 px-5 rounded-lg bg-[#0395A7] hover:bg-[#5E877D] transition-colors"
              >
                Accept Invite
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Profile;
