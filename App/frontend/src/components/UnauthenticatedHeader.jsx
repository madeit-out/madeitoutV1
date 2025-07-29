import React from 'react';

export default function UnauthenticatedHeader() {
  return (
    <header className="bg-[#012A3D] text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-center relative">
        {/* Centered App Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#72ADBF] whitespace-nowrap">
            Made It Out
          </h1>
        </div>
      </div>
    </header>
  );
}
