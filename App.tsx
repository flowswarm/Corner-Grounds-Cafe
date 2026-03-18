
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';

import Gallery from './components/Gallery';
import MenuSection from './components/MenuSection';
import StorySection from './components/StorySection';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import { Product } from './types';

import { FeaturedHighlights } from './components/FeaturedHighlights';
import LogoCloud from './components/LogoCloud';
import AboutPage from './components/AboutPage';
import MenuPage from './pages/MenuPage';
import ProductPage from './components/ProductPage';
import AdminConnectPage from './pages/AdminConnectPage';
import AdminEmailPage from './pages/AdminEmailPage';

import BestsellersSection from './components/BestsellersSection';

const HIGHLIGHT_ITEMS = [
  { id: 1, title: 'Artisan Coffee', image: '/gallery0.jpg', alt: 'Latte Art' },
  { id: 2, title: 'Fresh Pastries', image: '/gallery18.jpg', alt: 'Croissants' },
  { id: 3, title: 'Cozy Vibes', image: '/gallery1.jpg', alt: 'Interior' },
  { id: 4, title: 'Daily Brew', image: '/gallery3.jpg', alt: 'Pour over' },
];

const Home: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar isScrolled={isScrolled} />
      <main>
        <HeroSlider />
        <BestsellersSection />
        <FeaturedHighlights items={HIGHLIGHT_ITEMS} />
        <StorySection />
        <MenuSection onProductSelect={setSelectedProduct} />
        <LogoCloud />
        <Gallery />
      </main>
      <Footer />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './pages/CheckoutPage';
import AdminLoginPage from './pages/AdminLoginPage';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen selection:bg-copper selection:text-cornsilk bg-forest text-cornsilk">
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/connect-clover" element={<AdminConnectPage />} />
            <Route path="/admin/email" element={<AdminEmailPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
