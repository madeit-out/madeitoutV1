import React from "react";
import Logo from "../images/logo.png"; // Assuming you have a logo image

export default function UnauthenticatedHeader() {
  return (
    <header className="bg-[#E08544]/95 text-[#1F474A] p-4 shadow-lg sticky top-0 z-40 backdrop-blur-md border-b border-[#1F474A]/10">
      <div className="container mx-auto flex items-center justify-between relative px-4">
        {/* Enhanced Logo and Brand Section */}
        <div className="flex items-center space-x-4 group">
          <div className="relative">
            <img
              src={Logo}
              alt="Made It Out Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F474A] whitespace-nowrap tracking-tight">
              Made It Out
            </h1>
            <span className="text-xs sm:text-sm text-[#1F474A]/70 font-medium tracking-wide hidden sm:block">
              GROUP TRAVEL SIMPLIFIED
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
