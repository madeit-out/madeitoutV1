import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../images/logo.png";

export default function UnauthenticatedHeader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#E08544]/95 to-[#416B6B]/95 text-[#1F474A] p-4 shadow-xl sticky top-0 z-40 backdrop-blur-md border-b border-[#1F474A]/10">
      <div className="container mx-auto flex items-center justify-between relative px-4">
        {/* Enhanced Logo and Brand Section with animations */}
        <Link
          to="/"
          className={`flex items-center space-x-4 group !no-underline transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F474A]/20 to-[#E08544]/20 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 blur-sm"></div>
            <img
              src={Logo}
              alt="Made It Out Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg relative z-10"
            />
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F474A] whitespace-nowrap tracking-tight transition-all duration-300 group-hover:text-[#416B6B]">
              Made It Out
            </h1>
            <span className="text-xs sm:text-sm text-[#1F474A]/70 font-semibold tracking-wider hidden sm:block transition-all duration-300 group-hover:text-[#E08544] group-hover:tracking-widest">
              GROUP TRAVEL SIMPLIFIED
            </span>
          </div>
        </Link>

        {/* Right side navigation/actions */}
        <div className={`flex items-center space-x-4 transition-all duration-1000 delay-300 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}>
          <Link
            to="/signin"
            className="hidden sm:block text-[#1F474A]/80 hover:text-[#1F474A] font-semibold transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-[#E08544]/10 backdrop-blur-sm"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="group relative overflow-hidden text-white text-sm font-semibold uppercase
                     py-2 px-6 rounded-xl border-2 border-[#E08544]/30
                     bg-gradient-to-r from-[#E08544] to-[#E08544]/90 hover:from-[#416B6B] hover:to-[#416B6B]/90
                     transition-all duration-300 ease-out
                     shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-[#416B6B]/50 focus:ring-offset-2 focus:ring-offset-transparent
                     !no-underline backdrop-blur-sm"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}
