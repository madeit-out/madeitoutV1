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
      {/* Darker, more immersive overlay */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal Panel: Darker Ocean Blue background, softer rounded corners, modern shadow */}
        <Dialog.Panel className="bg-[#012A3D] rounded-xl p-8 max-w-md w-full shadow-2xl text-white">
          {/* Title: Light Teal Blue, bolder font */}
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#72ADBF]">
            Invite User to Trip
          </Dialog.Title>

          {/* Input field: Deep Ocean Blue background, white text, light teal border, rounded-lg */}
          <input
            type="text"
            placeholder="Enter username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
            disabled={isInviting}
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>} {/* Error color */}
          {successMessage && (
            <p className="text-green-400 text-sm mb-4">{successMessage}</p> 
          )}

          <div className="flex justify-end space-x-3 mt-6"> {/* Increased space-x and mt */}
            {/* Cancel Button: Secondary style with dark gray background, subtle hover */}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInviting}
            >
              Cancel
            </button>
            {/* Send Invite Button: Primary style with bright cyan, subtle hover transform */}
            <button
              onClick={handleInvite}
              className="px-6 py-3 rounded-lg bg-[#0395A7] text-white hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isInviting}
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
