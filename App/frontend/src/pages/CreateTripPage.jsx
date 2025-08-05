import CreateTrip from "../components/CreateTrip";
import Header from "../components/Header";

export default function CreateTripPage({ onTripCreated }) {
  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <Header />
      <CreateTrip onTripCreated={onTripCreated} />
    </div>
  );
}
