import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { EventAPI } from "../adapters/apiAdapter";
import { useParams } from "react-router-dom";
import CreateEventModal from "./CreateEventModal";
import InviteUserModal from "./InviteUserModal";
import TripChat from "./TripChat";
import { useUser } from "../context/UserContext";
import ProfileButton from "./ProfileButton";

export default function Itinerary() {
  const [eventsByDay, setEventsByDay] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { tripId } = useParams();

  // State for current active day index
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Ref for the scrollable container for grab/swipe
  const carouselRef = useRef(null);
  // State for drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0); // Using a state to track scrollLeft

  const { user, loadingUser } = useUser();
  const chatUserId = user ? user.id : crypto.randomUUID();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await EventAPI.getTripEvents(tripId);
        groupEventsByDay(events);
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
    // After grouping, ensure currentDayIndex is valid
    const newSortedDates = Object.keys(grouped).sort();
    if (newSortedDates.length > 0 && currentDayIndex >= newSortedDates.length) {
      setCurrentDayIndex(newSortedDates.length - 1);
    } else if (newSortedDates.length === 0) {
      setCurrentDayIndex(0); // Reset if no days
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    try {
      await EventAPI.deleteEvent(eventId);
      const updatedEvents = { ...eventsByDay };
      let eventDateRemoved = null;

      for (let date in updatedEvents) {
        const initialLength = updatedEvents[date].length;
        updatedEvents[date] = updatedEvents[date].filter(
          (e) => e._id !== eventId
        );
        if (updatedEvents[date].length < initialLength) {
          if (updatedEvents[date].length === 0) {
            eventDateRemoved = date;
          }
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
      console.error("Itinerary handleDelete: Delete failed:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const onEventCreated = async (newEventData) => {
    try {
      const events = await EventAPI.getTripEvents(tripId);
      groupEventsByDay(events);

      const newEventDate = format(parseISO(newEventData.start_time), 'yyyy-MM-dd');
      const newSortedDates = Object.keys(eventsByDay).sort();
      const newIndex = newSortedDates.indexOf(newEventDate);
      if (newIndex !== -1) {
        setCurrentDayIndex(newIndex);
      }
    } catch (err) {
      console.error("Itinerary onEventCreated: Failed to refresh events after creation:", err);
    }
    closeCreateModal();
  };

  // Carousel navigation functions
  const sortedDates = Object.keys(eventsByDay).sort();
  const canScrollLeft = currentDayIndex > 0;
  const canScrollRight = currentDayIndex < sortedDates.length - 1;

  const showPreviousDay = () => {
    if (canScrollLeft) {
      setCurrentDayIndex(prevIndex => prevIndex - 1);
    }
  };

  const showNextDay = () => {
    if (canScrollRight) {
      setCurrentDayIndex(prevIndex => prevIndex + 1);
    }
  };

  const currentDay = sortedDates[currentDayIndex];
  const eventsForCurrentDay = currentDay ? eventsByDay[currentDay] : [];

  // --- Drag/Swipe Handlers ---
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection during drag
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplier for faster scroll
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Touch handlers (similar logic to mouse)
  const onTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Effect to handle programmatic scrolling when currentDayIndex changes
  useEffect(() => {
    if (carouselRef.current && sortedDates.length > 0) {
      // Calculate the scroll position for the current day
      // Assuming each day card has a fixed width (e.g., w-full or max-w-xl)
      // We need to calculate the offset to bring the current day into view.
      // For a single day showing at a time, we want to snap to that day.
      // This might require a more complex calculation if cards are not full width
      // or if there's padding/margin between them.
      // For now, let's assume the carousel container itself will handle the scroll
      // and we just update the index. The UI will re-render the correct day.
    }
  }, [currentDayIndex, sortedDates]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6 font-inter">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#72ADBF]">Trip Itinerary</h1>
          <div className="flex space-x-3 items-center">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="text-white text-md font-semibold uppercase
                         py-3 px-6 rounded-lg border border-[#0395A7]
                         bg-[#0395A7] hover:bg-[#5E877D]
                         transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              Invite User
            </button>
            <button
              onClick={openCreateModal}
              className="text-white text-md font-semibold uppercase
                         py-3 px-6 rounded-lg border border-[#0395A7]
                         bg-[#0395A7] hover:bg-[#5E877D]
                         transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              + Add Event
            </button>
            <div className="ml-auto">
              <ProfileButton />
            </div>
          </div>
        </div>

        {Object.keys(eventsByDay).length === 0 ? (
            <p className="text-center text-gray-300 text-lg mt-12">No events planned for this trip yet. Start by adding one!</p>
        ) : (
          <div
            ref={carouselRef} // Attach ref for drag/swipe
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
            className="relative flex items-center justify-center overflow-hidden cursor-grab" // Added overflow-hidden and cursor-grab
          >
            {/* Left Arrow */}
            <button
              onClick={showPreviousDay}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg z-10 hover:bg-opacity-75 transition-colors
                         ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''}`}
              aria-label="Previous day"
            >
              &#8592; {/* Left arrow character */}
            </button>

            {/* Single Day Event Card */}
            {currentDay && (
              <div
                key={currentDay}
                className="w-full max-w-xl mx-auto bg-[#012A3D] rounded-2xl shadow-xl p-6 border border-[#01374A]" // Center and fill width
              >
                <h2 className="text-2xl font-bold mb-4 text-[#72ADBF] text-center">
                  {format(parseISO(currentDay), "eeee, MMMM d")}
                </h2>
                <div className="space-y-4">
                  {eventsForCurrentDay.length === 0 ? (
                    <p className="text-gray-400 text-center">No events for this day.</p>
                  ) : (
                    eventsForCurrentDay.map((event) => (
                      <div
                        key={event._id}
                        className="bg-[#01374A] rounded-xl shadow-md px-5 py-4 flex justify-between items-center hover:bg-[#012A3D] cursor-pointer transition-colors duration-200"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div>
                          <div className="text-lg font-medium text-white">{event.title}</div>
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
                          className="text-red-500 hover:text-red-400 hover:underline transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Right Arrow */}
            <button
              onClick={showNextDay}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg z-10 hover:bg-opacity-75 transition-colors
                         ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : ''}`}
              aria-label="Next day"
            >
              &#8594; {/* Right arrow character */}
            </button>
          </div>
        )}

        {/* Render the new TripChat component here */}
        {tripId && chatUserId && !loadingUser && <TripChat tripId={tripId} userId={chatUserId} />}

        {/* Modal for viewing selected event */}
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
                  <strong>Description:</strong>{" "}
                  {selectedEvent?.description || "—"}
                </p>
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
    </div>
  );
}