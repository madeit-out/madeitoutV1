// src/adapters/apiAdapter.js

import axios from "axios";

// Create the base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
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

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/signin"; // Redirect to login
    }

    // Enhance error messages
    const message =
      error.response?.data?.error || error.message || "An error occurred";
    error.message = message;

    return Promise.reject(error);
  }
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
    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
    }
    return res.data;
  },

  getUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  updateProfile: async (userData) => {
    const res = await api.put("/auth/me", userData);
    return res.data;
  },
};

// -------------------------
// Trip API
// -------------------------
export const TripAPI = {
  // Create a new trip with enhanced fields
  createTrip: async (tripData) => {
    // Ensure dates are in ISO format
    const formattedData = {
      ...tripData,
      arrival: tripData.arrival
        ? new Date(tripData.arrival).toISOString()
        : undefined,
      departure: tripData.departure
        ? new Date(tripData.departure).toISOString()
        : undefined,
    };

    const res = await api.post("/trips/", formattedData);
    return res.data;
  },

  // Invite user by email
  inviteUser: async (tripId, email) => {
    // Changed identifier to email
    const res = await api.post(`/trips/${tripId}/invite`, {
      identifier: email,
    }); // Backend expects 'identifier'
    return res.data;
  },

  // Get a specific trip by ID
  getTrip: async (tripId) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  // Get all trips for the current user (enhanced with member info)
  getUserTrips: async () => {
    const res = await api.get("/trips/my-trips");
    return res.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const res = await api.get("/trips/dashboard-stats");
    return res.data;
  },

  // Update trip details (owner only) with enhanced fields
  updateTrip: async (tripId, tripData) => {
    const formattedData = { ...tripData };
    if (formattedData.arrival) {
      formattedData.arrival = new Date(formattedData.arrival).toISOString();
    }
    if (formattedData.departure) {
      formattedData.departure = new Date(formattedData.departure).toISOString();
    }
    // destination, description, is_public, cover_image_url, budget are passed as is
    // memberEmails is not updated via this route, handled by invite/remove

    const res = await api.put(`/trips/${tripId}`, formattedData);
    return res.data;
  },

  getPendingInvites: async () => {
    const res = await api.get("/trips/pending-invites");
    return res.data;
  },

  // Add user to trip by email (backend now expects email)
  addUserToTrip: async (tripId, email) => {
    // Changed userData to email
    const res = await api.post(`/trips/${tripId}/add-user`, { email }); // Send email
    return res.data;
  },

  // Remove user from trip (owner only)
  removeUserFromTrip: async (tripId, userId) => {
    // userId is still the ObjectId string
    const res = await api.post(`/trips/${tripId}/remove-user`, {
      user_id: userId,
    });
    return res.data;
  },

  // Search users by username (for adding to trips) - kept as is for general search
  searchUsers: async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  acceptInvite: async (tripId) => {
    const res = await api.post(`/trips/${tripId}/accept-invite`);
    return res.data;
  },
};

// -------------------------
// User API (if you need these)
// -------------------------
export const UserAPI = {
  // Get user profile - backend /auth/me returns full user object
  getProfile: async (userId) => {
    // This might be redundant if /auth/me is used for current user
    const res = await api.get(`/users/${userId}`); // Assuming a /users/<id> route exists
    return res.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const res = await api.put("/users/profile", userData); // Assuming a /users/profile route exists
    return res.data;
  },

  // Search users
  searchUsers: async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};

// -------------------------
// Event API
// -------------------------
export const EventAPI = {
  // Create a new event for a specific trip with enhanced fields
  createEvent: async (tripId, eventData) => {
    // NOTE: Added tripId here
    const formattedData = {
      ...eventData,
      start_time: eventData.start_time
        ? new Date(eventData.start_time).toISOString()
        : undefined,
      end_time: eventData.end_time
        ? new Date(eventData.end_time).toISOString()
        : undefined,
      // type, notes, participants, cost, status are passed as is
    };
    // FIX: The backend route expects a tripId in the URL, so we pass it here.
    const res = await api.post(`/events/${tripId}`, formattedData);
    return res.data;
  },

  // Get all events for a specific trip
  getTripEvents: async (tripId) => {
    const res = await api.get(`/events/${tripId}`);
    return res.data;
  },

  // Update a specific event with enhanced fields
  updateEvent: async (eventId, eventData) => {
    const formattedData = { ...eventData };
    if (formattedData.start_time) {
      formattedData.start_time = new Date(
        formattedData.start_time
      ).toISOString();
    }
    if (formattedData.end_time) {
      formattedData.end_time = new Date(formattedData.end_time).toISOString();
    }
    // type, notes, participants, cost, status are passed as is

    const res = await api.put(`/events/event/${eventId}`, formattedData);
    return res.data;
  },

  // Delete a specific event
  deleteEvent: async (eventId) => {
    const res = await api.delete(`/events/event/${eventId}`);
    return res.data;
  },
};
