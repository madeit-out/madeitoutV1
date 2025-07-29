import { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../adapters/apiAdapter"; // adjust the path if needed

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // optional: to manage loading state

  useEffect(() => {
    const loadUser = async () => {
      console.log("UserContext Debug: loadUser function called.");
      const token = localStorage.getItem("token");
      console.log("UserContext Debug: Token from localStorage:", token ? "Present" : "Not Present");

      if (!token) {
        setLoadingUser(false);
        setUser(null); // Ensure user is null if no token
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
        localStorage.removeItem("token"); // Clear invalid token
        setUser(null); // Ensure user is null on error
        console.log("UserContext Debug: Error fetching user, token removed, user set to null.");
      } finally {
        setLoadingUser(false);
        console.log("UserContext Debug: Setting loadingUser to false (finally block).");
      }
    };

    loadUser();
  }, []); // Empty dependency array means this runs once on mount

  // Debug log to see current context values
  console.log("UserContext Render: user =", user, ", loadingUser =", loadingUser);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};
