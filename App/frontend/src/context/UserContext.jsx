import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthAPI, TripAPI } from "../adapters/apiAdapter";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Function to fetch trips
  const fetchTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      return;
    }
    
    setLoadingTrips(true);
    try {
      console.log("UserContext Debug: Fetching trips for user:", user.email || user.username);
      const data = await TripAPI.getUserTrips();
      console.log("UserContext Debug: Trips fetched successfully:", data);
      setTrips(data || []); // Ensure we always set an array
    } catch (err) { // <-- FIXED: Proper spacing and syntax
      console.error("Context Error: Failed to fetch trips:", err);
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, [user]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      console.log("UserContext Debug: loadUser function called.");
      const token = localStorage.getItem("token");
      console.log("UserContext Debug: Token from localStorage:", token ? "Present" : "Not Present");

      if (!token) {
        setLoadingUser(false);
        setUser(null);
        setTrips([]); // Clear trips when no user
        console.log("UserContext Debug: No token found, setting loadingUser to false, user to null.");
        return;
      }

      try {
        console.log("UserContext Debug: Token found, attempting to fetch user via AuthAPI.getUser().");
        const data = await AuthAPI.getUser();
        console.log("UserContext Debug: AuthAPI.getUser() returned data:", data);
        setUser(data);
        console.log("UserContext Debug: User set:", data.username || data.email);
      } catch (err) {
        console.error("UserContext Error: Failed to fetch user:", err);
        localStorage.removeItem("token");
        setUser(null);
        setTrips([]); // Clear trips on auth error
        console.log("UserContext Debug: Error fetching user, token removed, user set to null.");
      } finally {
        setLoadingUser(false);
        console.log("UserContext Debug: Setting loadingUser to false (finally block).");
      }
    };

    loadUser();
  }, []);

  // Fetch trips when user is set
  useEffect(() => {
    console.log("UserContext Debug: User effect triggered, user:", user);
    if (user && !loadingUser) {
      console.log("UserContext Debug: User is set and not loading, fetching trips...");
      fetchTrips();
    } else if (!user) {
      console.log("UserContext Debug: No user, clearing trips");
      setTrips([]);
    }
  }, [user, loadingUser]);

  // Debug log current state
  console.log("UserContext Render:", {
    user: user ? (user.email || user.username) : null,
    loadingUser,
    tripsCount: trips.length,
    loadingTrips
  });

  const value = {
    user,
    setUser,
    loadingUser,
    trips,
    loadingTrips,
    refreshTrips: fetchTrips,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};