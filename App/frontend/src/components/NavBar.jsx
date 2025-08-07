import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { AuthAPI } from "../adapters/apiAdapter";
import Logo from "../images/logo.png";
import { 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Dashboard, 
  Calendar,
  MessageSquare,
  Settings
} from "lucide-react";

export default function NavBar() {
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only render if user is loaded and exists
  if (loadingUser || !user) {
    return null;
  }

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/signin");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Dashboard },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/trips", label: "Trips", icon: Calendar },
    { path: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#E08544]/95 to-[#416B6B]/95 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 group no-underline"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 blur-sm"></div>
              <img
                src={Logo}
                alt="Made It Out Logo"
                className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white whitespace-nowrap tracking-tight transition-all duration-300 group-hover:text-white/90">
                Made It Out
              </h1>
              <span className="text-xs text-white/80 font-semibold tracking-wider hidden sm:block transition-all duration-300 group-hover:text-white/90">
                GROUP TRAVEL SIMPLIFIED
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 no-underline ${
                    isActive(item.path)
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 rounded-xl"></div>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="group relative overflow-hidden bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-white/20 px-4 py-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 no-underline ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#416B6B]/20 to-[#E08544]/20 text-[#1F474A]"
                      : "text-[#1F474A]/80 hover:text-[#1F474A] hover:bg-[#416B6B]/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* User Info and Logout in Mobile */}
            <div className="border-t border-[#1F474A]/10 pt-4 mt-4">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#416B6B]/20 to-[#E08544]/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1F474A]" />
                </div>
                <span className="text-[#1F474A] font-semibold">
                  {user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
