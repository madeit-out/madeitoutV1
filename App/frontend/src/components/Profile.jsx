import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";
import { Dialog } from "@headlessui/react";
import EditProfileModal from "./EditProfileModal"; // Import the modal

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for the edit modal

  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      setLoadingProfile(true);
      setError("");
      const userData = await AuthAPI.getUser();
      setUser(userData);
      // Use the detailed invite list from the API response
      setPendingInvites(userData.pending_invite_details || []);
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

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const onProfileUpdated = () => {
    setIsEditModalOpen(false); // Close the modal
    fetchProfileData(); // Refetch profile data to show changes
  };

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/signin");
  };

  const handleAcceptInvite = async (tripIdToAccept) => {
    try {
      await TripAPI.acceptInvite(tripIdToAccept);
      setPendingInvites((prev) => prev.filter((invite) => invite._id !== tripIdToAccept));
      setSelectedInvite(null);
    } catch (err) {
      console.error("Error accepting invite", err);
      alert(err?.response?.data?.message || "Failed to accept invite. Please try again.");
    }
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "Date not available";
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endDate = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startDate} - ${endDate}`;
  };

  const Avatar = ({ user }) => (
    <div className="relative">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-[#416B6B] to-[#E08544] p-1 shadow-xl">
        <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#1F474A]">
          {user.profile_picture_url ? (<img src={user.profile_picture_url} alt={user.username} className="w-full h-full rounded-full object-cover"/>) : (user.username.charAt(0).toUpperCase())}
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center"><div className="animate-spin rounded-full border-4 border-[#416B6B]/20 border-t-[#E08544] w-8 h-8"></div></div>
  );

  if (loadingProfile) { /* ... Loading UI ... */ }
  if (error) { /* ... Error UI ... */ }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-10 gap-4">
          <div><h1 className="text-3xl sm:text-4xl font-bold text-[#1F474A] tracking-tight">Your Profile</h1><p className="text-[#1F474A]/70 font-medium mt-2">Manage your account and travel preferences</p></div>
          <button onClick={() => navigate("/dashboard")} className="text-[#416B6B] font-semibold px-4 py-2 rounded-lg hover:bg-[#416B6B]/10 transition-all duration-200 border border-[#416B6B]/20 hover:border-[#416B6B]/40 focus:outline-none focus:ring-2 focus:ring-[#416B6B]/30 self-start"><svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back to Dashboard</button>
        </div>

        {user && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 mb-10 transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <Avatar user={user} />
              <div className="mt-6"><h2 className="text-2xl sm:text-3xl font-bold text-[#1F474A] mb-2">{user.username}</h2><p className="text-base sm:text-lg text-[#1F474A]/70 font-medium mb-4">{user.email}</p>{user.bio && (<div className="bg-[#F5F5DC]/50 rounded-xl p-4 max-w-md mx-auto mb-6"><p className="text-[#1F474A]/80 italic font-medium">"{user.bio}"</p></div>)}</div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button onClick={() => setIsEditModalOpen(true)} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Edit Profile</button>
                <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-5 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/30"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Log Out</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-xl flex items-center justify-center mr-4"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
            <div><h3 className="text-2xl font-bold text-[#1F474A] tracking-tight">Pending Invites</h3><p className="text-[#1F474A]/70 font-medium">Accept invitations to join upcoming trips</p></div>
            {pendingInvites.length > 0 && (<div className="ml-auto"><span className="bg-gradient-to-r from-[#E08544] to-[#416B6B] text-white text-sm font-bold px-3 py-1 rounded-full">{pendingInvites.length}</span></div>)}
          </div>
          {pendingInvites.length > 0 ? (
            <div className="grid gap-6">{pendingInvites.map((invite) => (<div key={invite._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"><div className="flex flex-col sm:flex-row"><div className="sm:w-48 h-32 sm:h-auto"><img src={invite.cover_image_url || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&crop=center"} alt={invite.title} className="w-full h-full object-cover"/></div><div className="flex-1 p-6"><div className="flex flex-col sm:flex-row sm:justify-between sm:items-start"><div className="flex-1"><h4 className="text-xl font-bold text-[#1F474A] mb-2">{invite.title}</h4><div className="flex items-center text-[#1F474A]/70 mb-2"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span className="font-medium">{invite.destination || "Amazing destination"}</span></div><div className="flex items-center text-[#1F474A]/70 mb-2"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span className="font-medium">{formatDateRange(invite.arrival, invite.departure)}</span></div><div className="flex items-center text-[#1F474A]/50 text-sm"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Invited by {invite.created_by_username}</span></div></div><div className="flex gap-3 mt-4 sm:mt-0 sm:ml-4"><button onClick={() => setSelectedInvite(invite)} className="text-[#416B6B] font-semibold px-4 py-2 rounded-lg hover:bg-[#416B6B]/10 transition-all duration-200 border border-[#416B6B]/20 hover:border-[#416B6B]/40 focus:outline-none focus:ring-2 focus:ring-[#416B6B]/30">View Details</button><button onClick={() => handleAcceptInvite(invite._id)} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30">Accept</button></div></div></div></div></div>))}</div>) : (<div className="text-center py-12"><div className="w-16 h-16 bg-[#416B6B]/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-[#416B6B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div><p className="text-[#1F474A]/50 font-medium text-lg">No pending invites</p><p className="text-[#1F474A]/40 font-medium mt-2">When friends invite you to trips, they'll appear here</p></div>)}
        </div>
      </div>
      <Dialog open={!!selectedInvite} onClose={() => setSelectedInvite(null)} className="relative z-50">{/* ... Invite Details Modal JSX ... */}</Dialog>
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onProfileUpdated={onProfileUpdated} currentUser={user} />
    </div>
  );
};

export default Profile;