import React from 'react';

// Main App component to render the Home component
function App() {
  return <Home />;
}

// Home component redesigned to emulate a24.com's clean and modern aesthetic
function Home() {
  return (
    // Main container: full screen height, centered content, deep dark gradient background
    // The gradient provides subtle depth, similar to A24's often rich, dark backgrounds.
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-8
                    bg-gradient-to-br from-[#01374A] to-[#012A3D] font-inter text-white">

      {/* Main heading: Even larger, more impactful, and centered with generous vertical spacing.
          Font-black for maximum boldness, tracking-tight for a modern condensed feel. */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-24
                     text-[#72ADBF] text-center max-w-6xl leading-tight tracking-tight">
        ARE YOU READY TO PLAN A TRIP FOR YOU, YOUR FRIENDS, FAMILY, COWORKERS, OR ANYONE ELSE?
      </h1>

      {/* Buttons container: Simplified, sitting directly on the main background.
          Increased gap for more visual breathing room. */}
      <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-12">
        {/* Sign In button/link: Styled as a prominent text link with subtle hover effects.
            Uses the primary accent color for text, with a very subtle background highlight on hover,
            and a thin border for definition, aligning with A24's understated interactive elements. */}
        <a
          href="/signin"
          className="
            text-[#72ADBF] text-2xl sm:text-3xl font-semibold uppercase
            py-4 px-12 rounded-lg border border-[#72ADBF]
            hover:text-white hover:bg-[#0395A7] hover:bg-opacity-20
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[#72ADBF] focus:ring-opacity-75
            transform hover:scale-105
          "
        >
          SIGN IN
        </a>
        {/* Create Account button/link: Same styling for consistency. */}
        <a
          href="/signup"
          className="
            text-[#72ADBF] text-2xl sm:text-3xl font-semibold uppercase
            py-4 px-12 rounded-lg border border-[#72ADBF]
            hover:text-white hover:bg-[#0395A7] hover:bg-opacity-20
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[#72ADBF] focus:ring-opacity-75
            transform hover:scale-105
          "
        >
          CREATE ACCOUNT
        </a>
      </div>
    </div>
  );
}

export default App; // Export App as the default component
3