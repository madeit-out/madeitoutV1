import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { EventAPI } from "../adapters/apiAdapter";
import { useParams } from "react-router-dom";
import CreateEventModal from "./CreateEventModal";
import InviteUserModal from "./InviteUserModal";
import { useUser } from "../context/UserContext";

import { 
  Calendar, Plus, UserPlus, ChevronLeft, ChevronRight, MapPin, Clock, 
  DollarSign, Users, Trash2, Edit, Plane, Hotel, Car, UtensilsCrossed, PartyPopper 
} from "lucide-react";

export default function Itinerary() {
  const { tripId } = useParams();
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const carouselRef = useRef(null);
  
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

  const currentDay = sortedDates[currentDayIndex];
  const eventsForCurrentDay = currentDay ? eventsByDay[currentDay] : [];

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
    if(carouselRef.current) carouselRef.current.style.cursor = "grabbing";
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6 font-['Inter']">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-[#E08544] mr-4" />
            <h1 className="text-4xl sm:text-5xl font-black text-[#1F474A] leading-tight tracking-tight">
              Trip Itinerary
            </h1>
          </div>
          <div className="flex space-x-4 items-center">
            <button onClick={() => setModal({ type: 'invite' })} className="flex items-center bg-[#F5F5DC]/90 backdrop-blur-sm text-[#416B6B] font-semibold px-4 py-3 rounded-xl border-2 border-[#416B6B]/20 hover:bg-[#416B6B] hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30 shadow-md">
              <UserPlus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Invite User</span>
            </button>
            <button onClick={() => setModal({ type: 'create' })} className="flex items-center bg-gradient-to-r from-[#416B6B] to-[#E08544] text-[#F5F5DC] font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide">
              <Plus className="w-5 h-5 mr-2" />
              Add Event
            </button>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-[#F5F5DC]/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-[#416B6B]/50 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-[#1F474A] mb-4">No Events Yet</h2>
              <p className="text-base text-[#1F474A]/70 leading-relaxed font-medium mb-8">
                Start planning your adventure by adding your first event to the itinerary.
              </p>
              <button onClick={() => setModal({ type: 'create' })} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-[#F5F5DC] font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 tracking-wide uppercase">
                Create First Event
              </button>
            </div>
          </div>
        ) : (
          <div ref={carouselRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove} className="relative flex items-center justify-center overflow-hidden cursor-grab">
            <button onClick={showPreviousDay} disabled={!canScrollLeft} className={`absolute left-4 top-1/2 -translate-y-1/2 bg-[#F5F5DC]/90 backdrop-blur-sm text-[#416B6B] p-3 rounded-full shadow-xl z-10 border border-white/20 transition-all duration-300 ${!canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-[#416B6B] hover:text-white transform hover:scale-110"}`} aria-label="Previous day">
              <ChevronLeft className="w-6 h-6" />
            </button>
            {currentDay && (
              <div key={currentDay} className="w-full max-w-2xl mx-auto bg-[#F5F5DC]/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mx-20">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-[#416B6B] mr-3" />
                    <h2 className="text-3xl font-bold text-[#1F474A] tracking-tight">{format(parseISO(currentDay), "eeee, MMMM d")}</h2>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#416B6B] to-[#E08544] rounded-full mx-auto"></div>
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {eventsForCurrentDay.map((event) => (
                    <div key={event._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 flex items-center hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border border-white/40" onClick={() => setModal({ type: 'view', data: event })}>
                      <div className="mr-4">{getEventIcon(event.type, "w-8 h-8")}</div>
                      <div className="flex-grow">
                        <div className="text-lg font-bold text-[#1F474A] mb-1">{event.title}</div>
                        <div className="flex items-center text-sm text-[#1F474A]/60 space-x-4">
                          <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{event.start_time ? format(parseISO(event.start_time), "p") : "No time"}</div>
                          {event.location && <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.location}</div>}
                          {event.cost && <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{event.cost.toLocaleString()}</div>}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 ml-4">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={showNextDay} disabled={!canScrollRight} className={`absolute right-4 top-1/2 -translate-y-1/2 bg-[#F5F5DC]/90 backdrop-blur-sm text-[#416B6B] p-3 rounded-full shadow-xl z-10 border border-white/20 transition-all duration-300 ${!canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-[#416B6B] hover:text-white transform hover:scale-110"}`} aria-label="Next day">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        <Dialog open={modal.type === 'view'} onClose={() => setModal({ type: null })} className="relative z-50">
          <div className="fixed inset-0 bg-[#1F474A]/70 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-[#F5F5DC]/95 backdrop-blur-sm rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20">
              <div className="flex items-center mb-6">{getEventIcon(modal.data?.type, "w-8 h-8")}<Dialog.Title className="text-2xl font-bold text-[#1F474A] ml-3 tracking-tight">{modal.data?.title}</Dialog.Title></div>
              <div className="space-y-4 text-[#1F474A]/70">
                {/* ... Dialog content ... */}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => handleDelete(modal.data._id)} className="flex items-center text-red-500 font-semibold px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-200"><Trash2 className="w-5 h-5 mr-2" /> Delete</button>
                <button onClick={() => setModal({ type: 'edit', data: modal.data })} className="flex items-center bg-[#416B6B] text-white font-semibold px-4 py-3 rounded-xl hover:bg-[#355858] transition-all duration-200"><Edit className="w-5 h-5 mr-2" /> Edit</button>
                <button onClick={() => setModal({ type: null })} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-[#F5F5DC] font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-transform transform hover:scale-105">Close</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <CreateEventModal isOpen={modal.type === 'create' || modal.type === 'edit'} onClose={() => setModal({ type: null })} tripId={tripId} onEventSaved={onEventSaved} eventToEdit={modal.type === 'edit' ? modal.data : null} />
        <InviteUserModal isOpen={modal.type === 'invite'} onClose={() => setModal({ type: null })} tripId={tripId} />
      </div>
    </div>
  );
}