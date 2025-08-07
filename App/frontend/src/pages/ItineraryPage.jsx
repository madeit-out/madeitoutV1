import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import Itinerary from "../components/Itinerary";

export default function ItineraryPage() {
  const { tripId } = useParams(); // get tripId from route if applicable
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#F5F5DC] to-[#E08544]/20 transition-all duration-1000 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`}>
      <Header />
      
      {/* Main Content Container */}
      <div className="min-h-screen">
        <Itinerary />
      </div>
    </div>
  );
}
