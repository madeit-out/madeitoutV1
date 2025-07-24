import { Routes, Route } from "react-router-dom";

import "./App.css";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/TripsDashboard";
import CreateTrip from "./components/CreateTrip";
import Itinerary from "./components/Intinerary";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Add this lin

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <ProtectedRoute>
              <Itinerary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
