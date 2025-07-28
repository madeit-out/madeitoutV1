import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext"; // Import useUser context
import { AuthAPI } from "../adapters/apiAdapter"; // Import AuthAPI for logout

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
    <header className="bg-[#012A3D] text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Hamburger Menu Button (Visible on small screens) */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-[#72ADBF] focus:outline-none p-2 rounded-md hover:bg-[#0395A7] hover:bg-opacity-20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"
                }
              ></path>
            </svg>
          </button>
        </div>

        {/* Centered App Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl font-bold text-[#72ADBF] whitespace-nowrap">
            Made It Out
          </h1>
        </div>

        {/* Desktop Navigation (Visible on large screens) */}
        <nav className="hidden lg:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link
                to="/dashboard"
                className="text-white hover:text-[#72ADBF] font-semibold transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="text-white hover:text-[#72ADBF] font-semibold transition-colors"
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>

        {/* Placeholder for spacing on mobile when menu is closed, if needed */}
        {/* On large screens, desktop nav fills the space */}
        <div className="hidden lg:hidden w-8 h-8"></div>
      </div>

      {/* Mobile Menu Dropdown (Toggle based on isMenuOpen state) */}
      <nav
        className={`lg:hidden mt-4 transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <ul className="flex flex-col space-y-2">
          <li>
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
              className="block py-3 px-4 text-white hover:bg-[#0395A7] rounded-md transition-colors font-semibold"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
              className="block py-3 px-4 text-white hover:bg-[#0395A7] rounded-md transition-colors font-semibold"
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left py-3 px-4 text-white hover:bg-red-700 rounded-md transition-colors font-semibold"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
