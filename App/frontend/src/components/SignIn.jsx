import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../adapters/apiAdapter';
import UnauthenticatedHeader from "./UnauthenticatedHeader"


function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(''); // Ensure error state is used for display

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const res = await AuthAPI.signIn(formData);
      localStorage.setItem("token", res.access_token); // Save token after login
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.'); // Use setError
    }
  };
  

  return (
    // Main container: Dark gradient background
    <>
    <UnauthenticatedHeader />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01374A] to-[#012A3D] p-6">
      {/* Form Card: Darker Ocean Blue background, softer rounded corners, modern shadow, white text */}
      <div className="w-full max-w-md bg-[#012A3D] p-8 rounded-2xl shadow-xl text-white">
        {/* Title: Accent color, bold */}
        <h2 className="text-2xl font-bold text-center mb-8 text-[#72ADBF]">Sign In</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}> {/* Increased space-y */}
          <div>
            {/* Labels: Lighter gray text */}
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            {/* Inputs: Deep Ocean Blue background, white text, light teal border, rounded-lg */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              placeholder="you@example.com"
              required
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#01374A] text-white placeholder-gray-400 border border-[#72ADBF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0395A7]"
              placeholder="••••••••"
              required
              />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mt-2">{error}</p> // Error color
          )}

          {/* Submit Button: Primary style */}
          <button
            type="submit"
            className="w-full text-white text-lg font-semibold uppercase
            py-3 px-6 rounded-lg border border-[#0395A7]
            bg-[#0395A7] hover:bg-[#5E877D]
            transition-all duration-300 ease-in-out
            shadow-md hover:shadow-lg transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-[#72ADBF] mt-6"
            >
            Sign In
          </button>
        </form>

        {/* Link to Sign Up: Accent color, underline */}
        <p className="text-center text-sm text-gray-400 mt-6"> {/* Lighter gray text, increased mt */}
          Don't have an account? <Link to="/signup" className="text-[#72ADBF] hover:underline transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
            </>
  );
}

export default SignIn;
