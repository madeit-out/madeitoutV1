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
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Invite User to Trip
          </Dialog.Title>

          <input
            type="text"
            placeholder="Enter username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mb-2"
            disabled={isInviting}
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-sm mb-2">{successMessage}</p>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              disabled={isInviting}
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
