import { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../adapters/apiAdapter"; // adjust the path if needed

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // optional: to manage loading state

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const data = await AuthAPI.getUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        localStorage.removeItem("token");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};
