import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripAPI } from '../adapters/apiAdapter';
import { useUser } from '../context/UserContext';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // once user is loaded, fetch trips
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const data = await TripAPI.getUserTrips();
        setTrips(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load trips.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return <p className="text-center mt-8">Loading your trips…</p>;
  }
  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  }

  const now = new Date();
  const upcoming = trips.filter(t => new Date(t.arrival) > now);
  const active   = trips.filter(t => new Date(t.arrival) <= now && new Date(t.departure) >= now);

  const renderList = (list) => (
    <ul className="space-y-2">
      {list.map(trip => (
        <li key={trip._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
          <div>
            <h3 className="font-semibold">{trip.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(trip.arrival).toLocaleDateString()} – {new Date(trip.departure).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => navigate(`/trips/${trip._id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Trips</h1>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Active Trips</h2>
          {renderList(active)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Upcoming Trips</h2>
          {renderList(upcoming)}
        </section>
      )}

      {active.length === 0 && upcoming.length === 0 && (
        <div className="text-center mt-12">
          <p className="mb-4 text-gray-700">You don’t have any active or upcoming trips yet.</p>
          <button
            onClick={() => navigate('/create-trip')}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
          >
            Plan a Trip
          </button>
        </div>
      )}
    </div>
  );
}
