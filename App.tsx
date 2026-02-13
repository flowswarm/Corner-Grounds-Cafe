
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSlider from './components/HeroSlider';
import Marquee from './components/Marquee';
import Gallery from './components/Gallery';
import MenuSection from './components/MenuSection';
import StorySection from './components/StorySection';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import { Product } from './types';

const App: React.FC = () => {
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
    <div className="min-h-screen selection:bg-amber-800 selection:text-white">
      <Navbar isScrolled={isScrolled} />
      
      <main>
        <HeroSlider />
        <Marquee />
        <StorySection />
        <MenuSection onProductSelect={setSelectedProduct} />
        <Gallery />
      </main>

      <Footer />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default App;
