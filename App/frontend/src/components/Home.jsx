import React from "react";
import UnauthenticatedHeader from "./UnauthenticatedHeader"; // Import the new header component

// Main App component to render the Home component
function App() {
  return <Home />;
}

// Home component redesigned for a more inviting and engaging aesthetic
function Home() {
  return (
    <>
      <UnauthenticatedHeader /> {/* Render the unauthenticated header */}
      {/* Main content container: full screen height (minus header), centered content, deep dark gradient background */}
      <div
        className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-16 px-8
                    bg-gradient-to-br from-[#01374A] to-[#012A3D] font-inter text-white"
      >
        {/* Main heading: Directly addresses the app name and the problem it solves */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-16
                     text-[#72ADBF] text-center max-w-5xl leading-tight tracking-tight"
        >
          READY TO ACTUALLY <span className="text-[#0395A7]">MAKE IT OUT</span> OF THE GROUP CHAT?
        </h1>

        {/* Sub-heading/tagline: Elaborates on the solution and benefits */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 text-center mb-24 max-w-4xl leading-relaxed">
          Stop planning in endless threads. Seamlessly organize, collaborate, and embark on unforgettable trips together.
        </p>

        {/* Buttons container: Prominent, clear calls to action */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
          {/* Sign In button/link: Styled as a primary button for clear action */}
          <a
            href="/signin"
            className="
              text-white text-xl sm:text-2xl font-semibold uppercase
              py-4 px-10 rounded-lg border border-[#0395A7]
              bg-[#0395A7] hover:bg-[#5E877D]
              transition-all duration-300 ease-in-out
              shadow-lg hover:shadow-xl transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-[#72ADBF] focus:ring-opacity-75
              no-underline 
            "
          >
            SIGN IN
          </a>
          {/* Create Account button/link: Same styling for consistency. */}
          <a
            href="/signup"
            className="
              text-white text-xl sm:text-2xl font-semibold uppercase
              py-4 px-10 rounded-lg border border-[#0395A7]
              bg-[#0395A7] hover:bg-[#5E877D]
              transition-all duration-300 ease-in-out
              shadow-lg hover:shadow-xl transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-[#72ADBF] focus:ring-opacity-75
              no-underline
            "
          >
            CREATE ACCOUNT
          </a>
        </div>
      </div>
    </>
  );
}

export default App; // Export App as the default component
