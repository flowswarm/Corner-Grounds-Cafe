
import React from 'react';

const StorySection: React.FC = () => {
  return (
    <section id="about" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="relative group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1000" 
            alt="The Atmosphere" 
            className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md p-6 border border-white/10 hidden md:block">
            <p className="font-serif italic text-2xl text-amber-500">"The aroma defines our space."</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-amber-500 font-medium tracking-[0.2em] uppercase text-sm">Established in 2023</span>
            <h2 className="font-serif text-5xl md:text-6xl leading-tight">
              A Corner Dedicated to <br />
              <span className="italic">Excellence.</span>
            </h2>
          </div>
          
          <p className="text-lg text-white/60 leading-relaxed font-light">
            Located in the historic heart of Odessa, Delaware, Corner Grounds Cafe isn't just a place to grab a coffee. It's a sanctuary for creators, a meeting spot for neighbors, and a destination for those who appreciate the finer details of bean and brew.
          </p>
          
          <p className="text-lg text-white/60 leading-relaxed font-light">
            Our mission is simple: high-conversion flavors served in an environment that inspires. We source exclusively from sustainable growers, ensuring every cup reflects our commitment to the earth and the craft.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <p className="text-4xl font-serif text-amber-500 mb-2">100%</p>
              <p className="text-xs uppercase tracking-widest text-white/40">Organic Beans</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-amber-500 mb-2">24/7</p>
              <p className="text-xs uppercase tracking-widest text-white/40">Freshly Roasted</p>
            </div>
          </div>

          <button className="group flex items-center space-x-4 text-sm font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
            <span>Read Our Full Story</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-2 transition-transform">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
