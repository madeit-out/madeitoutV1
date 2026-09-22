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
      const data = await TripAPI.getUserTrips();
      setTrips(data || []); // Ensure we always set an array
    } catch (err) {
      console.error("Context Error: Failed to fetch trips:", err);
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, [user]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingUser(false);
        setUser(null);
        setTrips([]); // Clear trips when no user
        return;
      }

      try {
        const data = await AuthAPI.getUser();
        setUser(data);
      } catch (err) {
        console.error("UserContext Error: Failed to fetch user:", err);
        localStorage.removeItem("token");
        setUser(null);
        setTrips([]); // Clear trips on auth error
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // Fetch trips when user is set
  useEffect(() => {
    if (user && !loadingUser) {
      fetchTrips();
    } else if (!user) {
      setTrips([]);
    }
  }, [user, loadingUser]);

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