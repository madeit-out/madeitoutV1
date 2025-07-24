import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { EventAPI } from "../adapters/apiAdapter"; // Ensure this path is correct, e.g., "../adapters/apiAdapter.js" if needed

export default function CreateEventModal({
  isOpen,
  onClose,
  tripId,
  onEventCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createdEvent = await EventAPI.createEvent(tripId, formData);
      setLoading(false);
      onEventCreated(createdEvent); // pass the new event back
      onClose();
      setFormData({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
      });
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Darker, more immersive overlay */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal Panel: Darker Ocean Blue background, softer rounded corners, modern shadow */}
        <Dialog.Panel className="bg-[#012A3D] rounded-xl max-w-md w-full p-8 shadow-2xl text-white">
          {/* Title: Light Teal Blue, bolder font */}
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#72ADBF]">
            Create New Event
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-5"> {/* Increased space-y */}
            {/* Input fields: Deep Ocean Blue background, white text, light teal border, rounded-lg */}
            <input
              name="title"
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
            />
            <input
              name="location"
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              rows={3}
            />
            <label className="block text-gray-300"> {/* Label text color */}
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
            <label className="block text-gray-300"> {/* Label text color */}
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

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>} {/* Error color */}

            <div className="flex justify-end space-x-3 mt-6"> {/* Increased space-x and mt */}
              {/* Cancel Button: Secondary style with dark gray background, subtle hover */}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {/* Create Event Button: Primary style with bright cyan, subtle hover transform */}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-[#0395A7] text-white hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF] disabled:opacity-50 disabled:cursor-not-allowed"
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
