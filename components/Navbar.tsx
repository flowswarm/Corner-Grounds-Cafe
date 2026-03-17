
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  const location = useLocation();
  const { toggleCart, cartCount } = useCart();
  const isHome = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHome) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-forest/95 backdrop-blur-md py-3 border-b border-cornsilk/10 shadow-lg' : 'bg-transparent py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Navigation Links Left */}
        {/* Logo (Left Aligned) */}
        <Link to="/" className="flex flex-col items-center group cursor-pointer mr-auto">
          <div className="relative w-auto h-16 md:h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <img src="/logo.png" alt="Corner Grounds Cafe" className="h-full w-auto object-contain drop-shadow-md rounded-full" />
          </div>
        </Link>

        {/* Navigation Links (Right Aligned) */}
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
