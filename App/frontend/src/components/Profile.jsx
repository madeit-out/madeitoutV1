import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";
import { Dialog } from "@headlessui/react";
import EditProfileModal from "./EditProfileModal"; // Import the modal
import { ArrowLeft, Edit, LogOut, Mail, MapPin, Calendar, Users, CheckCircle } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for the edit modal
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (!loadingProfile) {
      setIsLoaded(true);
    }
  }, [loadingProfile]);

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
        <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-3xl sm:text-4xl font-bold text-black">
          {user.profile_picture_url ? (
            <img src={user.profile_picture_url} alt={user.username} className="w-full h-full rounded-full object-cover"/>
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center shadow-lg">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full border-4 border-[#416B6B]/20 border-t-[#E08544] w-8 h-8"></div>
    </div>
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
            <p className="text-red-600 font-semibold text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6 custom-scrollbar transition-all duration-1000 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start mb-12 gap-6 transition-all duration-1000 delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div>
            <div className="flex items-center mb-4">
              <div className="w-2 h-12 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-6"></div>
              <h1 className="text-5xl font-black text-black tracking-tight">Your Profile</h1>
            </div>
            <p className="text-xl text-black font-semibold">Manage your account and travel preferences</p>
          </div>
        </div>

        {user && (
          /*  Profile Card */
          <div className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 mb-12 transition-all duration-1000 delay-500 hover:shadow-3xl ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-col items-center text-center">
              <Avatar user={user} />
              <div className="mt-8">
                <h2 className="text-3xl font-black text-black mb-3">{user.username}</h2>
                <div className="flex items-center justify-center text-lg text-black/70 font-semibold mb-6">
                  <Mail className="w-5 h-5 mr-2 text-[#E08544]" />
                  {user.email}
                </div>
                {user.bio && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto mb-8 border border-white/40">
                    <p className="text-black font-semibold italic text-lg">"{user.bio}"</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  onClick={() => setIsEditModalOpen(true)} 
                  className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30"
                >
                  <span className="relative z-10 flex items-center">
                    <Edit className="w-6 h-6 mr-2" />
                    Edit Profile
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Invites Section */}
        <div className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 transition-all duration-1000 delay-700 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-2xl flex items-center justify-center mr-6 shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-black tracking-tight">Pending Invites</h3>
              <p className="text-lg text-black font-semibold">Accept invitations to join upcoming trips</p>
            </div>
            {pendingInvites.length > 0 && (
              <div className="ml-auto">
                <span className="bg-gradient-to-r from-[#E08544] to-[#416B6B] text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                  {pendingInvites.length}
                </span>
              </div>
            )}
          </div>
          
          {pendingInvites.length > 0 ? (
            <div className="grid gap-8">
              {pendingInvites.map((invite, index) => (
                <div 
                  key={invite._id} 
                  className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto">
                      <img 
                        src={invite.cover_image_url || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&crop=center"} 
                        alt={invite.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-8">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1">
                          <h4 className="text-2xl font-black text-black mb-4">{invite.title}</h4>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-black font-semibold">
                              <MapPin className="w-5 h-5 mr-3 text-[#E08544]" />
                              <span>{invite.destination || "Amazing destination"}</span>
                            </div>
                            <div className="flex items-center text-black font-semibold">
                              <Calendar className="w-5 h-5 mr-3 text-[#416B6B]" />
                              <span>{formatDateRange(invite.arrival, invite.departure)}</span>
                            </div>
                            <div className="flex items-center text-black/70 font-semibold">
                              <Users className="w-5 h-5 mr-3 text-[#416B6B]" />
                              <span>Invited by {invite.created_by_username}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-6 sm:mt-0 sm:ml-6">
                          <button 
                            onClick={() => setSelectedInvite(invite)} 
                            className="group relative overflow-hidden text-[#416B6B] font-bold px-6 py-3 rounded-2xl hover:bg-[#416B6B] hover:text-white transition-all duration-300 border-2 border-[#416B6B]/20 hover:border-[#416B6B] focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30"
                          >
                            <span className="relative z-10">View Details</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                          </button>
                          <button 
                            onClick={() => handleAcceptInvite(invite._id)} 
                            className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30"
                          >
                            <span className="relative z-10 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Accept
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4">No pending invites</h3>
              <p className="text-lg text-black font-semibold">When friends invite you to trips, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Invite Details Modal */}
      <Dialog open={!!selectedInvite} onClose={() => setSelectedInvite(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl border border-white/30">
            <div className="flex items-center mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
              <Dialog.Title className="text-3xl font-black text-black tracking-tight">
                Trip Invitation
              </Dialog.Title>
            </div>
            {selectedInvite && (
              <div className="space-y-6 text-black font-semibold">
                <div>
                  <h4 className="text-2xl font-black text-black mb-4">{selectedInvite.title}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-[#E08544]" />
                      <span>{selectedInvite.destination || "Amazing destination"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-[#416B6B]" />
                      <span>{formatDateRange(selectedInvite.arrival, selectedInvite.departure)}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-[#416B6B]" />
                      <span>Invited by {selectedInvite.created_by_username}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                  <button 
                    onClick={() => setSelectedInvite(null)} 
                    className="group relative overflow-hidden text-[#416B6B] font-bold px-6 py-4 rounded-2xl hover:bg-[#416B6B] hover:text-white transition-all duration-300 border-2 border-[#416B6B]/20 hover:border-[#416B6B] focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30"
                  >
                    <span className="relative z-10">Close</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </button>
                  <button 
                    onClick={() => handleAcceptInvite(selectedInvite._id)} 
                    className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30"
                  >
                    <span className="relative z-10 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Accept Invitation
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
      
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onProfileUpdated={onProfileUpdated} currentUser={user} />
    </div>
  );
};

export default Profile;