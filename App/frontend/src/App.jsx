import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import "./App.css";
// Import Page components
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryPage from "./pages/ItineraryPage";
import ProfilePage from "./pages/ProfilePage";
import FlightSearchPage from "./pages/FlightSearchPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { UserProvider } from "./context/UserContext";

function App() {
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  const triggerDashboardRefresh = () => {
    setDashboardRefreshTrigger((prev) => prev + 1);
  };

  return (
    <UserProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes are now individually wrapped */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage
                refreshTrigger={dashboardRefreshTrigger}
                onTripChange={triggerDashboardRefresh}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTripPage onTripCreated={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <ProtectedRoute>
              <ItineraryPage onTripChange={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage onInviteAccepted={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/search-flights" element={<FlightSearchPage />} /> */}
      </Routes>
    </UserProvider>
  );
}

export default App;
