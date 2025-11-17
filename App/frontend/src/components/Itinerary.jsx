import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { EventAPI } from "../adapters/apiAdapter";
import { useParams } from "react-router-dom";
import CreateEventModal from "./CreateEventModal";
import InviteUserModal from "./InviteUserModal";
import TripChatModal from "./TripChatModal";
import { useUser } from "../context/UserContext";

import { 
  Calendar, Plus, UserPlus, ChevronLeft, ChevronRight, MapPin, Clock, 
  DollarSign, Users, Trash2, Edit, Plane, Hotel, Car, UtensilsCrossed, PartyPopper, MessageSquare 
} from "lucide-react";

export default function Itinerary() {
  const { tripId } = useParams();
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const carouselRef = useRef(null);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const fetchEvents = async () => {
    if (!tripId) return;
    try {
      const eventData = await EventAPI.getTripEvents(tripId);
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [tripId]);

  const onEventSaved = () => {
    setModal({ type: null });
    fetchEvents();
  };
  
  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await EventAPI.deleteEvent(eventId);
        setModal({ type: null });
        fetchEvents();
      } catch(err) {
        alert(err.message || "Failed to delete event.");
      }
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
  };
  
  const eventsByDay = useMemo(() => {
    const grouped = {};
    events.forEach((event) => {
      if (!event.start_time) return;
      const date = event.start_time.split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });
    for (let day in grouped) {
      grouped[day].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }
    return grouped;
  }, [events]);

  const sortedDates = useMemo(() => Object.keys(eventsByDay).sort(), [eventsByDay]);
  
  useEffect(() => {
    if (sortedDates.length > 0 && currentDayIndex >= sortedDates.length) {
      setCurrentDayIndex(sortedDates.length - 1);
    } else if (sortedDates.length === 0) {
      setCurrentDayIndex(0);
    }
  }, [sortedDates, currentDayIndex]);
  
  const getEventIcon = (type, size = "w-6 h-6") => {
    const iconClass = `${size} text-[#E08544]`;
    switch (type?.toLowerCase()) {
      case "flight": return <Plane className={iconClass} />;
      case "lodging": return <Hotel className={iconClass} />;
      case "activity": return <PartyPopper className={iconClass} />;
      case "transport": return <Car className={iconClass} />;
      case "food": return <UtensilsCrossed className={iconClass} />;
      default: return <Calendar className={iconClass} />;
    }
  };

  const canScrollLeft = currentDayIndex > 0;
  const canScrollRight = currentDayIndex < sortedDates.length - 1;

  const showPreviousDay = () => canScrollLeft && setCurrentDayIndex(currentDayIndex - 1);
  const showNextDay = () => canScrollRight && setCurrentDayIndex(currentDayIndex + 1);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  const currentDay = sortedDates[currentDayIndex];
  const eventsForCurrentDay = currentDay ? eventsByDay[currentDay] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6 font-['Inter'] custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/*Header */}
        <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center">
            <div className="w-2 h-12 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-6"></div>
            <Calendar className="w-10 h-10 text-[#E08544] mr-4" />
            <h1 className="text-5xl font-black text-black leading-tight tracking-tight">
              Trip Itinerary
            </h1>
          </div>
          <div className="flex space-x-4 items-center">
            <button 
              onClick={openChat} 
              className="group relative overflow-hidden flex items-center bg-gradient-to-r from-[#E08544] to-[#E08544]/90 text-white font-bold px-6 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Trip Chat</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
            <button 
              onClick={() => setModal({ type: 'invite' })} 
              className="group relative overflow-hidden flex items-center bg-white/90 backdrop-blur-md text-[#416B6B] font-bold px-6 py-4 rounded-2xl border-2 border-[#416B6B]/20 hover:bg-[#416B6B] hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30 shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Invite User</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
            <button 
              onClick={() => setModal({ type: 'create' })} 
              className="group relative overflow-hidden flex items-center bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide"
            >
              <span className="relative z-10 flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Add Event
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          /* Enhanced Empty State */
          <div className={`text-center py-20 transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-16 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black text-black mb-6 tracking-tight">No Events Yet</h2>
              <p className="text-lg text-black font-semibold leading-relaxed mb-10">
                Start planning your adventure by adding your first event to the itinerary.
              </p>
              <button 
                onClick={() => setModal({ type: 'create' })} 
                className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide uppercase text-lg"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Plus className="w-6 h-6 mr-3" />
                  Create First Event
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        ) : (
          /* Carousel */
          <div 
            ref={carouselRef} 
            onMouseDown={onMouseDown} 
            onMouseLeave={onMouseLeave} 
            onMouseUp={onMouseUp} 
            onMouseMove={onMouseMove} 
            className={`relative flex items-center justify-center overflow-hidden cursor-grab transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <button 
              onClick={showPreviousDay} 
              disabled={!canScrollLeft} 
              className={`absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-[#416B6B] p-4 rounded-full shadow-2xl z-10 border border-white/30 transition-all duration-300 ${
                !canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-[#416B6B] hover:text-white transform hover:scale-110"
              }`} 
              aria-label="Previous day"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            {currentDay && (
              <div key={currentDay} className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 mx-24">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
                    <Calendar className="w-8 h-8 text-[#416B6B] mr-4" />
                    <h2 className="text-4xl font-black text-black tracking-tight">{format(parseISO(currentDay), "eeee, MMMM d")}</h2>
                  </div>
                  <div className="w-32 h-1 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-full mx-auto"></div>
                </div>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {eventsForCurrentDay.map((event, index) => (
                    <div 
                      key={event._id} 
                      className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 flex items-center hover:shadow-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 border border-white/40 ${
                        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      onClick={() => setModal({ type: 'view', data: event })}
                    >
                      <div className="mr-6">{getEventIcon(event.type, "w-10 h-10")}</div>
                      <div className="flex-grow">
                        <div className="text-xl font-black text-black mb-3">{event.title}</div>
                        <div className="flex items-center text-base text-black/70 space-x-6">
                          <div className="flex items-center font-semibold">
                            <Clock className="w-5 h-5 mr-2 text-[#416B6B]" />
                            {event.start_time ? format(parseISO(event.start_time), "p") : "No time"}
                          </div>
                          {event.location && (
                            <div className="flex items-center font-semibold">
                              <MapPin className="w-5 h-5 mr-2 text-[#E08544]" />
                              {event.location}
                            </div>
                          )}
                          {event.cost && (
                            <div className="flex items-center font-semibold">
                              <DollarSign className="w-5 h-5 mr-2 text-[#416B6B]" />
                              ${event.cost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }} 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all duration-300 ml-6 transform hover:scale-110"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button 
              onClick={showNextDay} 
              disabled={!canScrollRight} 
              className={`absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-[#416B6B] p-4 rounded-full shadow-2xl z-10 border border-white/30 transition-all duration-300 ${
                !canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-[#416B6B] hover:text-white transform hover:scale-110"
              }`} 
              aria-label="Next day"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* Event View Modal */}
        <Dialog open={modal.type === 'view'} onClose={() => setModal({ type: null })} className="relative z-50">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full p-10 shadow-2xl border border-white/30">
              <div className="flex items-center mb-8">
                {getEventIcon(modal.data?.type, "w-10 h-10")}
                <Dialog.Title className="text-3xl font-black text-black ml-4 tracking-tight">
                  {modal.data?.title}
                </Dialog.Title>
              </div>
              <div className="space-y-6 text-black font-semibold">
                {/* Enhanced dialog content */}
              </div>
              <div className="space-y-4">
                
                <div className="text-lg font-semibold">Title: {modal.data?.title}</div>
                <div className="text-lg font-semibold">Location: {modal.data?.location}</div>
                <div className="text-lg font-semibold">
                  <span className="font-bold">Start Time:</span> {modal.data?.start_time ? format(parseISO(modal.data.start_time), "p") : "No time"}
                </div>
                <div className="text-lg font-semibold">
                  <span className="font-bold">End Time:</span> {modal.data?.end_time ? format(parseISO(modal.data.end_time), "p") : "No time"}
                </div>
                <div className="text-lg font-semibold">Cost: ${modal.data?.cost?.toLocaleString()}</div>
                <div className="text-lg font-semibold">Type: {modal.data?.type}</div>
                <div className="text-lg font-semibold">Notes: {modal.data?.notes}</div>
                <div className="text-lg font-semibold">Status: {modal.data?.status}</div>
                
              </div>

              <div className="mt-10 flex justify-end gap-4">
                <button 
                  onClick={() => handleDelete(modal.data._id)} 
                  className="group relative overflow-hidden flex items-center text-red-500 font-bold px-6 py-4 rounded-2xl hover:bg-red-500/10 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center">
                    <Trash2 className="w-5 h-5 mr-2" /> 
                    Delete
                  </span>
                </button>
                <button 
                  onClick={() => setModal({ type: 'edit', data: modal.data })} 
                  className="group relative overflow-hidden flex items-center bg-[#416B6B] text-white font-bold px-6 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    <Edit className="w-5 h-5 mr-2" /> 
                    Edit
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>
                <button 
                  onClick={() => setModal({ type: null })} 
                  className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">Close</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <CreateEventModal isOpen={modal.type === 'create' || modal.type === 'edit'} onClose={() => setModal({ type: null })} tripId={tripId} onEventSaved={onEventSaved} eventToEdit={modal.type === 'edit' ? modal.data : null} />
        <InviteUserModal isOpen={modal.type === 'invite'} onClose={() => setModal({ type: null })} tripId={tripId} />
        <TripChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} tripId={tripId} />
      </div>
    </div>
  );
}