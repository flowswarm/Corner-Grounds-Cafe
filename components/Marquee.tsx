
import React from 'react';

const Marquee: React.FC = () => {
  const items = ['COFFEE', 'COMMUNITY', 'CONNECTION', 'OFFER', 'MENU', 'STORY', 'CULTURE'];
  
  return (
    <div className="bg-[#0b1611] border-y border-white/5 py-6 overflow-hidden select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-white font-bold text-xl md:text-2xl tracking-[0.3em] uppercase mx-12">
                  {item}
                </span>
                <span className="text-amber-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                  </svg>
                </span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
