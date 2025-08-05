import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { EventAPI } from "../adapters/apiAdapter";
import { useParams } from "react-router-dom";
import CreateEventModal from "./CreateEventModal";
import InviteUserModal from "./InviteUserModal";

import { useUser } from "../context/UserContext";
import ProfileButton from "./ProfileButton";

export default function Itinerary() {
  const [eventsByDay, setEventsByDay] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { tripId } = useParams();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const { user, loadingUser } = useUser();
  const chatUserId = user ? user.id : crypto.randomUUID();

  useEffect(() => {
    if (!tripId) return; // Don't fetch if tripId is undefined/null

    const fetchEvents = async () => {
      try {
        const events = await EventAPI.getTripEvents(tripId);
        if (Array.isArray(events)) {
          groupEventsByDay(events);
        } else {
          console.warn(
            "Itinerary useEffect: Expected array of events, got:",
            events
          );
        }
      } catch (err) {
        console.error("Itinerary useEffect: Failed to load events:", err);
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
    const newSortedDates = Object.keys(grouped).sort();
    if (newSortedDates.length > 0 && currentDayIndex >= newSortedDates.length) {
      setCurrentDayIndex(newSortedDates.length - 1);
    } else if (newSortedDates.length === 0) {
      setCurrentDayIndex(0);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      await EventAPI.deleteEvent(eventId);
      const updatedEvents = { ...eventsByDay };
      for (let date in updatedEvents) {
        const initialLength = updatedEvents[date].length;
        updatedEvents[date] = updatedEvents[date].filter(
          (e) => e._id !== eventId
        );
        if (updatedEvents[date].length < initialLength) {
          break;
        }
      }
      setEventsByDay(updatedEvents);
      const newSortedDates = Object.keys(updatedEvents).sort();
      if (newSortedDates.length === 0) {
        setCurrentDayIndex(0);
      } else if (currentDayIndex >= newSortedDates.length) {
        setCurrentDayIndex(newSortedDates.length - 1);
      }
    } catch (err) {
      alert("Failed to delete event. Please try again.");
    }
  };

  const onEventCreated = async () => {
    try {
      const events = await EventAPI.getTripEvents(tripId);
      groupEventsByDay(events);
    } catch (err) {
      console.error("Failed to refresh events after creation:", err);
    }
    setIsCreateModalOpen(false);
  };

  const getEventIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "flight":
        return "✈️";
      case "lodging":
        return "🏨";
      case "activity":
        return "🎉";
      case "transport":
        return "🚗";
      case "food":
        return "🍽️";
      default:
        return "🗓️";
    }
  };

  const sortedDates = Object.keys(eventsByDay).sort();
  const canScrollLeft = currentDayIndex > 0;
  const canScrollRight = currentDayIndex < sortedDates.length - 1;

  const showPreviousDay = () =>
    canScrollLeft && setCurrentDayIndex(currentDayIndex - 1);
  const showNextDay = () =>
    canScrollRight && setCurrentDayIndex(currentDayIndex + 1);

  const currentDay = sortedDates[currentDayIndex];
  const eventsForCurrentDay = currentDay ? eventsByDay[currentDay] : [];

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = "grabbing";
  };
  const onMouseLeave = () => {
    setIsDragging(false);
    if (carouselRef.current) carouselRef.current.style.cursor = "grab";
  };
  const onMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) carouselRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6 font-inter">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#72ADBF]">Trip Itinerary</h1>
          <div className="flex space-x-3 items-center">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="text-white text-md font-semibold uppercase py-3 px-6 rounded-lg border border-[#0395A7] bg-[#0395A7] hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              Invite User
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-white text-md font-semibold uppercase py-3 px-6 rounded-lg border border-[#0395A7] bg-[#0395A7] hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              + Add Event
            </button>
            <div className="ml-auto">
              <ProfileButton />
            </div>
          </div>
        </div>

        {Object.keys(eventsByDay).length === 0 ? (
          <p className="text-center text-gray-300 text-lg mt-12">
            No events planned for this trip yet.
          </p>
        ) : (
          <div
            ref={carouselRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="relative flex items-center justify-center overflow-hidden cursor-grab"
          >
            <button
              onClick={showPreviousDay}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg z-10 hover:bg-opacity-75 transition-colors ${
                !canScrollLeft ? "opacity-30 cursor-not-allowed" : ""
              }`}
              aria-label="Previous day"
            >
              &#8592;
            </button>

            {currentDay && (
              <div
                key={currentDay}
                className="w-full max-w-xl mx-auto bg-[#012A3D] rounded-2xl shadow-xl p-6 border border-[#01374A]"
              >
                <h2 className="text-2xl font-bold mb-4 text-[#72ADBF] text-center">
                  {format(parseISO(currentDay), "eeee, MMMM d")}
                </h2>
                <div className="space-y-4">
                  {eventsForCurrentDay.map((event) => (
                    <div
                      key={event._id}
                      className="bg-[#01374A] rounded-xl shadow-md px-5 py-4 flex items-center hover:bg-[#012A3D] cursor-pointer transition-colors duration-200"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="text-2xl mr-4">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="text-lg font-medium text-white">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
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
                        className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200 ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={showNextDay}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg z-10 hover:bg-opacity-75 transition-colors ${
                !canScrollRight ? "opacity-30 cursor-not-allowed" : ""
              }`}
              aria-label="Next day"
            >
              &#8594;
            </button>
          </div>
        )}

        <Dialog
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-[#012A3D] rounded-xl max-w-md w-full p-8 shadow-2xl text-white">
              <Dialog.Title className="text-2xl font-bold mb-6 text-[#72ADBF]">
                {selectedEvent?.title}
              </Dialog.Title>
              <div className="space-y-3 text-gray-300">
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
                  <strong>Type:</strong>{" "}
                  <span className="capitalize">
                    {selectedEvent?.type || "Activity"}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="capitalize">
                    {selectedEvent?.status || "Planned"}
                  </span>
                </p>
                {selectedEvent?.cost && (
                  <p>
                    <strong>Cost:</strong> $
                    {selectedEvent.cost.toLocaleString()}
                  </p>
                )}
                <p>
                  <strong>Notes:</strong> {selectedEvent?.notes || "—"}
                </p>
                {selectedEvent?.participants && (
                  <p>
                    <strong>Participants:</strong>{" "}
                    {selectedEvent.participants.length} attending
                  </p>
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          tripId={tripId}
          onEventCreated={onEventCreated}
        />
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          tripId={tripId}
        />
      </div>
    </div>
  );
}
