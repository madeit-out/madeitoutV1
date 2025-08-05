import React, { useState, useEffect, useRef } from "react";
//import { BookingAPI } from "../adapters/";
import { format, parseISO } from "date-fns";
import { searchAirports } from "../utils/flightSearchUtils.js";

// A reusable Autocomplete component for airport searching
const AutocompleteInput = ({ label, value, onSelect, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Effect to handle clicks outside of the component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    onSelect(airport.code); // Pass the IATA code up to the parent
    setQuery(`${airport.name} (${airport.code})`); // Display the full name in the input
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query || value}
        onChange={handleInputChange}
        onFocus={() => query.length > 1 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-[#01374A] border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-[#01374A] border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {results.map((airport) => (
            <li
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="px-4 py-2 text-white hover:bg-[#0395A7] cursor-pointer"
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
    origin: "JFK", // Default to IATA codes
    destination: "LHR",
    departureDate: "2025-08-15",
    adults: 1,
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFlights([]);
    try {
      const results = await BookingAPI.searchFlights(searchParams);
      setFlights(results);
    } catch (err) {
      setError(err.message || "Failed to find flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const FlightCard = ({ flight }) => (
    <li className="bg-[#01374A] p-4 rounded-lg shadow-md flex justify-between items-center border border-transparent hover:border-[#72ADBF] transition-all">
      <div className="flex items-center space-x-4">
        <div className="text-2xl">✈️</div>
        <div>
          <p className="font-bold text-lg text-white">{flight.carrier}</p>
          <p className="text-sm text-gray-400">
            {flight.stops} stop{flight.stops !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white">
          {format(parseISO(flight.departureTime), "h:mm a")}
        </p>
        <p className="text-xs text-gray-500">Depart</p>
      </div>
      <div className="text-center">
        <p className="text-white">
          {format(parseISO(flight.arrivalTime), "h:mm a")}
        </p>
        <p className="text-xs text-gray-500">Arrive</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-[#72ADBF]">${flight.price}</p>
        <button className="mt-1 text-sm bg-[#0395A7] text-white py-1 px-3 rounded-md hover:bg-opacity-80">
          Select
        </button>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01374A] to-[#012A3D] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#72ADBF] mb-6">
          Find a Flight
        </h1>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#012A3D] p-6 rounded-xl shadow-lg border border-[#01374A] mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <AutocompleteInput
              label="Origin"
              value={searchParams.origin}
              onSelect={(code) =>
                setSearchParams({ ...searchParams, origin: code })
              }
              placeholder="e.g., New York"
            />
          </div>
          <div className="md:col-span-1">
            <AutocompleteInput
              label="Destination"
              value={searchParams.destination}
              onSelect={(code) =>
                setSearchParams({ ...searchParams, destination: code })
              }
              placeholder="e.g., London"
            />
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="departureDate"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Depart
            </label>
            <input
              type="date"
              name="departureDate"
              value={searchParams.departureDate}
              onChange={handleChange}
              className="w-full bg-[#01374A] border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            />
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="adults"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Adults
            </label>
            <input
              type="number"
              name="adults"
              min="1"
              value={searchParams.adults}
              onChange={handleChange}
              className="w-full bg-[#01374A] border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0395A7] text-white font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors md:col-span-1"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Results */}
        <div>
          {error && <p className="text-center text-red-400">{error}</p>}
          {loading && (
            <p className="text-center text-gray-300">
              Searching for the best flights...
            </p>
          )}
          {!loading && flights.length > 0 && (
            <ul className="space-y-4">
              {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </ul>
          )}
          {!loading && !error && flights.length === 0 && (
            <p className="text-center text-gray-500">
              Enter your travel details to begin your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightSearchPage;
