import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI } from "../adapters/apiAdapter";
import { useUser } from "../context/UserContext";
import ProfileButton from "./ProfileButton"; // ProfileButton

export default function Dashboard() {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state for the dashboard
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // State for the TripDetailsModal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const fetchTrips = async () => {
    try {
      const data = await TripAPI.getUserTrips();
      setTrips(data);
      setError("");
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips. Please try again.");
      setTrips([]); // Clear trips on error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      // Phase 1: Waiting for user context to load
      if (loadingUser) {
        setLoading(true); // Keep dashboard in loading state while user context loads
        return;
      }

      // Phase 2: User context has loaded
      if (!user) {
        // User is not authenticated after loading, so no trips to fetch.
        // Set loading to false and ensure trips are empty.
        setLoading(false);
        setTrips([]);
        setError("Please sign in to view your trips."); // Optional: set a specific error
        return;
      }

      // Phase 3: User is authenticated, proceed to fetch trips
      setLoading(true); // Set loading specifically for trip data fetch
      try {
        await fetchTrips();
      } finally {
        setLoading(false); // Always set loading to false after fetch attempt
      }
    };

    loadDashboardData();
  }, [user, loadingUser]); // Depend on user and loadingUser

  // Functions to open and close the details modal

  if (loading) {
    return (
      // Loading state: Centered, dark background text
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#72ADBF]"></div>
          <p className="ml-3 text-[#72ADBF] text-lg mt-4">
            Loading your trips…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      // Error state: Centered, dark background text, updated button style
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D]">
        <div className="text-center p-8 rounded-xl bg-[#012A3D] shadow-xl">
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-[#72ADBF] text-lg font-semibold uppercase
                       py-3 px-8 rounded-lg border border-[#72ADBF]
                       hover:text-white hover:bg-[#0395A7] hover:bg-opacity-20
                       transition-all duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-[#72ADBF]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={refreshing}
          >
            {refreshing ? (
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Refreshing</span>
              </div>
            ) : (
              "Try Again"
            )}
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcoming = trips.filter((t) => new Date(t.arrival) > now);
  const active = trips.filter(
    (t) => new Date(t.arrival) <= now && new Date(t.departure) >= now
  );
  const past = trips.filter((t) => new Date(t.departure) < now);

  const formatDateRange = (arrival, departure) => {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    const options = {
      month: "short",
      day: "numeric",
      year:
        arrivalDate.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    };

    return `${arrivalDate.toLocaleDateString(
      "en-US",
      options
    )} – ${departureDate.toLocaleDateString("en-US", options)}`;
  };

  const getDaysUntil = (date) => {
    const diffTime = new Date(date) - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return "";
  };

  const renderTripCard = (trip, showCountdown = false) => (
    // Trip Card: Darker Ocean Blue background, rounded-xl, subtle shadow, white/gray text
    <li
      key={trip._id}
      className="bg-[#012A3D] p-6 rounded-xl shadow-lg border border-[#01374A] hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#72ADBF] text-lg truncate mb-1">
            {" "}
            {/* Accent color for title */}
            {trip.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {" "}
            {/* Lighter gray for dates */}
            {formatDateRange(trip.arrival, trip.departure)}
          </p>
          {showCountdown && (
            <p className="text-sm text-[#0395A7] mt-2 font-medium">
              {" "}
              {/* Bright cyan for countdown */}
              {getDaysUntil(trip.arrival)}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {" "}
            {/* Grayer for members */}
            {trip.members?.length || 1} member
            {(trip.members?.length || 1) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="ml-4 flex flex-col space-y-2 items-end">
          {" "}
          {/* Increased space-y */}
          {/* Itinerary Button: Accent color text, subtle hover underline */}
          <button
            onClick={() => navigate(`/trips/${trip._id}/itinerary`)}
            className="text-sm text-[#72ADBF] hover:text-white font-medium hover:underline transition-colors"
          >
            Itinerary
          </button>
        </div>
      </div>
    </li>
  );

  const renderSection = (title, tripList, showCountdown = false) => {
    if (tripList.length === 0) return null;

    return (
      <section className="mb-10">
        {" "}
        {/* Increased mb */}
        <div className="flex justify-between items-center mb-5">
          {" "}
          {/* Increased mb */}
          <h2 className="text-xl font-medium text-[#72ADBF]">{title}</h2>{" "}
          {/* Accent color for section titles */}
          <span className="text-sm text-gray-300 bg-[#01374A] px-3 py-1 rounded-full">
            {" "}
            {/* Darker background for count */}
            {tripList.length}
          </span>
        </div>
        <ul className="space-y-4">
          {" "}
          {/* Increased space-y */}
          {tripList.map((trip) => renderTripCard(trip, showCountdown))}
        </ul>
      </section>
    );
  };

  const hasAnyTrips = trips.length > 0;

  return (
    // Main container: Dark background, generous padding
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          {" "}
          {/* Increased mb */}
          <h1 className="text-3xl font-bold text-[#72ADBF]">Your Trips</h1>{" "}
          {/* Larger, accent-colored heading */}
          <div className="flex space-x-4 items-center">
            {" "}
            {/* Increased space-x */}
            {/* Refresh Button: Subtle icon button */}
            <button
              onClick={handleRefresh}
              className="text-xl text-gray-400 hover:text-white transition flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0395A7] hover:bg-opacity-20"
              disabled={refreshing}
              title="Refresh trips"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span>↻</span>
              )}
            </button>
            {/* New Trip Button: Primary style */}
            <button
              onClick={() => navigate("/create-trip")}
              className="text-white text-lg font-semibold uppercase
                         py-3 px-6 rounded-lg border border-[#0395A7]
                         bg-[#0395A7] hover:bg-[#5E877D]
                         transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-[#72ADBF]
                         text-sm" // Kept text-sm for consistency with other buttons
            >
              + New Trip
            </button>
            {/* Profile Button: Assuming it's added here as well, if not, you can add it */}
            {/* <div className="ml-auto">
              <ProfileButton />
            </div> */}
          </div>
        </div>

        {hasAnyTrips ? (
          <>
            {renderSection("Active Trips", active)}
            {renderSection("Upcoming Trips", upcoming, true)}
            {renderSection("Past Trips", past)}
          </>
        ) : (
          // No trips state: Darker background, updated text and button
          <div className="text-center mt-20">
            {" "}
            {/* Increased mt */}
            <div className="bg-[#012A3D] rounded-xl p-10 shadow-xl">
              {" "}
              {/* Darker background, more padding */}
              <div className="mb-6">
                {" "}
                {/* Increased mb */}
                <svg
                  className="mx-auto h-16 w-16 text-[#72ADBF]" // Larger, accent color icon
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#72ADBF] mb-3">
                {" "}
                {/* Accent color for heading */}
                No trips yet
              </h3>
              <p className="text-gray-300 mb-8">
                {" "}
                {/* Lighter gray for paragraph */}
                Start planning your next adventure by creating your first trip.
              </p>
              <button
                onClick={() => navigate("/create-trip")}
                className="text-white text-lg font-semibold uppercase
                           py-3 px-8 rounded-lg border border-[#0395A7]
                           bg-[#0395A7] hover:bg-[#5E877D]
                           transition-all duration-300 ease-in-out
                           shadow-md hover:shadow-lg transform hover:scale-105
                           focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
              >
                Plan Your First Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
