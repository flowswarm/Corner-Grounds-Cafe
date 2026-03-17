
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../data/menuData';

interface ProductModalProps {
  product: any; // Using any to be flexible with Clover data vs local data for now
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Normalize product data
  const basePrice = typeof product.price === 'number' ? product.price / 100 : product.basePrice || 0;
  const displayPrice = typeof product.price === 'number' ? `$${(product.price / 100).toFixed(2)}` : product.price;

  const handleAddToCart = () => {
    // Map to MenuItem structure
    const item: MenuItem = {
      id: product.id,
      name: product.name,
      image: product.image || '/images/placeholder.jpg', // Fallback
      price: displayPrice,
      basePrice: basePrice,
      description: product.description,
      type: 'food' // Default
    };

    addToCart(item, { notes }, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-forest/95 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-forest w-full max-w-5xl grid md:grid-cols-2 overflow-hidden animate-fade-in border border-cornsilk/10 shadow-2xl rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-cornsilk/50 hover:text-cornsilk transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative group overflow-hidden bg-black flex items-center h-64 md:h-auto">
          <img
            src={product.image || '/menu3.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-125 cursor-zoom-in"
          />
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <span className="text-caramel font-bold uppercase tracking-widest text-xs mb-4">
            {product.category || 'Corner Grounds'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl mb-4 text-cornsilk">
            {product.name}
          </h2>
          <p className="text-2xl font-light mb-6 text-cornsilk/90">
            {displayPrice}
          </p>
          <div className="h-px w-24 bg-caramel/50 mb-6" />
          <p className="text-lg text-cornsilk/60 leading-relaxed font-light mb-8">
            {product.description}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-cornsilk/70 text-sm mb-2">Special Instructions</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-forest/50 border border-cornsilk/20 rounded p-3 text-cornsilk focus:outline-none focus:border-caramel"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-cornsilk/20 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-cornsilk hover:bg-white/5"
                >-</button>
                <span className="px-4 text-cornsilk font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-cornsilk hover:bg-white/5"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-cornsilk text-forest py-3 font-bold uppercase tracking-widest hover:bg-caramel hover:text-white transition-all duration-300 rounded"
              >
                Add to Order - ${(basePrice * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
