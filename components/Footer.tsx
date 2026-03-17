
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-forest border-t border-cornsilk/5 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Hero3.jpg"
          alt="Footer Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/95 to-forest/80" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <div className="mb-8 flex items-center space-x-4">
              <div className="w-12 h-12 bg-cornsilk/10 rounded-full border border-cornsilk/20 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Corner Grounds Logo"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              <h3 className="font-serif text-3xl text-cornsilk">Corner Grounds Cafe</h3>
            </div>
            <p className="text-cornsilk/70 max-w-sm font-light leading-relaxed mb-8">
              Brewing excellence and fostering community in Odessa, Delaware. Join us for a cup and stay for the story.
            </p>
            <div className="flex space-x-6">
              {['Instagram', 'Facebook', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-xs uppercase tracking-widest font-bold text-cornsilk/60 hover:text-caramel transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-caramel">Contact</h4>
            <ul className="space-y-4 text-cornsilk/60 font-light">
              <li>123 Historic Main St.</li>
              <li>Odessa, DE 19730</li>
              <li>+1 (302) 555-0199</li>
              <li>hello@cornergrounds.cafe</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-caramel">Hours</h4>
            <ul className="space-y-4 text-cornsilk/60 font-light">
              <li>Mon — Fri: 7am — 6pm</li>
              <li>Sat: 8am — 8pm</li>
              <li>Sun: 8am — 4pm</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-cornsilk/10 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-[10px] text-cornsilk/40 uppercase tracking-widest">
            © 2024 Corner Grounds Cafe. Designed by Your Agency.
          </p>
          <div className="flex space-x-8 text-[10px] text-cornsilk/40 uppercase tracking-widest">
            <a href="#" className="hover:text-cornsilk transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cornsilk transition-colors">Terms of Service</a>
            <a href="/admin/login" className="hover:text-cornsilk transition-colors">Admin Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
