import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import Itinerary from "../components/Itinerary";
import TripChat from "../components/TripChat";
import { AuthAPI } from "../adapters/apiAdapter";

export default function ItineraryPage() {
  const { tripId } = useParams(); // get tripId from route if applicable
  const [chatUserId, setChatUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AuthAPI.getUser();
        setChatUserId(user._id);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <Header />
      <Itinerary />
      {tripId && chatUserId && !loadingUser && (
        <TripChat tripId={tripId} userId={chatUserId} />
      )}
    </div>
  );
}
