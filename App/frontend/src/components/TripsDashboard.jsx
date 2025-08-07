import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripAPI } from "../adapters/apiAdapter";
import { useUser } from "../context/UserContext";
import EditTripModal from "./EditTripModal";

export default function Dashboard({ refreshTrigger }) {
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
      setError(""); // Clear previous errors
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
    if (loadingUser) {
      return;
    }

    if (user) {
      setLoading(true);
      fetchTrips().finally(() => {
        setLoading(false);
        setIsLoaded(true); // Trigger animations once loaded
      });
    } else {
      setLoading(false);
      setTrips([]);
    }
  }, [user, loadingUser, refreshTrigger]);

  // Set loaded state when the user appears to trigger entry animations
  useEffect(() => {
    if (user) {
      setIsLoaded(true);
    }
  }, [user]);

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
          {/* Error content here */}
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
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      role="article"
      aria-labelledby={`trip-title-${trip._id}`}
    >
      {/* ... card content including new edit button ... */}
       <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
             <h3 
              id={`trip-title-${trip._id}`}
              className="font-black text-[#1F474A] text-xl truncate mb-2 group-hover:text-[#416B6B] transition-colors duration-300"
            >
              {trip.title}
            </h3>
            {/* ... other trip details ... */}
          </div>
          <div className="ml-4 flex flex-col items-end space-y-3">
            {/* ... privacy status ... */}
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
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        {/* ... card footer ... */}
       </div>
    </li>
  );

  // Renders a section title and a list of trip cards
  const renderSection = (title, tripList, showCountdown = false, sectionIndex = 0) => {
    if (tripList.length === 0) return null;
    return (
      <section 
        className={`mb-12 transition-all duration-1000 delay-${sectionIndex * 200} ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        aria-labelledby={`section-title-${sectionIndex}`}
      >
        {/* ... section header ... */}
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-1" role="list">
          {tripList.map((trip, index) => renderTripCard(trip, showCountdown, index))}
        </ul>
      </section>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 py-12 px-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-10 mb-12 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex justify-between items-center">
                {/* ... header content ... */}
            </div>
          </div>

          {trips.length > 0 ? (
            <div className="space-y-8">
              {renderSection("Active Trips", active, false, 0)}
              {renderSection("Upcoming Adventures", upcoming, true, 1)}
              {renderSection("Trip Memories", past, false, 2)}
            </div>
          ) : (
             <div className={`text-center transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-20 max-w-2xl mx-auto">
                {/* ... "Ready for your first adventure?" content ... */}
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