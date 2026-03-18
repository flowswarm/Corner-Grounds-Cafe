
import React, { useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORY_VIDEOS = [
  '/Story1.MOV',
  '/whipcreamfacecgc.mp4',
];

const StorySection: React.FC = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    // Start the first video playing
    const first = videoRefs.current[0];
    if (first) {
      first.play().catch(() => {});
    }
  }, []);

  const handleVideoEnd = useCallback((endedIndex: number) => {
    const nextIdx = (endedIndex + 1) % STORY_VIDEOS.length;
    const nextVideo = videoRefs.current[nextIdx];
    const endedVideo = videoRefs.current[endedIndex];

    if (nextVideo) {
      // Reset next video to start and play it
      nextVideo.currentTime = 0;
      nextVideo.style.zIndex = '2';
      nextVideo.play().catch(() => {});
    }

    if (endedVideo) {
      // Push ended video behind
      endedVideo.style.zIndex = '1';
    }

    activeRef.current = nextIdx;
  }, []);

  return (
    <section id="about" className="py-12 sm:py-24 px-4 sm:px-6 bg-forest">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="relative group overflow-hidden aspect-[4/5]">
          {STORY_VIDEOS.map((src, i) => (
            <video
              key={src}
              ref={(el) => { videoRefs.current[i] = el; }}
              src={src}
              muted
              playsInline
              preload="auto"
              onEnded={() => handleVideoEnd(i)}
              style={{ zIndex: i === 0 ? 2 : 1 }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ))}
          <div className="absolute bottom-8 right-8 bg-forest/80 backdrop-blur-md p-6 border border-cornsilk/10 hidden md:block z-[3]">
            <p className="font-serif italic text-2xl text-caramel">"The aroma defines our space."</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-caramel font-medium tracking-[0.2em] uppercase text-sm">Established in 2023</span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl leading-tight text-cornsilk">
              A Corner Dedicated to <br />
              <span className="italic">Excellence.</span>
            </h2>
          </div>

          <p className="text-base sm:text-lg text-cornsilk/60 leading-relaxed font-light">
            Located in the historic heart of Odessa, Delaware, Corner Grounds Cafe isn't just a place to grab a coffee. It's a sanctuary for creators, a meeting spot for neighbors, and a destination for those who appreciate the finer details of bean and brew.
          </p>

          <p className="text-base sm:text-lg text-cornsilk/60 leading-relaxed font-light">
            Our mission is simple: high-conversion flavors served in an environment that inspires. We source exclusively from sustainable growers, ensuring every cup reflects our commitment to the earth and the craft.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8">
            <div>
              <p className="text-4xl font-serif text-caramel mb-2">100%</p>
              <p className="text-xs uppercase tracking-widest text-cornsilk/40">Organic Beans</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-caramel mb-2">24/7</p>
              <p className="text-xs uppercase tracking-widest text-cornsilk/40">Freshly Roasted</p>
            </div>
          </div>

          <Link to="/about" className="group flex items-center space-x-4 text-sm font-bold uppercase tracking-widest text-cornsilk hover:text-caramel transition-colors">
            <span>Read Our Full Story</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-2 transition-transform">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
