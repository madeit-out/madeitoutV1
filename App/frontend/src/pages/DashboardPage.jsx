import Dashboard from "../components/TripsDashboard";
import Header from "../components/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      <Header />
      <Dashboard />
    </div>
  );
}
