
import React, { useState } from 'react';
import { Product } from '../types';

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vanilla Oat Milk Latte',
    category: 'Coffee',
    price: '$6.50',
    description: 'Double shot of espresso, house-made Madagascar vanilla syrup, and creamy oat milk.',
    image: 'https://images.unsplash.com/photo-1541167760496-162955ed8521?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '2',
    name: 'Ethiopian Single Origin',
    category: 'Brew',
    price: '$5.00',
    description: 'Light roast with notes of jasmine, bergamot, and sweet citrus.',
    image: 'https://images.unsplash.com/photo-1497933321188-941f9ad36b12?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '3',
    name: 'Matcha Green Tea Latte',
    category: 'Tea',
    price: '$6.00',
    description: 'Ceremonial grade matcha whisked with steamed milk of choice.',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '4',
    name: 'Artisan Avocado Toast',
    category: 'Bites',
    price: '$12.00',
    description: 'Sourdough, smashed avocado, chili flakes, microgreens, and a poached egg.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '5',
    name: 'Cold Brew Signature',
    category: 'Coffee',
    price: '$5.50',
    description: 'Steeped for 24 hours for a smooth, bold finish.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '6',
    name: 'Pistachio Croissant',
    category: 'Bites',
    price: '$7.00',
    description: 'Hand-laminated dough filled with house-made pistachio cream.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000'
  }
];

interface MenuSectionProps {
  onProductSelect: (product: Product) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ onProductSelect }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Coffee', 'Brew', 'Tea', 'Bites'];

  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <section id="menu" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-6xl mb-6">Our Menu</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm uppercase tracking-widest font-bold pb-2 border-b-2 transition-all duration-300 ${
                  activeCategory === cat ? 'border-amber-500 text-white' : 'border-transparent text-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="group cursor-pointer"
              onClick={() => onProductSelect(product)}
            >
              <div className="relative overflow-hidden aspect-square mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest">
                    Quick View
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="text-xl font-serif group-hover:text-amber-500 transition-colors">{product.name}</h3>
                </div>
                <p className="text-lg font-light">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
            <button className="px-12 py-5 border border-white/10 hover:border-amber-500 hover:bg-amber-500 transition-all duration-500 uppercase tracking-widest text-xs font-bold">
                Download Full Menu (PDF)
            </button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
