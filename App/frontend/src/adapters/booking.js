// booking.js


// Helper function to get the authentication token from local storage
const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  
  // Use the environment variable for the API base URL, with a fallback for local development
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
  
  /**
   * An object that contains all functions for interacting with the booking-related backend endpoints.
   */
  export const BookingAPI = {
    /**
     * Searches for flights by sending a request to the backend.
     * @param {object} searchParams - The search parameters.
     * @param {string} searchParams.origin - The IATA code for the origin airport (e.g., "JFK").
     * @param {string} searchParams.destination - The IATA code for the destination airport (e.g., "LHR").
     * @param {string} searchParams.departureDate - The departure date in 'YYYY-MM-DD' format.
     * @param {number} searchParams.adults - The number of adult passengers.
     * @returns {Promise<Array>} A promise that resolves to an array of flight offers.
     */
    searchFlights: async (searchParams) => {
      const token = getAuthToken();
      if (!token) {
        // If there's no token, we can't make an authenticated request.
        throw new Error("Authentication token not found. Please log in.");
      }
  
      // This safely converts the {origin: 'JFK', ...} object into a URL query string "origin=JFK&..."
      const query = new URLSearchParams(searchParams).toString();
      const url = `${BASE_URL}/booking/search-flights?${query}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          // Your backend's @jwt_required() decorator needs this Authorization header.
          "Authorization": `Bearer ${token}`,
        },
      });
  
      // If the server responds with an error (e.g., 400, 500), throw an error.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "A server error occurred while searching for flights.");
      }
  
      // If the request was successful, return the JSON data (the list of flights).
      return response.json();
    },
  };