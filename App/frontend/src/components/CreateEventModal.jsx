import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { EventAPI } from "../adapters/apiAdapter";

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
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Create New Event
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="location"
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <label className="block">
              Start Time:
              <input
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              End Time:
              <input
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </label>

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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
