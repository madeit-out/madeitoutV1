import React, { useEffect, useState } from 'react';
import { TripAPI } from '../adapters/apiAdapter';
import { useUser } from '../context/UserContext'; // Assuming you have a UserContext to get user info
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate(); // ✅ Add this

  useEffect(() => {
    if (!user?._id) return;

    const fetchTrips = async () => {
      try {
        const data = await TripAPI.getUserTrips(user._id);
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
  }, [user]);

  const now = new Date();

  const upcomingTrips = trips.filter(trip => new Date(trip.arrival) > now);
  const activeTrips = trips.filter(
    trip =>
      new Date(trip.arrival) <= now && new Date(trip.departure) >= now
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
        Your Trips
      </h1>

      {activeTrips.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Active Trips</h2>
          <ul style={{ marginBottom: '1rem' }}>
            {activeTrips.map(trip => (
              <li key={trip._id}>{trip.title}</li>
            ))}
          </ul>
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Upcoming Trips</h2>
          <ul style={{ marginBottom: '1rem' }}>
            {upcomingTrips.map(trip => (
              <li key={trip._id}>{trip.title}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTrips.length === 0 && upcomingTrips.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            No active or upcoming trips found.
          </p>
          <button
            onClick={() => navigate('/create-trip')} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Plan a Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
