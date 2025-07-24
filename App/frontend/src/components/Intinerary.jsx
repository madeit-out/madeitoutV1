import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { EventAPI } from "../adapters/apiAdapter";
import { useParams } from "react-router-dom";
import CreateEventModal from "./CreateEventModal";
import InviteUserModal from "./InviteUserModal";

export default function Itinerary() {
  const [eventsByDay, setEventsByDay] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { tripId } = useParams();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await EventAPI.getTripEvents(tripId);
        groupEventsByDay(events);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };
    fetchEvents();
  }, [tripId]);

  const groupEventsByDay = (events) => {
    const grouped = {};

    events.forEach((event) => {
      if (!event.start_time) return;
      const date = event.start_time.split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });

    for (let day in grouped) {
      grouped[day].sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
    }

    setEventsByDay(grouped);
  };

  const handleDelete = async (eventId) => {
    try {
      await EventAPI.deleteEvent(eventId);
      const updatedEvents = { ...eventsByDay };
      for (let date in updatedEvents) {
        updatedEvents[date] = updatedEvents[date].filter(
          (e) => e._id !== eventId
        );
        if (updatedEvents[date].length === 0) {
          delete updatedEvents[date];
        }
      }
      setEventsByDay(updatedEvents);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const onEventCreated = async () => {
    try {
      const events = await EventAPI.getTripEvents(tripId);
      groupEventsByDay(events);
    } catch (err) {
      console.error("Failed to refresh events:", err);
    }
    closeCreateModal();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Trip Itinerary</h1>
        <div className="space-x-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Invite User
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            + Add Event
          </button>
        </div>
      </div>

      {Object.keys(eventsByDay)
        .sort()
        .map((date) => (
          <div key={date} className="border rounded-2xl shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">
              {format(parseISO(date), "eeee, MMMM d")}
            </h2>
            <div className="space-y-2">
              {eventsByDay[date].map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-sm px-4 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div>
                    <div className="text-lg font-medium">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {event.start_time
                        ? format(parseISO(event.start_time), "p")
                        : "No time"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event._id);
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Modal for viewing selected event */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4">
              {selectedEvent?.title}
            </Dialog.Title>
            <div className="space-y-2">
              <p>
                <strong>Time:</strong>{" "}
                {selectedEvent?.start_time
                  ? format(parseISO(selectedEvent.start_time), "PPPPp")
                  : "No start time"}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent?.location || "—"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedEvent?.description || "—"}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Event and Invite Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        tripId={tripId}
        onEventCreated={onEventCreated}
      />
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        tripId={tripId}
      />
    </div>
  );
}
