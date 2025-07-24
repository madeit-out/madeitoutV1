// src/adapters/apiAdapter.js

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
};

// -------------------------
// Trip API
// -------------------------
export const TripAPI = {
  // Create a new trip
  createTrip: async (tripData) => {
    // Ensure dates are in ISO format
    const formattedData = {
      ...tripData,
      arrival: new Date(tripData.arrival).toISOString(),
      departure: new Date(tripData.departure).toISOString(),
    };

    const res = await api.post("/trips/", formattedData);
    return res.data;
  },
  inviteUser: async (tripId, identifier) => {
    const res = await api.post(`/trips/${tripId}/invite`, { identifier });
    return res.data; // ✅ axios auto-parses JSON
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

  // Update trip details (owner only)
  updateTrip: async (tripId, tripData) => {
    // Ensure dates are in ISO format if provided
    const formattedData = { ...tripData };
    if (formattedData.arrival) {
      formattedData.arrival = new Date(formattedData.arrival).toISOString();
    }
    if (formattedData.departure) {
      formattedData.departure = new Date(formattedData.departure).toISOString();
    }

    const res = await api.put(`/trips/${tripId}`, formattedData);
    return res.data;
  },
  getPendingInvites: async () => {
    const res = await api.get("/trips/pending-invites");
    console.log(res.data);
    return res.data;
  },

  // Add user to trip (by user_id or username)
  addUserToTrip: async (tripId, userData) => {
    // userData can be { user_id: "..." } or { username: "..." }
    const res = await api.post(`/trips/${tripId}/add-user`, userData);
    return res.data;
  },

  // Remove user from trip (owner only)
  removeUserFromTrip: async (tripId, userId) => {
    const res = await api.post(`/trips/${tripId}/remove-user`, {
      user_id: userId,
    });
    return res.data;
  },

  // Search users by username (for adding to trips)
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
  // Get user profile
  getProfile: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const res = await api.put("/users/profile", userData);
    return res.data;
  },

  // Search users
  searchUsers: async (query) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};

// -------------------------
// Utility functions
// -------------------------
export const ApiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Format error message for display
  formatError: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  },

  // Handle API errors consistently
  handleError: (error, fallbackMessage = "An error occurred") => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      // Already handled by interceptor
      return "Session expired. Please log in again.";
    }

    if (error.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "The requested resource was not found.";
    }

    if (error.response?.status >= 500) {
      return "Server error. Please try again later.";
    }

    return ApiUtils.formatError(error) || fallbackMessage;
  },
};

// Export default api instance for custom requests
export default api;

// -------------------------
// Event API
// -------------------------
export const EventAPI = {
  // Create a new event for a specific trip
  createEvent: async (tripId, eventData) => {
    const res = await api.post(`/events/${tripId}`, eventData);
    return res.data;
  },

  // Get all events for a specific trip
  getTripEvents: async (tripId) => {
    const res = await api.get(`/events/${tripId}`);
    return res.data;
  },

  // Update a specific event
  updateEvent: async (eventId, eventData) => {
    const res = await api.put(`/events/event/${eventId}`, eventData);
    return res.data;
  },

  // Delete a specific event
  deleteEvent: async (eventId) => {
    const res = await api.delete(`/events/event/${eventId}`);
    return res.data;
  },
};
