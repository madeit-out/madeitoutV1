// src/adapters/apiAdapter.js


//const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import axios from "axios";

// Create the base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token before every request using an interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------
// Auth API
// -------------------------
export const AuthAPI = {
  signUp: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  signIn: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    // Save token on successful login
    localStorage.setItem("token", res.data.access_token);
    return res.data;
  },

  getUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};

// -------------------------
// Trip API
// -------------------------
export const TripAPI = {
  createTrip: async (tripData) => {
    const res = await api.post("/trips/", tripData);
    return res.data;
  },

  getTrip: async (tripId) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  getUserTrips: async () => {
    const res = await api.get("/trips/my-trips");
    return res.data;
  },

  addUserToTrip: async (tripId, userId) => {
    const res = await api.post(`/trips/${tripId}/add-user`, { user_id: userId });
    return res.data;
  },
};
