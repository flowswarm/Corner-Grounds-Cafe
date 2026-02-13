
import React from 'react';

interface NavbarProps {
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md py-3 border-b border-white/10' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Navigation Links Left */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
          <a href="#home" className="hover:text-amber-500 transition-colors">Home</a>
          <a href="#about" className="hover:text-amber-500 transition-colors">About Us</a>
        </div>

        {/* Logo (Client's Logo Representation) */}
        <div className="flex flex-col items-center group cursor-pointer">
           <div className="relative w-16 h-16 md:w-20 md:h-20 bg-amber-900/20 rounded-full border border-amber-800/30 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <div className="text-center">
                <p className="text-[10px] leading-tight font-bold text-amber-500">CORNER</p>
                <p className="font-serif italic text-xl leading-none">Cafe</p>
                <p className="text-[8px] tracking-[0.2em]">GROUNDS</p>
              </div>
           </div>
        </div>

        {/* Navigation Links Right */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
          <a href="#menu" className="hover:text-amber-500 transition-colors">Menu</a>
          <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-amber-500 hover:text-white transition-all duration-300">
            Order Now
          </button>
        </div>

        {/* Mobile Menu Toggle (Simplified) */}
        <div className="md:hidden">
           <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
           </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
