import { useState } from "react";

function Head() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <a href="/" className="text-xl font-bold text-gray-800">
          Made It Out
        </a>

        <div className="flex lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-gray-800 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <div className={`lg:flex space-x-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>
          <a href="#home" className="text-gray-700 hover:text-black font-medium">
            Home
          </a>
          <a href="#link" className="text-gray-700 hover:text-black font-medium">
            Link
          </a>

          <div className="relative group">
            <button className="text-gray-700 hover:text-black font-medium focus:outline-none">
              Dropdown
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-md mt-2 rounded z-10">
              <a href="#action/3.1" className="block px-4 py-2 text-sm hover:bg-gray-100">Action</a>
              <a href="#action/3.2" className="block px-4 py-2 text-sm hover:bg-gray-100">Another action</a>
              <a href="#action/3.3" className="block px-4 py-2 text-sm hover:bg-gray-100">Something</a>
              <div className="border-t my-1"></div>
              <a href="#action/3.4" className="block px-4 py-2 text-sm hover:bg-gray-100">Separated link</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Head;
