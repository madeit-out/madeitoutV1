// Header.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext"; // Import useUser context
import { AuthAPI } from "../adapters/apiAdapter"; // Import AuthAPI for logout
import Logo from "../images/logo.png"; // Assuming you have a logo image

export default function Header() {
  const { user, loadingUser } = useUser(); // Get user and loading status from context
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu visibility

  // Only render the header if user is loaded and exists
  if (loadingUser || !user) {
    return null; // Don't render header if user data is still loading or no user is signed in
  }

  const handleLogout = () => {
    AuthAPI.logout(); // Call the logout function from your adapter
    navigate("/signin"); // Redirect to sign-in page after logout
    setIsMenuOpen(false); // Close menu on logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#E08544]/95 text-[#1F474A] py-2 px-4 shadow-lg sticky top-0 z-40 backdrop-blur-md border-b border-[#1F474A]/10">
      <div className="container mx-auto flex items-center justify-between relative px-4 min-h-[60px]">
        {/* Enhanced Logo and Brand Section */}
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <img 
              src={Logo} 
              alt="Made It Out Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F474A] whitespace-nowrap tracking-tight leading-tight">
              Made It Out
            </h1>
            <span className="text-xs text-[#1F474A]/70 font-medium tracking-wide hidden sm:block leading-none">
              GROUP TRAVEL SIMPLIFIED
            </span>
          </div>
        </div>

        {/* Desktop Navigation (Visible on large screens) */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="text-[#1F474A]/80 hover:text-[#1F474A] font-semibold transition-all duration-200 hover:underline decoration-2 underline-offset-4 px-2 py-1 rounded-md hover:bg-[#1F474A]/10"
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="text-[#1F474A]/80 hover:text-[#1F474A] font-semibold transition-all duration-200 hover:underline decoration-2 underline-offset-4 px-2 py-1 rounded-md hover:bg-[#1F474A]/10"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="
              bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 py-1.5 rounded-md
              hover:from-red-600 hover:to-red-700 transition-all duration-200
              shadow-md hover:shadow-lg transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-red-500/30
              text-sm
            "
          >
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button (Visible on small screens) */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-md hover:bg-[#1F474A]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1F474A]/30"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-6 h-6 text-[#1F474A]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Enhanced Mobile Menu Dropdown */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-96 opacity-100 mt-2"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 mx-4 p-2">
          <ul className="flex flex-col space-y-1">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 py-2.5 px-3 text-[#1F474A] hover:bg-[#416B6B]/10 rounded-lg transition-all duration-200 font-semibold group"
              >
                <svg className="w-4 h-4 text-[#416B6B] group-hover:text-[#E08544] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15V9l8 6H8z" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 py-2.5 px-3 text-[#1F474A] hover:bg-[#416B6B]/10 rounded-lg transition-all duration-200 font-semibold group"
              >
                <svg className="w-4 h-4 text-[#416B6B] group-hover:text-[#E08544] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </Link>
            </li>
            <li className="pt-1 border-t border-[#1F474A]/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-semibold group"
              >
                <svg className="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}