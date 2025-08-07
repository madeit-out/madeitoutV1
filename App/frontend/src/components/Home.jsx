import React, { useState, useEffect } from "react";
import Family from "../images/family.png";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    "Real-time collaboration",
    "Intelligent itinerary management", 
    "Seamless expense tracking",
    "Professional trip coordination"
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with enhanced overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${Family})` }}
      />
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#E08544]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#416B6B]/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#F5F5DC]/5 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-16 px-8">
        <div className="text-center max-w-7xl mx-auto">
          {/* Animated logo/brand section */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E08544] to-[#416B6B] rounded-2xl mb-8 shadow-2xl">
              <span className="text-2xl font-black text-white">M</span>
            </div>
          </div>

          {/* Enhanced main heading with staggered animation */}
          <h1 className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 text-[#F5F5DC] leading-tight tracking-tight">
              Effortless Group Travel.
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#E08544] leading-tight tracking-tight">
              Finally.
            </span>
          </h1>

          {/* Enhanced description with fade-in animation */}
          <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-5xl mx-auto leading-relaxed font-light">
              <strong className="text-[#F5F5DC] font-semibold">Made It Out</strong>{" "}
              transforms chaotic group coordination into seamless travel
              experiences. Our comprehensive platform eliminates the frustration of
              endless message threads and scattered planning.
            </p>
          </div>

          {/* Animated value proposition */}
          <div className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              From concept to itinerary, we orchestrate every detail so you can
              focus on what matters most—
              <span className="text-[#E08544] font-medium">
                {" "}
                creating extraordinary memories together
              </span>
              .
            </p>
          </div>

          {/* Enhanced CTA button with hover effects */}
          <div className={`transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center mb-16">
              <a
                href="/signup"
                className="group relative overflow-hidden text-white text-xl sm:text-2xl font-semibold uppercase
                         py-4 px-10 rounded-xl border-2 border-[#E08544]/50
                         bg-gradient-to-r from-[#E08544] to-[#E08544]/90 hover:from-[#416B6B] hover:to-[#416B6B]/90
                         transition-all duration-500 ease-out
                         shadow-2xl hover:shadow-[#416B6B]/25 transform hover:scale-105 hover:-translate-y-1
                         focus:outline-none focus:ring-4 focus:ring-[#416B6B]/50 focus:ring-offset-2 focus:ring-offset-black/50
                         !no-underline backdrop-blur-sm"
              >
                <span className="relative z-10">Start Planning Today</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </a>
            </div>
          </div>

          {/* Animated feature highlights */}
          <div className={`transition-all duration-1000 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="pt-12 border-t border-gray-400/30">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
                  Trusted by travel enthusiasts worldwide • 
                  <span className="text-[#E08544] font-medium transition-all duration-500">
                    {" "}{features[currentFeature]}
                  </span>
                </p>
                
                {/* Feature indicators */}
                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        index === currentFeature 
                          ? 'bg-[#E08544] scale-125' 
                          : 'bg-gray-500/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-gray-400/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-[#E08544] rounded-full mt-2 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
