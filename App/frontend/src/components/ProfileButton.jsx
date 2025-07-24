import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileButton() {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  return (
    <button
      onClick={handleGoToProfile}
      className="text-white text-md font-semibold uppercase
                 py-2 px-4 rounded-lg border border-[#72ADBF]
                 bg-[#01374A] hover:bg-[#0395A7] hover:bg-opacity-20
                 transition-all duration-300 ease-in-out
                 shadow-md hover:shadow-lg transform hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-[#72ADBF]
                 text-sm"
      title="Go to Profile"
    >
      Profile
    </button>
  );
}
