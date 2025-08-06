import Home from "../components/Home";
import UnauthenticatedHeader from "../components/UnauthenticatedHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <UnauthenticatedHeader />
      <Home />
    </div>
  );
}
