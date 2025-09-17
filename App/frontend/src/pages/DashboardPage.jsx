import Dashboard from "../components/TripsDashboard";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { Plane , Car} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timer to stop loading after 5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#012A3D] text-white">
      {loading ? (
        <div className="animate-bounce flex flex-col items-center justify-center min-h-screen">
          <Plane className="animate-spin" size={84} />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      ) : (
        <>
          <Header />
          <Dashboard />
        </>
      )}
    </div>
  );
}
// import Header from "../components/Header";
// import {useEffect, useState} from "react";
// import { Plane } from "lucide-react";

// export default function DashboardPage() {
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 5000);
//    return () => clearTimeout(timer);
//   }, []);
//   return (
//     <div className="animate-bounce flex flex-col items-center justify-center min-h-screen bg-[#012A3D] text-white">
//     <Plane className="animate-spin" size={48} />
//     <div className="min-h-screen bg-[#012A3D] text-white">
//       <Header />
//       <Dashboard />
//     </div>
//       </div>
//   );
// }
