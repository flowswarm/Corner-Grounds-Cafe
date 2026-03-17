import React, { useRef, useEffect, useCallback } from 'react';

type GalleryItemType =
    | { type: 'image'; src: string; alt: string; span?: string }
    | { type: 'text'; title: string; text: string; bgColor: string; textColor: string; span?: string };

const GALLERY_ITEMS: GalleryItemType[] = [
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

// --- Constants ---
const BASE_SPEED = 0.2;          // px per frame at 60fps (slow ambient scroll)
const VELOCITY_DECAY = 0.96;     // How quickly swipe velocity decays (closer to 1 = longer momentum)
const VELOCITY_LERP = 0.21;      // How quickly drag velocity ramps up (0–1, lower = more gradual)
const VELOCITY_THRESHOLD = 0.02; // Stop applying velocity below this

const HorizontalGallery: React.FC = () => {
    const SCROLL_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS, ...GALLERY_ITEMS];

    const stripRef = useRef<HTMLDivElement>(null);
    const scrollX = useRef(0);
    const rafId = useRef(0);
    const extraVelocity = useRef(0);

    // Pointer tracking
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const lastPointerX = useRef(0);
    const lastPointerTime = useRef(0);

    // ---- Animation loop ----
    const tick = useCallback(() => {
        // Apply extra velocity from swipe (decays toward 0)
        if (Math.abs(extraVelocity.current) > VELOCITY_THRESHOLD) {
            extraVelocity.current *= VELOCITY_DECAY;
        } else {
            extraVelocity.current = 0;
        }

        const speed = BASE_SPEED + extraVelocity.current;
        scrollX.current += speed;

        // Seamless loop: reset when we've scrolled past 1/3 of total content
        if (stripRef.current) {
            const oneThird = stripRef.current.scrollWidth / 3;
            if (scrollX.current >= oneThird) {
                scrollX.current -= oneThird;
            } else if (scrollX.current < 0) {
                scrollX.current += oneThird;
            }
            stripRef.current.style.transform = `translateX(${-scrollX.current}px)`;
        }

        rafId.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        rafId.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId.current);
    }, [tick]);

    // ---- Shared pointer helpers ----
    const onDragStart = useCallback((clientX: number) => {
        isDragging.current = true;
        dragStartX.current = clientX;
        lastPointerX.current = clientX;
        lastPointerTime.current = performance.now();
        extraVelocity.current = 0; // kill momentum while dragging
    }, []);

    const onDragMove = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        const dx = lastPointerX.current - clientX;
        const now = performance.now();
        const dt = Math.max(now - lastPointerTime.current, 1);

        // Directly shift the scroll position for responsive feel
        scrollX.current += dx;

        // Gradually blend toward the instantaneous velocity for a natural ramp
        const instantVelocity = (dx / dt) * 16;
        extraVelocity.current += (instantVelocity - extraVelocity.current) * VELOCITY_LERP;

        lastPointerX.current = clientX;
        lastPointerTime.current = now;
    }, []);

    const onDragEnd = useCallback(() => {
        isDragging.current = false;
        // extraVelocity is already set from the last move — it will decay naturally in the tick loop
    }, []);

    // ---- Mouse events (desktop) ----
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onDragStart(e.clientX);
    }, [onDragStart]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        onDragMove(e.clientX);
    }, [onDragMove]);

    const handleMouseUp = useCallback(() => {
        onDragEnd();
    }, [onDragEnd]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging.current) onDragEnd();
    }, [onDragEnd]);

    // ---- Touch events (mobile / tablet) ----
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        onDragStart(e.touches[0].clientX);
    }, [onDragStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        onDragMove(e.touches[0].clientX);
    }, [onDragMove]);

    const handleTouchEnd = useCallback(() => {
        onDragEnd();
    }, [onDragEnd]);



    return (
        <section className="bg-forest py-24 overflow-hidden relative border-t border-cornsilk/5">
            {/* Section Header */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
                <span className="text-cornsilk/40 font-mono text-sm mb-4 md:mb-0">004</span>
                <div className="text-right">
                    <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl text-cornsilk mb-2">Discover our world</h2>
                </div>
            </div>

            <div
                className="relative w-full overflow-hidden mask-gradient-wide select-none"
                style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={stripRef}
                    className="will-change-transform"
                    style={{ width: 'max-content' }}
                >
                    <div className="grid grid-rows-2 grid-flow-col gap-4">
                        {SCROLL_ITEMS.map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    relative overflow-hidden w-[200px] sm:w-[280px] md:w-[350px] h-[200px] sm:h-[280px] md:h-[350px]
                                    ${item.type === 'text' && item.bgColor !== 'bg-transparent' ? 'p-8 flex flex-col justify-between' : ''}
                                    ${item.type === 'text' && item.bgColor}
                                `}
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.src}
                                        alt={item.alt}
                                        className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 hover:scale-105 pointer-events-none"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className={`h-full flex flex-col justify-between ${item.bgColor === 'bg-transparent' ? 'justify-start pt-0' : ''}`}>
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
                </div>
            </div>
        </section>
    );
};

export default HorizontalGallery;
