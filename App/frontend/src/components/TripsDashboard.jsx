import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI } from "../adapters/apiAdapter";
import { useUser } from "../context/UserContext";

export default function Dashboard({ refreshTrigger }) {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async () => {
    try {
      setError(""); // Clear previous errors before fetching
      const data = await TripAPI.getUserTrips();
      setTrips(data);
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
    // If the user context is still loading, we don't need to do anything yet.
    // The main loading check below will handle showing the spinner.
    if (loadingUser) {
      return;
    }

    // If the context has finished loading AND we have a valid user, fetch their trips.
    if (user) {
      setLoading(true);
      fetchTrips().finally(() => {
        setLoading(false);
      });
    } else {
      // If the context has finished loading and there is NO user,
      // it means they are logged out. We can stop the loading spinner.
      setLoading(false);
      setTrips([]); // Ensure no old trip data is shown
    }
  }, [user, loadingUser, refreshTrigger]);

  // Show a loading spinner if the user context is loading OR if trips are being fetched.
  if (loadingUser || loading) {
    return (
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

  // Show an error message only if a network error occurred during fetching.
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D]">
        <div className="text-center p-8 rounded-xl bg-[#012A3D] shadow-xl">
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-[#72ADBF] text-lg font-semibold uppercase py-3 px-8 rounded-lg border border-[#72ADBF] hover:text-white hover:bg-[#0395A7] hover:bg-opacity-20 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#72ADBF] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Try Again"}
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
    const options = { month: "short", day: "numeric" };
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
    <li
      key={trip._id}
      className="bg-[#012A3D] rounded-xl shadow-lg border border-[#01374A] hover:shadow-xl transition-shadow overflow-hidden"
    >
      {trip.cover_image_url ? (
        <img
          src={trip.cover_image_url}
          alt={`${trip.title} cover`}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-[#0395A7] to-[#72ADBF] opacity-20"></div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#72ADBF] text-lg truncate mb-1">
              {trip.title}
            </h3>
            {trip.destination && (
              <p className="text-sm text-gray-300 truncate">
                {trip.destination}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              {formatDateRange(trip.arrival, trip.departure)}
            </p>
          </div>
          <div className="ml-4 flex flex-col space-y-3 items-end">
            <span
              title={trip.is_public ? "Public Trip" : "Private Trip"}
              className="text-lg"
            >
              {trip.is_public ? "🌐" : "🔒"}
            </span>
            <button
              onClick={() => navigate(`/trips/${trip._id}/itinerary`)}
              className="text-sm text-[#72ADBF] hover:text-white font-medium hover:underline transition-colors"
            >
              Itinerary
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
          <span>
            {trip.members_info?.length || 1} member
            {(trip.members_info?.length || 1) !== 1 ? "s" : ""}
          </span>
          {trip.budget && <span>Budget: ${trip.budget.toLocaleString()}</span>}
          {showCountdown && (
            <p className="text-sm text-[#0395A7] font-medium">
              {getDaysUntil(trip.arrival)}
            </p>
          )}
        </div>
      </div>
    </li>
  );

  const renderSection = (title, tripList, showCountdown = false) => {
    if (tripList.length === 0) return null;
    return (
      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-medium text-[#72ADBF]">{title}</h2>
          <span className="text-sm text-gray-300 bg-[#01374A] px-3 py-1 rounded-full">
            {tripList.length}
          </span>
        </div>
        <ul className="space-y-4">
          {tripList.map((trip) => renderTripCard(trip, showCountdown))}
        </ul>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#72ADBF]">Your Trips</h1>
          <div className="flex space-x-4 items-center">
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
            <button
              onClick={() => navigate("/create-trip")}
              className="text-white text-sm font-semibold uppercase py-3 px-6 rounded-lg bg-[#0395A7] hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            >
              + New Trip
            </button>
          </div>
        </div>

        {trips.length > 0 ? (
          <>
            {renderSection("Active Trips", active)}
            {renderSection("Upcoming Trips", upcoming, true)}
            {renderSection("Past Trips", past)}
          </>
        ) : (
          <div className="text-center mt-20">
            <div className="bg-[#012A3D] rounded-xl p-10 shadow-xl">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-[#72ADBF]"
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
                No trips yet
              </h3>
              <p className="text-gray-300 mb-8">
                Start planning your next adventure by creating your first trip.
              </p>
              <button
                onClick={() => navigate("/create-trip")}
                className="text-white text-lg font-semibold uppercase py-3 px-8 rounded-lg bg-[#0395A7] hover:bg-[#5E877D] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
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
