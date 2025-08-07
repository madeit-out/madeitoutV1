import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { EventAPI } from "../adapters/apiAdapter";
import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Clock, DollarSign, FileText, Plus, Save } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <Dialog.Panel className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-white/30">
          <div className="flex items-center justify-center mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#416B6B] to-[#E08544] rounded-full mr-4"></div>
            <Calendar className="w-8 h-8 text-[#416B6B] mr-4" />
            <Dialog.Title className="text-3xl font-black text-black tracking-tight">
              {isEditing ? "Edit Event" : "Create New Event"}
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">Event Title</label>
              <input 
                name="title" 
                type="text" 
                placeholder="Flight to Tokyo, Museum Visit, etc." 
                value={formData.title} 
                onChange={handleChange} 
                required 
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50" 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">
                <MapPin className="w-5 h-5 inline mr-2 text-[#E08544]" />
                Location
              </label>
              <input 
                name="location" 
                type="text" 
                placeholder="Airport, Hotel, Restaurant, etc." 
                value={formData.location} 
                onChange={handleChange} 
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50" 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-black tracking-wide mb-3">Event Type</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full px-6 py-5 bg-white/90 text-black border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50"
                >
                  <option value="activity">Activity</option>
                  <option value="flight">Flight</option>
                  <option value="lodging">Lodging</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food</option>
                </select>
              </div>
              <div className="group">
                <label className="block text-sm font-bold text-black tracking-wide mb-3">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full px-6 py-5 bg-white/90 text-black border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50"
                >
                  <option value="planned">Planned</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {formData.type === "flight" && (
              <div className="bg-gradient-to-r from-[#416B6B]/10 to-[#E08544]/10 rounded-2xl p-6 border border-[#416B6B]/20">
                <button 
                  type="button" 
                  onClick={() => navigate("/search-flights")} 
                  className="group relative overflow-hidden w-full text-[#416B6B] font-bold py-4 px-6 rounded-2xl border-2 border-[#416B6B]/20 hover:bg-[#416B6B] hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Find & Book a Flight
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </button>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">
                <DollarSign className="w-5 h-5 inline mr-2 text-[#416B6B]" />
                Cost (Optional)
              </label>
              <input 
                name="cost" 
                type="number" 
                placeholder="50.00" 
                value={formData.cost} 
                onChange={handleChange} 
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50" 
                step="0.01" 
                min="0" 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">
                <FileText className="w-5 h-5 inline mr-2 text-[#E08544]" />
                Notes
              </label>
              <textarea 
                name="notes" 
                placeholder="Confirmation numbers, special instructions, etc." 
                value={formData.notes} 
                onChange={handleChange} 
                className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50 resize-none" 
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-black tracking-wide mb-3">
                  <Clock className="w-5 h-5 inline mr-2 text-[#416B6B]" />
                  Start Time
                </label>
                <input 
                  name="start_time" 
                  type="datetime-local" 
                  value={formData.start_time} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-6 py-5 bg-white/90 text-black border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50" 
                />
              </div>
              <div className="group">
                <label className="block text-sm font-bold text-black tracking-wide mb-3">
                  <Clock className="w-5 h-5 inline mr-2 text-[#E08544]" />
                  End Time
                </label>
                <input 
                  name="end_time" 
                  type="datetime-local" 
                  value={formData.end_time} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-6 py-5 bg-white/90 text-black border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50" 
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl">
                <p className="text-red-700 text-base font-semibold">{error}</p>
              </div>
            )}

            <div className="flex gap-4 mt-10">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading} 
                className="group relative overflow-hidden flex-1 text-[#416B6B] font-bold px-6 py-5 rounded-2xl hover:bg-[#416B6B]/10 transition-all duration-300 border-2 border-[#416B6B]/20 hover:border-[#416B6B]/40 focus:outline-none focus:ring-2 focus:ring-[#416B6B]/30 disabled:opacity-50"
              >
                <span className="relative z-10">Cancel</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#416B6B]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="group relative overflow-hidden flex-1 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-50 disabled:transform-none tracking-wide"
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white mr-3"></div>
                    {isEditing ? "Saving..." : "Creating..."}
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    {isEditing ? (
                      <>
                        <Save className="w-6 h-6 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mr-2" />
                        Create Event
                      </>
                    )}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}