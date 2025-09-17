import { Routes, Route } from "react-router-dom";
import "./App.css";

// Import Page components
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTripPage from "./pages/CreateTripPage";
import ItineraryPage from "./pages/ItineraryPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import FlightSearchPage from "./pages/FlightSearchPage";
import AuthCallback from "./components/AuthCallback"; // NEW: Import the AuthCallback component

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* NEW: Route to handle Google login callback */}
      <Route path="/auth/callback" element={<AuthCallback />} /> 

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTripPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/itinerary"
        element={
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/search-flights" 
        element={
          <ProtectedRoute>
            <FlightSearchPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;