// Header.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { AuthAPI } from "../adapters/apiAdapter";
import Logo from "../images/logo.png";
import { LogOut, Menu, X, Home, User } from "lucide-react";

export default function Header() {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded immediately when user is available
    if (user) {
      setIsLoaded(true);
    }
  }, [user]);

  // Only render the header if user is loaded and exists
  if (loadingUser || !user) {
    return null;
  }

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/signin");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-[#E08544]/95 to-[#416B6B]/95 text-[#1F474A] py-2 px-4 shadow-xl sticky top-0 z-40 backdrop-blur-md border-b border-[#1F474A]/10">
      <div className="container mx-auto flex items-center justify-between relative px-4 min-h-[60px]">
        {/* Enhanced Logo and Brand Section */}
        <div className={`flex items-center space-x-3 group transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        }`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F474A]/20 to-[#E08544]/20 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 blur-sm"></div>
            <img 
              src={Logo} 
              alt="Made It Out Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg relative z-10" 
            />
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-[#1F474A] whitespace-nowrap tracking-tight leading-tight transition-all duration-300 group-hover:text-[#416B6B]">
              Made It Out
            </h1>
            <span className="text-xs text-[#1F474A]/70 font-semibold tracking-wider hidden sm:block leading-none transition-all duration-300 group-hover:text-[#E08544] group-hover:tracking-widest">
              GROUP TRAVEL SIMPLIFIED
            </span>
          </div>
        </div>

        {/* Enhanced Desktop Navigation Bar (Visible on all screens) */}
        <nav className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-1000 delay-300 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}>
          <Link
            to="/dashboard"
            className="group relative overflow-hidden flex items-center text-[#1F474A]/80 hover:text-[#1F474A] font-bold transition-all duration-300 hover:scale-105 px-2 sm:px-3 py-2 rounded-xl hover:bg-[#1F474A]/10 backdrop-blur-sm no-underline border border-[#1F474A]/20 hover:border-[#1F474A]/40"
          >
            <span className="relative z-10 flex items-center">
              <Home className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E08544]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-xl"></div>
          </Link>
          <Link
            to="/profile"
            className="group relative overflow-hidden flex items-center text-[#1F474A]/80 hover:text-[#1F474A] font-bold transition-all duration-300 hover:scale-105 px-2 sm:px-3 py-2 rounded-xl hover:bg-[#1F474A]/10 backdrop-blur-sm no-underline border border-[#1F474A]/20 hover:border-[#1F474A]/40"
          >
            <span className="relative z-10 flex items-center">
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E08544]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-xl"></div>
          </Link>
          <button
            onClick={handleLogout}
            className="group relative overflow-hidden flex items-center text-white font-bold px-2 sm:px-3 py-2 rounded-xl
                     bg-gradient-to-r from-[#416B6B] to-[#416B6B]/90 hover:from-[#E08544] hover:to-[#E08544]/90
                     transition-all duration-300 ease-out
                     shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-[#E08544]/50 focus:ring-offset-2 focus:ring-offset-transparent
                     text-sm backdrop-blur-sm border border-[#416B6B]/30 hover:border-[#E08544]/50"
          >
            <span className="relative z-10 flex items-center">
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </nav>

        {/* Mobile Menu Button (Visible on small screens) */}
        <button
          onClick={toggleMenu}
          className={`md:hidden p-2 rounded-lg hover:bg-[#1F474A]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1F474A]/30 hover:scale-105 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-[#1F474A] transition-transform duration-300" />
          ) : (
            <Menu className="w-6 h-6 text-[#1F474A] transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
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
                className="group flex items-center space-x-3 py-2.5 px-3 text-[#1F474A] hover:bg-[#416B6B]/10 rounded-lg transition-all duration-200 font-semibold no-underline"
              >
                <div className="p-2 bg-[#416B6B]/10 rounded-lg group-hover:bg-[#E08544]/20 transition-all duration-300">
                  <Home className="w-4 h-4 text-[#416B6B] group-hover:text-[#E08544] transition-colors" />
                </div>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center space-x-3 py-2.5 px-3 text-[#1F474A] hover:bg-[#416B6B]/10 rounded-lg transition-all duration-200 font-semibold no-underline"
              >
                <div className="p-2 bg-[#416B6B]/10 rounded-lg group-hover:bg-[#E08544]/20 transition-all duration-300">
                  <User className="w-4 h-4 text-[#416B6B] group-hover:text-[#E08544] transition-colors" />
                </div>
                <span>Profile</span>
              </Link>
            </li>
            <li className="pt-2 border-t border-[#1F474A]/10">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center space-x-3 py-2.5 px-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-200 font-semibold"
              >
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-all duration-300">
                  <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors" />
                </div>
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}