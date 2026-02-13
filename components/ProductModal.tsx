
import React from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#0d0d0d] w-full max-w-5xl grid md:grid-cols-2 overflow-hidden animate-fade-in border border-white/10 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-white/50 hover:text-white transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative group overflow-hidden bg-black flex items-center">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-125 cursor-zoom-in"
          />
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4">
            {product.category}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            {product.name}
          </h2>
          <p className="text-2xl font-light mb-8 text-white/90">
            {product.price}
          </p>
          <div className="h-px w-24 bg-amber-500/50 mb-8" />
          <p className="text-lg text-white/60 leading-relaxed font-light mb-12">
            {product.description}
          </p>

          <div className="space-y-6">
            <button className="w-full bg-white text-black py-5 font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all duration-300">
              Add to Order
            </button>
            <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">
              Prepared fresh in our Odessa kitchen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
