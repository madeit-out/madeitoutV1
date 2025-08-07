import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { TripAPI } from "../adapters/apiAdapter"; // Adjust path if necessary

export default function InviteUserModal({ isOpen, onClose, tripId }) {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInvite = async () => {
    setError("");
    setSuccessMessage("");
    if (!identifier.trim()) {
      setError("Please enter a username or email.");
      return;
    }

    setIsInviting(true);

    try {
      const res = await TripAPI.inviteUser(tripId, identifier.trim());
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
      {/* Overlay with brand-consistent styling */}
      <div
        className="fixed inset-0 bg-[#1F474A]/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal Panel: Following brand glassmorphism and card patterns */}
        <Dialog.Panel className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 max-w-md w-full transition-all duration-300">
          {/* Title: Brand typography and colors */}
          <Dialog.Title className="text-2xl sm:text-3xl font-bold text-[#1F474A] mb-6 tracking-tight">
            Invite User to Trip
          </Dialog.Title>

          {/* Input field: Following form element patterns */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">
              Username or Email
            </label>
            <input
              type="text"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInviting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-4">
              <p className="text-green-700 text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {/* Button Container */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8">
            {/* Cancel Button: Secondary button style */}
            <button
              onClick={onClose}
              className="text-[#416B6B] font-semibold px-6 py-3 rounded-xl hover:bg-[#416B6B]/10 transition-all duration-200 border border-[#416B6B]/20 hover:border-[#416B6B]/40 focus:outline-none focus:ring-2 focus:ring-[#416B6B]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInviting}
            >
              Cancel
            </button>

            {/* Send Invite Button: Primary CTA button */}
            <button
              onClick={handleInvite}
              className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isInviting}
            >
              {isInviting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full border-2 border-white/20 border-t-white h-4 w-4"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
