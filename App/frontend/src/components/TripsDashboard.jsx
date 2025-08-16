import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI } from "../adapters/apiAdapter";
import { useUser } from "../context/UserContext";
import EditTripModal from "./EditTripModal";

// The 'refreshTrigger' prop has been removed from the function signature.
export default function Dashboard() {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // States for the edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

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

  // Handlers for the edit modal
  const handleEditClick = (trip) => {
    setSelectedTrip(trip);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedTrip(null);
  };

  const handleTripUpdated = async () => {
    setEditModalOpen(false);
    setSelectedTrip(null);
    await fetchTrips(); // Refresh the trips list after an update
  };

  useEffect(() => {
    // If the user context is still loading, we don't need to do anything yet.
    if (loadingUser) {
      return;
    }

    // If the context has finished loading AND we have a valid user, fetch their trips.
    if (user) {
      setLoading(true);
      fetchTrips().finally(() => {
        setLoading(false);
        setIsLoaded(true); // Trigger animations once loaded
      });
    } else {
      // If the context has finished loading and there is NO user,
      // it means they are logged out. We can stop the loading spinner.
      setLoading(false);
      setTrips([]); // Ensure no old trip data is shown
    }
    // The 'refreshTrigger' prop has been removed from the dependency array.
  }, [user, loadingUser]);

  // Set loaded state when the user appears to trigger entry animations
  useEffect(() => {
    if (user) {
      setIsLoaded(true);
    }
  }, [user]);

  // --- The rest of the file remains the same ---
  // Loading spinner for initial user check or data fetching
  if (loadingUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/30">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#416B6B]/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#E08544] absolute top-0"></div>
          </div>
          <p className="text-[#1F474A] text-xl font-semibold mt-6 tracking-wide">
            Loading your adventures…
          </p>
        </div>
      </div>
    );
  }

  // Error display component
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 p-6">
        <div className="text-center p-10 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/30 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1F474A] mb-4">
            Something went wrong
          </h3>
          <p className="text-[#1F474A]/70 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-semibold px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {refreshing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              "Try Again"
            )}
          </button>
        </div>
      </div>
    );
  }

  // Filter trips into categories
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

  // Renders a single trip card with animation properties
  const renderTripCard = (trip, showCountdown = false, index = 0) => (
    <li
      key={trip._id}
      className={`group bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 transform ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      role="article"
      aria-labelledby={`trip-title-${trip._id}`}
    >
      {trip.cover_image_url ? (
        <div className="relative overflow-hidden">
          <img
            src={trip.cover_image_url}
            alt={`${trip.title} cover`}
            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#416B6B] to-[#E08544] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#416B6B]/80 to-[#E08544]/80"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3
              id={`trip-title-${trip._id}`}
              className="font-black text-[#1F474A] text-xl truncate mb-2 group-hover:text-[#416B6B] transition-colors duration-300"
            >
              {trip.title}
            </h3>
            {trip.destination && (
              <div className="flex items-center text-[#1F474A]/70 mb-2">
                <svg
                  className="w-4 h-4 mr-2 text-[#E08544]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-medium truncate">
                  {trip.destination}
                </span>
              </div>
            )}
            <div className="flex items-center text-[#1F474A]/60">
              <svg
                className="w-4 h-4 mr-2 text-[#416B6B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                {formatDateRange(trip.arrival, trip.departure)}
              </span>
            </div>
          </div>

          {/* Updated button section with edit button */}
          <div className="ml-4 flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-2">
              <span
                title={trip.is_public ? "Public Trip" : "Private Trip"}
                className="text-lg"
              >
                {trip.is_public ? "🌐" : "🔒"}
              </span>
            </div>
            <div className="flex space-x-2">
              {/* Show edit button only if user is the trip creator */}
              {user && trip.created_by === user._id && (
                <button
                  onClick={() => handleEditClick(trip)}
                  className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B]/10 to-[#E08544]/10 text-[#416B6B] text-sm font-semibold px-3 py-2 rounded-lg border border-[#416B6B]/20 hover:bg-gradient-to-r hover:from-[#416B6B] hover:to-[#E08544] hover:text-white hover:border-transparent hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E08544]/30 flex items-center"
                  title="Edit trip details"
                  aria-label={`Edit ${trip.title} trip details`}
                >
                  <span className="relative z-10 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                </button>
              )}
              <button
                onClick={() => navigate(`/trips/${trip._id}/itinerary`)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E08544]/30"
                aria-label={`View details for ${trip.title} trip`}
              >
                <span className="relative z-10">View Details</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#1F474A]/10">
          <div className="flex items-center space-x-4 text-xs text-[#1F474A]/60">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-[#416B6B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span className="font-medium">
                {trip.members_info?.length || 1} member
                {(trip.members_info?.length || 1) !== 1 ? "s" : ""}
              </span>
            </div>
            {trip.budget && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-[#E08544]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span className="font-medium">
                  ${trip.budget.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          {showCountdown && (
            <div className="bg-[#E08544]/10 text-[#E08544] text-sm font-bold px-3 py-1 rounded-full">
              {getDaysUntil(trip.arrival)}
            </div>
          )}
        </div>
      </div>
    </li>
  );

  // Renders a section title and a list of trip cards
  const renderSection = (
    title,
    tripList,
    showCountdown = false,
    sectionIndex = 0
  ) => {
    if (tripList.length === 0) return null;
    return (
      <section
        className={`mb-12 transition-all duration-1000 delay-${
          sectionIndex * 200
        } ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        aria-labelledby={`section-title-${sectionIndex}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1F474A]">{title}</h2>
          <span className="text-sm font-semibold text-[#1F474A]/70 bg-[#416B6B]/10 px-4 py-2 rounded-full border border-[#416B6B]/20">
            {tripList.length} trip{tripList.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-1" role="list">
          {tripList.map((trip, index) =>
            renderTripCard(trip, showCountdown, index)
          )}
        </ul>
      </section>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div
            className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 mb-12 transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-[#1F474A] mb-2 tracking-tight">
                  Your Travel Dashboard
                </h1>
                <p className="text-[#1F474A]/70 text-lg font-medium">
                  Manage your adventures and create new memories
                </p>
              </div>
              <div className="flex space-x-4 items-center">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#416B6B]/10 text-[#416B6B] hover:bg-[#416B6B] hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#416B6B]/30 disabled:opacity-50"
                  title="Refresh trips"
                >
                  {refreshing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => navigate("/create-trip")}
                  className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold px-8 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Create New Trip</span>
                </button>
              </div>
            </div>
          </div>

          {trips.length > 0 ? (
            <div className="space-y-8">
              {renderSection("Active Trips", active, false, 0)}
              {renderSection("Upcoming Adventures", upcoming, true, 1)}
              {renderSection("Trip Memories", past, false, 2)}
            </div>
          ) : (
            <div
              className={`text-center transition-all duration-1000 delay-500 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-20 max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-[#1F474A] mb-4">
                  Ready for Your First Adventure?
                </h3>
                <p className="text-[#1F474A]/70 text-lg mb-10 leading-relaxed max-w-md mx-auto">
                  Transform your travel dreams into reality. Start planning your
                  perfect group adventure today.
                </p>
                <button
                  onClick={() => navigate("/create-trip")}
                  className="bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white text-xl font-bold px-12 py-5 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 flex items-center space-x-3 mx-auto"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Plan Your First Trip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The EditTripModal is now included */}
      <EditTripModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onTripUpdated={handleTripUpdated}
        trip={selectedTrip}
      />
    </>
  );
}
