
import React from 'react';

const Gallery: React.FC = () => {
  const images = [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1541167760496-162955ed8521?auto=format&fit=crop&q=80&w=1000'
  ];

  return (
    <section className="bg-black py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
             <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">Aesthetic</span>
             <h2 className="font-serif text-5xl md:text-7xl mt-4">Capturing <br />The Vibe.</h2>
          </div>
          <p className="max-w-md text-white/50 font-light">
            Every corner of Corner Grounds is designed for visual storytelling. From the lighting to the textures, it's a paradise for the senses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {images.map((url, i) => (
            <div key={i} className={`relative overflow-hidden group cursor-pointer ${i % 3 === 0 ? 'md:col-span-2 md:row-span-2 aspect-[16/10]' : 'aspect-square'}`}>
              <img 
                src={url} 
                alt={`Gallery ${i}`} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                 <span className="text-white border border-white/40 px-6 py-2 uppercase tracking-widest text-xs">View Large</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
