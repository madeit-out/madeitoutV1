// src/utils/flightSearchUtils.js

import { airports } from "../data/airportData.js"; // Adjust the import path as needed

/**
 * Searches and filters the airport list based on a user's query.
 * The search is case-insensitive and checks against both the airport name and its IATA code.
 *
 * @param {string} query - The search term entered by the user.
 * @returns {Array<{name: string, code: string}>} - An array of matching airport objects.
 */
export const searchAirports = (query) => {
  // Return an empty array if the query is too short to be meaningful
  if (!query || query.trim().length < 2) {
    return [];
  }

  const lowercasedQuery = query.trim().toLowerCase();

  // Filter the list of airports
  const results = airports.filter((airport) => {
    const nameMatch = airport.name.toLowerCase().includes(lowercasedQuery);
    const codeMatch = airport.code.toLowerCase().includes(lowercasedQuery);
    return nameMatch || codeMatch;
  });

  // Return a limited number of results for performance
  return results.slice(0, 10);
};
