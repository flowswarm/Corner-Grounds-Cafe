
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <div className="mb-8 flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full border border-amber-800/30 flex items-center justify-center">
                    <span className="font-serif italic text-lg text-amber-500">C</span>
                </div>
                <h3 className="font-serif text-3xl">Corner Grounds Cafe</h3>
            </div>
            <p className="text-white/40 max-w-sm font-light leading-relaxed mb-8">
              Brewing excellence and fostering community in Odessa, Delaware. Join us for a cup and stay for the story.
            </p>
            <div className="flex space-x-6">
              {['Instagram', 'Facebook', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-xs uppercase tracking-widest font-bold hover:text-amber-500 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-amber-500">Contact</h4>
            <ul className="space-y-4 text-white/50 font-light">
              <li>123 Historic Main St.</li>
              <li>Odessa, DE 19730</li>
              <li>+1 (302) 555-0199</li>
              <li>hello@cornergrounds.cafe</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 text-amber-500">Hours</h4>
            <ul className="space-y-4 text-white/50 font-light">
              <li>Mon — Fri: 7am — 6pm</li>
              <li>Sat: 8am — 8pm</li>
              <li>Sun: 8am — 4pm</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            © 2024 Corner Grounds Cafe. Designed by Your Agency.
          </p>
          <div className="flex space-x-8 text-[10px] text-white/30 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
