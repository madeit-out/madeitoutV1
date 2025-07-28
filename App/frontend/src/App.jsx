import { Routes, Route } from "react-router-dom";

import "./App.css";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/TripsDashboard";
import CreateTrip from "./components/CreateTrip";
import Itinerary from "./components/Intinerary"; // Corrected spelling from Intinerary to Itinerary
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header"; // Import the Header component

function App() {
  return (
    <>
      {/* The Header component is now rendered inside each ProtectedRoute */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Header /> {/* Header inside ProtectedRoute */}
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <Header /> {/* Header inside ProtectedRoute */}
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <ProtectedRoute>
              <Header /> {/* Header inside ProtectedRoute */}
              <Itinerary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Header /> {/* Header inside ProtectedRoute */}
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
