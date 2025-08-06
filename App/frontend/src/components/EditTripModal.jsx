import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { TripAPI } from '../adapters/apiAdapter';
import { format, parseISO } from 'date-fns';

export default function EditTripModal({ isOpen, onClose, onTripUpdated, trip }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      const arrivalDate = trip.arrival ? format(parseISO(trip.arrival), "yyyy-MM-dd'T'HH:mm") : '';
      const departureDate = trip.departure ? format(parseISO(trip.departure), "yyyy-MM-dd'T'HH:mm") : '';
        
      setFormData({
        title: trip.title || '',
        destination: trip.destination || '',
        arrival: arrivalDate,
        departure: departureDate,
        budget: trip.budget || '',
        description: trip.description || '',
        cover_image_url: trip.cover_image_url || '',
        is_public: trip.is_public || false,
      });
      setError('');
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    if (new Date(formData.departure) < new Date(formData.arrival)) {
      setError("Departure date cannot be before the arrival date.");
      setSaving(false);
      return;
    }
    
    try {
      // Ensure budget is sent as a number
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };
      await TripAPI.updateTrip(trip._id, payload);
      onTripUpdated();
    } catch (err) {
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-8 text-left align-middle shadow-xl transition-all border border-white/20">
          <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-[#1F474A] mb-6">
            Edit Your Trip
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Trip Title</label>
              <input name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-[#1F474A] mb-2">Destination</label>
                    <input name="destination" value={formData.destination || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
                </div>
                
                {/* --- NEW: Budget Input Field --- */}
                <div>
                    <label className="block text-sm font-semibold text-[#1F474A] mb-2">Budget ($)</label>
                    <input name="budget" type="number" placeholder="1500" value={formData.budget || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] mb-2">Arrival</label>
                <input name="arrival" type="datetime-local" value={formData.arrival || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1F474A] mb-2">Departure</label>
                <input name="departure" type="datetime-local" value={formData.departure || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Cover Image URL</label>
              <input name="cover_image_url" placeholder="https://example.com/image.jpg" value={formData.cover_image_url || ''} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
            </div>

            <div className="flex items-center space-x-3">
              <input id="is_public" name="is_public" type="checkbox" checked={formData.is_public || false} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-[#416B6B] focus:ring-[#E08544]" />
              <label htmlFor="is_public" className="font-semibold text-[#1F474A]">Make Trip Public</label>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            <div className="pt-4 flex justify-between items-center">
              <button type="button" onClick={() => { /* handleDelete logic here */ }} className="text-red-600 font-semibold px-6 py-3 rounded-xl hover:bg-red-100 transition-all duration-300 disabled:opacity-50">Delete Trip</button>
              <div className="flex space-x-4">
                <button type="button" onClick={onClose} className="bg-gray-200 text-[#416B6B] font-semibold px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300">Cancel</button>
                <button type="submit" disabled={saving} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-70">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}