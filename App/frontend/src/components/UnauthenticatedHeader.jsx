import React from "react";
import { Link } from "react-router-dom"; // 1. Import the Link component
import Logo from "../images/logo.png";

export default function UnauthenticatedHeader() {
  return (
    <header className="bg-[#E08544]/95 text-[#1F474A] p-4 shadow-lg sticky top-0 z-40 backdrop-blur-md border-b border-[#1F474A]/10">
      <div className="container mx-auto flex items-center justify-between relative px-4">
        {/* 2. Wrap the logo and brand name in a Link component */}
        <Link
          to="/"
          className="flex items-center space-x-4 group !no-underline"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#1F474A]/10 rounded-full transition-transform duration-300 group-hover:scale-105"></div>
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
        </Link>
      </div>
    </header>
  );
}
