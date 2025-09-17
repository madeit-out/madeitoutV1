import React, { useState, useEffect, useRef } from "react";
import { BookingAPI } from "../adapters/booking.js";
import { format, parseISO } from "date-fns";
import { searchAirports } from "../utils/flightSearchUtils.js";
import Header from "../components/Header.jsx"; // For consistent navigation
import { Plane, Search, Users, Ticket, PlaneTakeoff, PlaneLanding } from "lucide-react";
// A reusable Autocomplete component, now styled to match the app's design
const AutocompleteInput = ({ label, value, onSelect, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 1) {
      setResults(searchAirports(newQuery));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (airport) => {
    onSelect(airport.code);
    setQuery(`${airport.name} (${airport.code})`);
    setIsOpen(false);
  };

  return (
    <div className="relative group" ref={wrapperRef}>
      <label className="block text-sm font-bold text-black tracking-wide mb-3">{label}</label>
      <input
        type="text"
        value={query || value}
        onChange={handleInputChange}
        onFocus={() => query.length > 1 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm group-hover:border-[#E08544]/50"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white/95 backdrop-blur-md border-2 border-[#416B6B]/20 rounded-2xl mt-2 max-h-60 overflow-y-auto shadow-2xl">
          {results.map((airport) => (
            <li
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="px-5 py-3 text-black font-semibold hover:bg-gradient-to-r hover:from-[#416B6B]/10 hover:to-[#E08544]/10 cursor-pointer transition-colors duration-200"
            >
              {airport.name} ({airport.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FlightSearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    departureDate: format(new Date(), "yyyy-MM-dd"), // Default to today
    adults: 1,
  });
  const [flights, setFlights] = useState(null); // Use null to distinguish from an empty result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFlights(null);
    try {
      const results = await BookingAPI.searchFlights(searchParams);
      setFlights(results);
    } catch (err) {
      setError(err.message || "Failed to find flights. Please try again.");
      setFlights([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const FlightCard = ({ flight }) => (
    <li className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-[#416B6B] to-[#E08544] p-3 rounded-full text-white">
            <Plane size={24} />
          </div>
          <div>
          <p className="font-black text-xl text-[#1F474A]">{flight.carrier}</p>
            <p className="text-sm font-semibold text-[#1F474A]/70">
              {flight.stops} stop{flight.stops !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#1F474A]">${flight.price}</p>
          <p className="text-xs font-medium text-[#1F474A]/60">Total price</p>
        </div>
      </div>
      <div className="grid grid-cols-3 items-center text-center border-t border-[#1F474A]/10 pt-4">
        <div>
          <p className="font-bold text-lg text-[#416B6B]">{format(parseISO(flight.departureTime), "h:mm a")}</p>
          <p className="text-xs font-semibold text-[#1F474A]/70">Depart</p>
        </div>
        <div className="flex justify-center items-center text-[#1F474A]/50">
          <PlaneTakeoff size={16} className="text-[#416B6B]" />
          <div className="w-full h-px bg-gradient-to-r from-[#416B6B]/0 via-[#416B6B]/50 to-[#E08544]/50 mx-2"></div>
          <PlaneLanding size={16} className="text-[#E08544]" />
        </div>
        <div>
          <p className="font-bold text-lg text-[#E08544]">{format(parseISO(flight.arrivalTime), "h:mm a")}</p>
          <p className="text-xs font-semibold text-[#1F474A]/70">Arrive</p>
        </div>
      </div>
       <button className="w-full mt-2 bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#E08544]/30">
        Select Flight
      </button>
    </li>
  );
  
  const LoadingState = () => (
     <div className="flex flex-col items-center justify-center text-center p-10">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#416B6B]/20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#E08544] absolute top-0"></div>
        </div>
        <p className="text-[#1F474A] text-xl font-semibold mt-6 tracking-wide">Finding the best flights for you...</p>
    </div>
  );

  const EmptyState = () => (
     <div className="text-center bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-20">
        <div className="w-24 h-24 bg-gradient-to-br from-[#416B6B] to-[#E08544] rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
          <Plane className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-black text-[#1F474A] mb-4">Search for Your Flight</h3>
        <p className="text-[#1F474A]/70 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Fill in your travel details above to find the perfect flight for your next adventure.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 font-['Inter']">
      <Header />
      <main className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Search className="w-12 h-12 text-[#416B6B] mx-auto mb-4" />
            <h1 className="text-5xl font-black text-[#1F474A] tracking-tight">
              Find a Flight
            </h1>
            <p className="text-lg text-[#1F474A]/70 mt-2 font-medium">
              Search and compare flights for your trip itinerary.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 mb-12 grid grid-cols-1 md:grid-cols-5 gap-6 items-end"
          >
            <div className="md:col-span-2"><AutocompleteInput label="Origin" value={searchParams.origin} onSelect={(code) => setSearchParams({ ...searchParams, origin: code })} placeholder="e.g., New York (JFK)" /></div>
            <div className="md:col-span-2"><AutocompleteInput label="Destination" value={searchParams.destination} onSelect={(code) => setSearchParams({ ...searchParams, destination: code })} placeholder="e.g., London (LHR)" /></div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">Depart</label>
              <input type="date" name="departureDate" value={searchParams.departureDate} onChange={handleChange} className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm" />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-black tracking-wide mb-3">Adults</label>
              <input type="number" name="adults" min="1" value={searchParams.adults} onChange={handleChange} className="w-full px-6 py-5 bg-white/90 text-black placeholder-black/40 border-2 border-[#416B6B]/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#E08544]/20 focus:border-[#E08544] transition-all duration-300 font-semibold backdrop-blur-sm" />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-[#416B6B] to-[#E08544] text-white font-bold py-5 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#E08544]/30 md:col-span-2 flex items-center justify-center gap-2" disabled={loading}>
              <Search size={20} />
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </form>

          <div>
            {loading && <LoadingState />}
            {error && <p className="text-center text-red-500 font-bold bg-red-100 p-4 rounded-xl">{error}</p>}
            {!loading && !error && flights === null && <EmptyState />}
            {!loading && !error && flights && flights.length > 0 && (
              <ul className="space-y-6">
                {flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)}
              </ul>
            )}
             {!loading && !error && flights && flights.length === 0 && (
                <div className="text-center bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-20">
                    <h3 className="text-3xl font-black text-[#1F474A] mb-4">No Flights Found</h3>
                    <p className="text-[#1F474A]/70 text-lg leading-relaxed max-w-md mx-auto">
                        We couldn't find any flights for this search. Please try adjusting your dates or airports.
                    </p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlightSearchPage;