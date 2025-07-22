// src/adapters/apiAdapter.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const TripAPI = {
  createTrip: async (tripData) => {
    const res = await api.post('api/trips/', tripData);
    return res.data;
  },

  getTrip: async (tripId) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  // Get all trips for a user
  getUserTrips: async () => {
    const res = await api.get('/trips/my-trips'); // ✅ This is correct based on your Flask route
    return res.data;
  },
  

  // Add a user to an existing trip
  addUserToTrip: async (tripId, userId) => {
    const res = await api.post(`/trips/${tripId}/add-user`, {
      user_id: userId,
    });
    return res.data;
  },

};

export const AuthAPI = {
  signUp: async (userData) => {
    const res = await api.post('api/auth/register', userData);
    return res.data;
  },

  signIn: async (credentials) => {
    const res = await api.post('api/auth/login', credentials);
    return res.data;
  },

  getUser: async () => {
    const res = await api.get('/auth/user');
    return res.data;
  },
};
