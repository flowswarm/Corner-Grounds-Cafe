import React from 'react';
import { motion } from 'framer-motion';

type GalleryItemType =
    | { type: 'image'; src: string; alt: string; span?: string }
    | { type: 'text'; title: string; text: string; bgColor: string; textColor: string; span?: string };

const GALLERY_ITEMS: GalleryItemType[] = [
    // ROW 1 flow
    { type: 'image', src: '/gallery1.jpg', alt: 'Gallery 1' },
    { type: 'image', src: '/gallery2.jpg', alt: 'Gallery 2' },
    {
        type: 'text',
        title: 'Ethically Sourced',
        text: 'We partner directly with farmers to ensure fair wages and sustainable practices.',
        bgColor: 'bg-transparent',
        textColor: 'text-cornsilk'
    },
    { type: 'image', src: '/gallery3.jpg', alt: 'Gallery 3' },
    { type: 'image', src: '/gallery4.jpg', alt: 'Gallery 4' },
    { type: 'image', src: '/gallery5.jpg', alt: 'Gallery 5' },
    {
        type: 'text',
        title: 'Community First',
        text: 'A gathering place for creatives, dreamers, and friends.',
        bgColor: 'bg-caramel',
        textColor: 'text-cornsilk'
    },
    { type: 'image', src: '/gallery6.jpg', alt: 'Gallery 6' },
    { type: 'image', src: '/gallery7.jpg', alt: 'Gallery 7' },
    { type: 'image', src: '/gallery8.jpg', alt: 'Gallery 8' },
    { type: 'image', src: '/gallery9.jpg', alt: 'Gallery 9' },

    // ROW 2 flow (will wrap automatically in grid-flow-col, but ordered for logic)
    { type: 'image', src: '/gallery10.jpg', alt: 'Gallery 10' },
    {
        type: 'text',
        title: 'Artisan Pastries',
        text: 'Baked fresh daily using local, seasonal ingredients.',
        bgColor: 'bg-olive',
        textColor: 'text-cornsilk'
    },
    { type: 'image', src: '/gallery11.jpg', alt: 'Gallery 11' },
    { type: 'image', src: '/gallery12.jpg', alt: 'Gallery 12' },
    { type: 'image', src: '/gallery13.jpg', alt: 'Gallery 13' },
    {
        type: 'text',
        title: 'Sustainable',
        text: 'Committed to zero waste and eco-friendly packaging.',
        bgColor: 'bg-transparent',
        textColor: 'text-cornsilk'
    },
    { type: 'image', src: '/gallery14.jpg', alt: 'Gallery 14' },
    { type: 'image', src: '/gallery15.jpg', alt: 'Gallery 15' },
    { type: 'image', src: '/gallery16.jpg', alt: 'Gallery 16' },
    { type: 'image', src: '/gallery17.jpg', alt: 'Gallery 17' },
    { type: 'image', src: '/gallery18.jpg', alt: 'Gallery 18' },
];

const HorizontalGallery: React.FC = () => {
    // 3 sets for smooth loop width
    const SCROLL_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS, ...GALLERY_ITEMS];

    return (
        <section className="bg-forest py-24 overflow-hidden relative border-t border-cornsilk/5">
            {/* Section Header */}
            <div className="max-w-[1400px] mx-auto px-6 mb-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
                <span className="text-cornsilk/40 font-mono text-sm mb-4 md:mb-0">004</span>
                <div className="text-right">
                    <h2 className="font-serif text-5xl md:text-7xl text-cornsilk mb-2">Discover our world</h2>
                </div>
            </div>

            <div className="relative w-full overflow-hidden mask-gradient-wide">
                <motion.div
                    className="flex gap-4"
                    animate={{ x: "-33.33%" }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 130
                    }}
                    style={{ width: "max-content" }}
                >
                    {/* 
                Grid Layout for the Items 
                Using grid-rows-2 to force 2 rows, and grid-flow-col to fill columns first.
                This creates the "strip" effect.
             */}
                    <div className="grid grid-rows-2 grid-flow-col gap-4">
                        {SCROLL_ITEMS.map((item, index) => (
                            <div
                                key={index}
                                className={`
                            relative overflow-hidden w-[280px] md:w-[350px] h-[280px] md:h-[350px]
                            ${item.type === 'text' && item.bgColor !== 'bg-transparent' ? 'p-8 flex flex-col justify-between' : ''}
                            ${item.type === 'text' && item.bgColor}
                        `}
                            >
                                {item.type === 'image' ? (
                                    <>
                                        <img
                                            src={item.src}
                                            alt={item.alt}
                                            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                                        />
                                        {/* Optional text overlay if desired, but inspiration is clean */}
                                    </>
                                ) : (
                                    <div className={`h-full flex flex-col justify-between ${item.bgColor === 'bg-transparent' ? 'justify-start pt-0' : ''}`}>
                                        {/* If transparent, it acts like the text block in inspiration next to image */}
                                        {item.bgColor === 'bg-transparent' ? (
                                            <div className="pr-4">
                                                <h3 className="font-serif text-3xl text-cornsilk mb-4 leading-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-cornsilk/80 leading-relaxed font-light">
                                                    {item.text}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-cornsilk/60 font-mono text-xs">{(index % 10) + 1}</span>
                                                <div>
                                                    <h3 className="font-serif text-2xl text-cornsilk mb-3 leading-tight">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-cornsilk/90 leading-relaxed font-light">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HorizontalGallery;
