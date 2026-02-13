
import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070',
    title: 'SPECIALTY COFFEE IN THE HEART OF ODESSA',
    subtitle: 'Brewed with house-filtered organic beans, our drip coffee is rich, aromatic, and the perfect classic brew.'
  },
  {
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1974',
    title: 'WHERE EVERY CUP TELLS A STORY',
    subtitle: 'Step into a world of sensory delight, from the sound of grinding beans to the first warm sip of excellence.'
  },
  {
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=2070',
    title: 'CRAFTING MOMENTS SINCE 2023',
    subtitle: 'At Corner Grounds, we believe in community, craftsmanship, and the perfect atmosphere to create.'
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Zoom Effect */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ${
              index === current ? 'scale-110' : 'scale-100'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl px-6 text-center text-white">
              <div className="flex justify-center mb-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img 
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white/20" 
                      src={`https://picsum.photos/seed/${i + 50}/100/100`} 
                      alt="User" 
                    />
                  ))}
                  <div className="bg-amber-600 w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold">
                    125k+
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium tracking-widest text-white/80 flex items-center">
                  ACTIVE CUSTOMERS
                </span>
              </div>
              
              <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight animate-fade-up">
                {slide.title}
              </h1>
              
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-amber-500 hover:text-white transition-all duration-300 rounded-none">
                  Order Online
                </button>
                <button className="w-full sm:w-auto px-10 py-5 border border-white/40 text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300 rounded-none">
                  Our Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-500 ${
              i === current ? 'w-12 bg-white' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
