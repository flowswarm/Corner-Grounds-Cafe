import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GradualSpacing } from './GradualSpacing';

const SLIDES = [
  {
    image: '/Hero3.jpg',
    title: 'THE ART OF COFFEE',
    subtitle: ' Experience the perfect blend of tradition and innovation in every cup.'
  },
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
    <div className="relative h-screen w-full overflow-hidden bg-forest">
      {/* Background Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Background Image with Zoom Effect */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ${index === current ? 'scale-110' : 'scale-100'
              }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
        </div>
      ))}

      {/* Static Overlay Content (Title & Cafe) */}
      <div className="absolute inset-0 flex items-center justify-center pt-24 md:pt-24 pb-8 sm:pb-12 pointer-events-none">
        <div className="max-w-4xl px-4 sm:px-6 text-center text-cornsilk">
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-auto">
            {/* Animated Title */}
            <div className="mb-[-10px] sm:mb-[-20px] md:mb-[-40px] z-10 relative">
              <GradualSpacing
                text="Corner Grounds"
                className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-widest uppercase"
              />
            </div>

            {/* Animated Café */}
            <div className="z-0 relative">
              <GradualSpacing
                text="Cafe"
                className="font-script text-[5rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none text-caramel opacity-90 drop-shadow-lg transform -rotate-6 mix-blend-screen"
                framerProps={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
              />
            </div>

            <div className="w-16 sm:w-24 h-1 bg-caramel/80 mt-4 sm:mt-8 mb-4 sm:mb-8"></div>

            {/* Dynamic Subtitle */}
            <div className="h-16 sm:h-24 md:h-20 flex items-center justify-center mb-6 sm:mb-10">
              {SLIDES.map((slide, index) => (
                <p
                  key={index}
                  className={`absolute text-sm sm:text-lg md:text-xl text-cornsilk/90 font-light tracking-wide max-w-xs sm:max-w-lg mx-auto italic transition-opacity duration-1000 px-2 ${index === current ? 'opacity-100' : 'opacity-0'}`}
                >
                  {slide.subtitle}
                </p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <Link to="/menu" className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-5 bg-cornsilk text-forest font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-caramel hover:text-white transition-all duration-300 rounded-none cursor-pointer text-center">
                Order Online
              </Link>
              <Link to="/menu" className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-5 border border-cornsilk/40 text-cornsilk font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-cornsilk hover:text-forest transition-all duration-300 rounded-none cursor-pointer text-center">
                Our Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
