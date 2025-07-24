import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI } from "../adapters/apiAdapter";
import { useUser } from "../context/UserContext";

export default function Dashboard() {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async () => {
    try {
      const data = await TripAPI.getUserTrips();
      setTrips(data);
      setError("");
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    if (loadingUser || !user) return;

    (async () => {
      try {
        setLoading(true);
        await fetchTrips();
      } finally {
        setLoading(false);
      }
    })();
  }, [user, loadingUser]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600">Loading your trips…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            disabled={refreshing}
          >
            {refreshing ? "Retrying..." : "Try Again"}
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
    <li
      key={trip._id}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDateRange(trip.arrival, trip.departure)}
          </p>
          {showCountdown && (
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              {getDaysUntil(trip.arrival)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {trip.members?.length || 1} member
            {(trip.members?.length || 1) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="ml-4 flex flex-col space-y-1 items-end">
          <button
            onClick={() => navigate(`/trips/${trip._id}`)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            View Details
          </button>
          <button
            onClick={() => navigate(`/trips/${trip._id}/itinerary`)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
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
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {tripList.length}
          </span>
        </div>
        <ul className="space-y-3">
          {tripList.map((trip) => renderTripCard(trip, showCountdown))}
        </ul>
      </section>
    );
  };

  const hasAnyTrips = trips.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="text-sm text-gray-600 hover:text-gray-800 transition"
            disabled={refreshing}
            title="Refresh trips"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              "↻ Refresh"
            )}
          </button>
          <button
            onClick={() => navigate("/create-trip")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm font-medium"
          >
            + New Trip
          </button>
        </div>
      </div>

      {hasAnyTrips ? (
        <>
          {renderSection("Active Trips", active)}
          {renderSection("Upcoming Trips", upcoming, true)}
          {renderSection("Past Trips", past)}
        </>
      ) : (
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start planning your next adventure by creating your first trip.
            </p>
            <button
              onClick={() => navigate("/create-trip")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition font-medium"
            >
              Plan Your First Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
