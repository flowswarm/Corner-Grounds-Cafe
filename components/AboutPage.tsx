
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, useScroll, useTransform } from 'framer-motion';

const AboutPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen bg-forest text-cornsilk selection:bg-copper selection:text-cornsilk">
      <Navbar isScrolled={true} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0">
            <motion.div style={{ y }} className="w-full h-[120%] -mt-[10%]">
              <img
                src="/Aboutuswide.jpg"
                alt="Coffee Shop Vibe"
                className="w-full h-full object-cover opacity-60"
              />
            </motion.div>
            <div className="absolute inset-0 bg-forest/40 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 text-center space-y-4 px-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-6xl md:text-8xl text-cornsilk"
            >
              Our Story
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-light tracking-[0.2em] text-caramel uppercase"
            >
              Passion • Community • Craft
            </motion.p>
          </div>
        </section>

        {/* Owner Spotlight */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1 space-y-8"
            >
              <h2 className="font-serif text-4xl md:text-5xl text-caramel">
                Meet the Founder
              </h2>
              <div className="w-20 h-1 bg-copper/30" />
              <p className="text-lg font-light leading-relaxed text-cornsilk/80">
                "Corner Grounds Cafe started with a simple idea: to create a space that feels like an extension of your own living room, but with better coffee. For me, it's never been just about the beans—though we obsess over those too. It's about the people who drink them."
              </p>
              <p className="text-lg font-light leading-relaxed text-cornsilk/80">
                We believe in slow coffee for fast lives. Taking a moment to appreciate the craft, the aroma, and the connection.
              </p>
              <div>
                <p className="font-serif text-2xl text-caramel">Kevin Taisey</p>
                <p className="uppercase tracking-widest text-xs opacity-60 mt-1">Owner & Head Barista</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2 relative"
            >
              <div className="absolute inset-0 border border-caramel translate-x-4 translate-y-4" />
              <img
                src="/Owner.jpg"
                alt="Owner of Corner Grounds Cafe"
                className="relative z-10 w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-black/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Image 1 */}
              <div className="relative h-96 group overflow-hidden">
                <img
                  src="/gallery1.jpg"
                  alt="Craft"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-forest/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6 text-center">
                  <div>
                    <h3 className="font-serif text-3xl text-caramel mb-4">Craft</h3>
                    <p className="font-light text-sm">Artistry in every cup.</p>
                  </div>
                </div>
              </div>

              {/* Values Text */}
              <div className="flex flex-col justify-center space-y-12 p-8 border border-cornsilk/10">
                <div className="space-y-4 text-center">
                  <h3 className="font-serif text-3xl text-caramel">Quality</h3>
                  <p className="font-light text-cornsilk/70">
                    Sourced from the best ethical farms, roasted with precision.
                  </p>
                </div>
                <div className="w-full h-px bg-cornsilk/10" />
                <div className="space-y-4 text-center">
                  <h3 className="font-serif text-3xl text-caramel">Sustainability</h3>
                  <p className="font-light text-cornsilk/70">
                    Committed to zero waste and eco-friendly practices.
                  </p>
                </div>
              </div>

              {/* Image 2 */}
              <div className="relative h-96 group overflow-hidden">
                <img
                  src="/gallery3.jpg"
                  alt="Community"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-forest/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6 text-center">
                  <div>
                    <h3 className="font-serif text-3xl text-caramel mb-4">Community</h3>
                    <p className="font-light text-sm">A gathering place for all.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
