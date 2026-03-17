
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  const location = useLocation();
  const { toggleCart, cartCount } = useCart();
  const isHome = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollToSection = (id: string) => {
    if (isHome) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-forest/95 backdrop-blur-md py-3 border-b border-cornsilk/10 shadow-lg' : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo (Left Aligned) */}
          <Link to="/" className="flex flex-col items-center group cursor-pointer mr-auto">
            <div className="relative w-auto h-12 sm:h-16 md:h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img src="/logo.png" alt="Corner Grounds Cafe" className="h-full w-auto object-contain drop-shadow-md rounded-full" />
            </div>
          </Link>

          {/* Navigation Links (Right Aligned — Desktop) */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest text-cornsilk">
            <Link to="/" className="hover:text-caramel transition-colors">Home</Link>
            <Link to="/about" className="hover:text-caramel transition-colors">About Us</Link>
            <Link to="/menu" className="hover:text-caramel transition-colors uppercase">Menu</Link>
            <Link to="/menu" className="bg-cornsilk text-forest px-6 py-2 rounded-full font-bold hover:bg-caramel hover:text-black transition-all duration-300">
              Order Now
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 text-cornsilk hover:text-caramel transition-colors group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-caramel text-forest text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Cart & Menu Toggle */}
          <div className="md:hidden ml-4 flex items-center gap-4">
            <button
              onClick={toggleCart}
              className="relative text-cornsilk hover:text-caramel"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-caramel text-forest text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="text-cornsilk" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay & Drawer */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-forest border-l border-cornsilk/10 z-[95] transform transition-transform duration-300 ease-out md:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-cornsilk/10">
          <span className="font-serif text-xl text-cornsilk">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-cornsilk/60 hover:text-caramel transition-colors" aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col p-6 space-y-6">
          <Link to="/" className="text-lg font-medium uppercase tracking-widest text-cornsilk hover:text-caramel transition-colors">Home</Link>
          <Link to="/about" className="text-lg font-medium uppercase tracking-widest text-cornsilk hover:text-caramel transition-colors">About Us</Link>
          <Link to="/menu" className="text-lg font-medium uppercase tracking-widest text-cornsilk hover:text-caramel transition-colors">Menu</Link>
          <div className="pt-4 border-t border-cornsilk/10">
            <Link to="/menu" className="block text-center bg-cornsilk text-forest px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-caramel hover:text-black transition-all duration-300">
              Order Now
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
