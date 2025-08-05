import React from "react";
import Family from "../images/family.png"; // Ensure you have this image in the specified path

export default function Home() {
  return (
    <div
      className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-16 px-8
                 bg-cover bg-center bg-no-repeat font-inter text-white
                 before:content-[''] before:absolute before:inset-0 before:bg-black before:opacity-60"
      style={{ backgroundImage: `url(${Family})` }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
        {/* Main heading: More impactful and professional */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6
                     text-[#F5F5DC] leading-tight tracking-tight"
        >
          Effortless Group Travel.{" "}
          <span className="text-[#E08544]">Finally.</span>
        </h1>

        {/* Enhanced professional description */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-4xl leading-relaxed font-light">
          <strong className="text-[#F5F5DC] font-semibold">Made It Out</strong>{" "}
          transforms chaotic group coordination into seamless travel
          experiences. Our comprehensive platform eliminates the frustration of
          endless message threads and scattered planning, delivering
          professional-grade trip management tools that bring your group's
          vision to life.
        </p>

        {/* Professional value proposition */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed font-light">
          From concept to itinerary, we orchestrate every detail so you can
          focus on what matters most—
          <span className="text-[#E08544] font-medium">
            {" "}
            creating extraordinary memories together
          </span>
          .
        </p>

        {/* Enhanced buttons with more professional copy */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <a
            href="/signin"
            className="
              text-white text-xl sm:text-2xl font-semibold uppercase
              py-4 px-10 rounded-lg border-2 border-white
              bg-[#416B6B] hover:bg-[#E08544]
              transition-all duration-300 ease-in-out
              shadow-lg hover:shadow-xl transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75
              !no-underline
            "
          >
            Access Your Account
          </a>
          <a
            href="/signup"
            className="
              text-white text-xl sm:text-2xl font-semibold uppercase
              py-4 px-10 rounded-lg border-2 border-white
              bg-[#416B6B] hover:bg-[#E08544]
              transition-all duration-300 ease-in-out
              shadow-lg hover:shadow-xl transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75
              !no-underline
            "
          >
            Start Planning Today
          </a>
        </div>

        {/* Additional professional touch - subtle feature highlights */}
        <div className="mt-16 pt-8 border-t border-gray-400 border-opacity-30">
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
            Trusted by travel enthusiasts worldwide • Real-time collaboration •
            Intelligent itinerary management • Seamless expense tracking
          </p>
        </div>
      </div>
    </div>
  );
}
