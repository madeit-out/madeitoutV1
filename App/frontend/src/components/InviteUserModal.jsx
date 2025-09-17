import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { TripAPI } from "../adapters/apiAdapter"; // Adjust path if necessary
import { UserPlus, Send, X } from "lucide-react"; // Note: Removed Mail icon

export default function InviteUserModal({ isOpen, onClose, tripId }) {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInvite = async () => {
    setError("");
    setSuccessMessage("");
    if (!identifier.trim()) {
      setError("Please enter a username.");
      return;
    }

    setIsInviting(true);

    try {
      const res = await TripAPI.inviteUserByUsername(tripId, identifier.trim());
      setSuccessMessage(res.message || "User invited successfully!");
      setIdentifier("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Enhanced Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-6">
        {/* Enhanced Modal Panel */}
        <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl border border-white/30">
          {/* Enhanced Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
            <UserPlus className="w-8 h-8 text-[#416B6B] mr-4" />
            <Dialog.Title className="text-3xl font-black text-black tracking-tight">
              Invite User to Trip
            </Dialog.Title>
          </div>

          {/* Enhanced Input field */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-black tracking-wide mb-3">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm mt-2 font-bold">{successMessage}</p>}
          </div>

          {/* Enhanced Button Container */}
          <div className="flex gap-4 mt-10">
            {/* Enhanced Cancel Button */}
            <button
              onClick={onClose}
              disabled={isInviting}
              className="group relative overflow-hidden flex-1 text-[#416B6B] font-bold px-6 py-5 rounded-2xl hover:bg-[#416B6B] hover:text-white transition-all duration-300 border-2 border-[#416B6B]/20 hover:border-[#416B6B] focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center">
                <X className="w-5 h-5 mr-2" />
                Cancel
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>

            {/* Enhanced Send Invite Button */}
            <button
              onClick={handleInvite}
              disabled={isInviting}
              className="group relative overflow-hidden flex-1 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:transform-none"
            >
              {isInviting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white mr-3"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center">
                  <Send className="w-6 h-6 mr-2" />
                  Send Invite
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}