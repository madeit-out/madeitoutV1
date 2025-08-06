import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { AuthAPI } from '../adapters/apiAdapter';

export default function EditProfileModal({ isOpen, onClose, onProfileUpdated, currentUser }) {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profile_picture_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        profile_picture_url: currentUser.profile_picture_url || '',
      });
      setError('');
    }
  }, [currentUser, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await AuthAPI.updateProfile(formData);
      onProfileUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-8 text-left align-middle shadow-xl transition-all border border-white/20">
          <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-[#1F474A] mb-6">Edit Profile</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Username</label>
              <input name="username" value={formData.username} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F474A] mb-2">Profile Picture URL</label>
              <input name="profile_picture_url" value={formData.profile_picture_url} onChange={handleChange} className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-[#E08544] focus:ring-2 focus:ring-[#E08544]/30" />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="pt-4 flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="bg-gray-200 text-[#416B6B] font-semibold px-6 py-3 rounded-xl hover:bg-gray-300 transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-70">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}