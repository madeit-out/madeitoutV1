import { Routes, Route } from "react-router-dom";
import React, { useState } from 'react'; // Import useState

import "./App.css";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/TripsDashboard";
import CreateTrip from "./components/CreateTrip";
import Itinerary from "./components/Intinerary"; // Corrected spelling from Intinerary to Itinerary
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import { UserProvider } from './context/UserContext';

function App() {
  // State to trigger dashboard refresh
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  // Function to increment the trigger, forcing dashboard to refresh
  const triggerDashboardRefresh = () => {
    setDashboardRefreshTrigger(prev => prev + 1);
  };

  return (
    <UserProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />}/>

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* Pass the trigger and the function to Dashboard */}
              <Dashboard refreshTrigger={dashboardRefreshTrigger} onTripChange={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              {/* Pass the trigger function to CreateTrip */}
              <CreateTrip onTripCreated={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <ProtectedRoute>
              {/* Itinerary can also trigger dashboard refresh if events affect trip status */}
              <Itinerary onTripChange={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {/* Profile needs to trigger dashboard refresh after accepting invites */}
              <Profile onInviteAccepted={triggerDashboardRefresh} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </UserProvider>
  );
}

export default App;
