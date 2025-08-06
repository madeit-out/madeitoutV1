import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { EventAPI } from "../adapters/apiAdapter";
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Clock, DollarSign, FileText } from "lucide-react";

export default function CreateEventModal({
  isOpen,
  onClose,
  tripId,
  onEventSaved,
  eventToEdit,
}) {
  const navigate = useNavigate();
  const isEditing = !!eventToEdit;

  const getInitialFormState = () => ({
    title: "", location: "", start_time: "", end_time: "",
    notes: "", type: "activity", cost: "", status: "planned",
  });

  const [formData, setFormData] = useState(getInitialFormState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing && eventToEdit) {
        setFormData({
          title: eventToEdit.title || '',
          location: eventToEdit.location || '',
          notes: eventToEdit.notes || '',
          type: eventToEdit.type || 'activity',
          status: eventToEdit.status || 'planned',
          cost: eventToEdit.cost || '',
          start_time: eventToEdit.start_time ? format(parseISO(eventToEdit.start_time), "yyyy-MM-dd'T'HH:mm") : '',
          end_time: eventToEdit.end_time ? format(parseISO(eventToEdit.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        });
      } else {
        setFormData(getInitialFormState());
      }
    }
  }, [isOpen, eventToEdit, isEditing]);

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
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      if (isEditing) {
        await EventAPI.updateEvent(eventToEdit._id, payload);
      } else {
        await EventAPI.createEvent(tripId, payload);
      }
      
      onEventSaved();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to save event");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-[#1F474A]/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6 text-[#416B6B] mr-3" />
            <Dialog.Title className="text-2xl font-bold text-[#1F474A] tracking-tight">
              {isEditing ? "Edit Event" : "Create New Event"}
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">Event Title</label>
              <input name="title" type="text" placeholder="Flight to Tokyo, Museum Visit, etc." value={formData.title} onChange={handleChange} required className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2"><MapPin className="w-4 h-4 inline mr-1" />Location</label>
              <input name="location" type="text" placeholder="Airport, Hotel, Restaurant, etc." value={formData.location} onChange={handleChange} className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">Event Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-4 bg-white/80 text-[#1F474A] border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm">
                  <option value="activity">Activity</option><option value="flight">Flight</option><option value="lodging">Lodging</option><option value="transport">Transport</option><option value="food">Food</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-4 bg-white/80 text-[#1F474A] border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm">
                  <option value="planned">Planned</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {formData.type === "flight" && (
              <div className="bg-gradient-to-r from-[#416B6B]/10 to-[#E08544]/10 rounded-2xl p-4 border border-[#416B6B]/20">
                <button type="button" onClick={() => navigate("/search-flights")} className="w-full text-[#416B6B] font-semibold py-3 px-6 rounded-xl border-2 border-[#416B6B]/20 hover:bg-[#416B6B] hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30">
                  Find & Book a Flight
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2"><DollarSign className="w-4 h-4 inline mr-1" />Cost (Optional)</label>
              <input name="cost" type="number" placeholder="50.00" value={formData.cost} onChange={handleChange} className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" step="0.01" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2"><FileText className="w-4 h-4 inline mr-1" />Notes</label>
              <textarea name="notes" placeholder="Confirmation numbers, special instructions, etc." value={formData.notes} onChange={handleChange} className="w-full px-4 py-4 bg-white/80 text-[#1F474A] placeholder-[#1F474A]/40 border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" rows={3}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2"><Clock className="w-4 h-4 inline mr-1" />Start Time</label>
                <input name="start_time" type="datetime-local" value={formData.start_time} onChange={handleChange} required className="w-full px-4 py-4 bg-white/80 text-[#1F474A] border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] tracking-wide mb-2"><Clock className="w-4 h-4 inline mr-1" />End Time</label>
                <input name="end_time" type="datetime-local" value={formData.end_time} onChange={handleChange} required className="w-full px-4 py-4 bg-white/80 text-[#1F474A] border-2 border-[#416B6B]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-medium backdrop-blur-sm" />
              </div>
            </div>

            {error && (<div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"><p className="text-red-700 text-sm font-medium">{error}</p></div>)}

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 text-[#416B6B] font-semibold px-4 py-3 rounded-xl hover:bg-[#416B6B]/10 transition-all duration-200 border-2 border-[#416B6B]/20 hover:border-[#416B6B]/40 focus:outline-none focus:ring-2 focus:ring-[#416B6B]/30 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:transform-none tracking-wide">
                {loading ? (<div className="flex justify-center items-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>{isEditing ? "Saving..." : "Creating..."}</div>) : (isEditing ? "Save Changes" : "Create Event")}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}