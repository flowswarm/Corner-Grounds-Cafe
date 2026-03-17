
import React from 'react';
import { Product } from '../types';

interface MenuSectionProps {
  onProductSelect: (product: Product) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ onProductSelect }) => {
  return (
    <section id="menu" className="py-0 bg-forest text-cornsilk">
      {/* Section 1: Seasonal Sips (Image Left, Text Right) */}
      <div className="grid md:grid-cols-2 min-h-[600px]">
        <div className="relative h-96 md:h-auto overflow-hidden group">
          <img
            src="/menu3.jpg"
            alt="Seasonal Coffee Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-cornsilk text-forest space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Seasonal Sips</h2>
          <p className="text-lg font-light leading-relaxed text-forest/80">
            Fall in love with our latest creations. From pumpkin spice infused with real spices to maple-pecan cold brews, every sip captures the essence of the season.
          </p>
          <button className="self-start px-8 py-3 bg-forest text-cornsilk font-bold uppercase tracking-widest text-sm hover:bg-caramel hover:text-black transition-all duration-300 rounded-full">
            View Seasonal Menu
          </button>
        </div>
      </div>

      {/* Section 2: Artisan Bakery (Text Left, Image Right) */}
      <div className="grid md:grid-cols-2 min-h-[600px]">
        <div className="order-2 md:order-1 flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-forest text-cornsilk space-y-6 border-t border-b border-cornsilk/5">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-caramel">Fresh from the Oven</h2>
          <p className="text-lg font-light leading-relaxed text-cornsilk/80">
            A new era of bakery. Six new crave-worthy treats have arrived, blending global inspiration and nostalgic flavors. Find them in our refreshed bakery case.
          </p>
          <button className="self-start px-8 py-3 bg-cornsilk text-forest font-bold uppercase tracking-widest text-sm hover:bg-caramel hover:text-black transition-all duration-300 rounded-full">
            Explore Bakery
          </button>
        </div>
        <div className="order-1 md:order-2 relative h-96 md:h-auto overflow-hidden group">
          <img
            src="/menu6.jpg"
            alt="Fresh Bagels and Pastries"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
      </div>

      {/* Section 3: Join the Club (Image Left, Text Right) */}
      <div className="grid md:grid-cols-2 min-h-[600px]">
        <div className="relative h-96 md:h-auto overflow-hidden group">
          <img
            src="/Aboutuswide.jpg"
            alt="Community Gathering"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-12 md:p-24 bg-olive text-cornsilk space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Join the Family</h2>
          <p className="text-lg font-light leading-relaxed text-cornsilk/90">
            More than just coffee. Join our rewards program to earn points on every order, get early access to new blends, and receive exclusive invites to our tasting events.
          </p>
          <button className="self-start px-8 py-3 bg-cornsilk text-forest font-bold uppercase tracking-widest text-sm hover:bg-forest hover:text-cornsilk transition-all duration-300 rounded-full">
            Join Rewards
          </button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
