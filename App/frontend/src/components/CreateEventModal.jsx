import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // NEW: Import for navigation
import { Dialog } from "@headlessui/react";
import { EventAPI } from "../adapters/apiAdapter";

export default function CreateEventModal({
  isOpen,
  onClose,
  tripId,
  onEventCreated,
}) {
  const navigate = useNavigate(); // NEW: Hook for navigation

  const getInitialFormState = () => ({
    title: "",
    location: "",
    start_time: "",
    end_time: "",
    notes: "",
    type: "activity",
    cost: "",
    status: "planned",
  });

  const [formData, setFormData] = useState(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormState());
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        trip_id: tripId,
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      const createdEvent = await EventAPI.createEvent(payload);
      setLoading(false);
      onEventCreated(createdEvent.event);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#012A3D] rounded-xl max-w-md w-full p-8 shadow-2xl text-white">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#72ADBF]">
            Create New Event
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="title"
              type="text"
              placeholder="Event Title (e.g., Flight to Tokyo)"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
            />
            <input
              name="location"
              type="text"
              placeholder="Airport or Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-[#01374A] text-white border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              >
                <option value="activity">Activity</option>
                <option value="flight">Flight</option>
                <option value="lodging">Lodging</option>
                <option value="transport">Transport</option>
                <option value="food">Food</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#01374A] text-white border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              >
                <option value="planned">Planned</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* NEW: "Book Now" button appears when event type is 'flight' */}
            {formData.type === "flight" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/search-flights")}
                  className="w-full text-[#72ADBF] font-semibold py-3 px-6 rounded-lg border border-[#72ADBF] hover:text-white hover:bg-[#0395A7] hover:bg-opacity-20 transition-all duration-300"
                >
                  Find & Book a Flight
                </button>
              </div>
            )}

            <input
              name="cost"
              type="number"
              placeholder="Cost (e.g., 50.00)"
              value={formData.cost}
              onChange={handleChange}
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              step="0.01"
              min="0"
            />
            <textarea
              name="notes"
              placeholder="Notes (e.g., Confirmation #, seat info)"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              rows={3}
            />
            <label className="block text-gray-300">
              Start Time:
              <input
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-[#01374A] text-white border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              />
            </label>
            <label className="block text-gray-300">
              End Time:
              <input
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full mt-1 bg-[#01374A] text-white border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              />
            </label>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-[#0395A7] text-white hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF] disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
