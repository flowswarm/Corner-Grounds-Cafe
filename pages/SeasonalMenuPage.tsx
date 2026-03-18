import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Tag, Clock, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { DAILY_DEALS, WEEKLY_PROMOS, NEW_ITEMS } from '../data/seasonalMenuData';

const SeasonalMenuPage: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('daily-deals');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-forest text-cornsilk font-sans selection:bg-caramel selection:text-forest">
            <Navbar isScrolled={isScrolled} />

            {/* Hero Banner */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <img
                    src="/menu3.jpg"
                    alt="Seasonal Menu"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-caramel font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Limited Time Offerings
                        <Sparkles className="w-4 h-4" />
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-cornsilk mb-4">
                        Seasonal <span className="italic text-caramel">Menu</span>
                    </h1>
                    <p className="text-cornsilk/70 text-base sm:text-lg max-w-xl font-light leading-relaxed">
                        Discover our handcrafted seasonal specials, daily deals, and exciting new additions to our menu.
                    </p>
                </div>
            </div>

            {/* Sticky Navigation */}
            <div className="sticky top-[60px] sm:top-[72px] z-40 bg-forest/95 backdrop-blur-md border-b border-cornsilk/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-8 py-4 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-cornsilk/60 hover:text-caramel transition-colors mr-2 sm:mr-4 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm uppercase tracking-widest">Back</span>
                        </button>

                        <div className="w-px h-6 bg-cornsilk/10 shrink-0" />

                        {[
                            { id: 'daily-deals', label: 'Daily Deals', icon: Tag },
                            { id: 'weekly-promos', label: 'Weekly Promos', icon: Clock },
                            { id: 'new-items', label: 'New Items', icon: Star },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => scrollToSection(id)}
                                className={`flex items-center gap-2 text-sm font-medium uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full ${
                                    activeSection === id
                                        ? 'text-forest bg-caramel'
                                        : 'text-cornsilk/60 hover:text-caramel'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24 sm:space-y-32">
                {/* ========== DAILY DEALS ========== */}
                <section id="daily-deals" className="scroll-mt-40">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 gap-4">
                        <div className="space-y-3">
                            <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Don't Miss Out
                            </span>
                            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                                Daily <span className="text-caramel italic">Deals</span>
                            </h2>
                            <p className="text-cornsilk/60 text-base sm:text-lg font-light max-w-lg">
                                Handpicked specials refreshed every day. Grab yours before they're gone.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {DAILY_DEALS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/menu/product/${item.id}`)}
                                className="group flex flex-col bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl overflow-hidden hover:border-caramel/30 transition-all duration-500 cursor-pointer"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent opacity-60" />
                                    {item.tag && (
                                        <div className="absolute top-4 right-4 bg-caramel text-forest text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            {item.tag}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <h3 className="text-xl font-serif text-cornsilk mb-1 group-hover:text-caramel transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-cornsilk/50 text-sm font-light leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-3 border-t border-cornsilk/10">
                                        <span className="line-through text-cornsilk/30 text-sm">{item.originalPrice}</span>
                                        <span className="text-caramel text-xl font-bold">{item.dealPrice}</span>
                                    </div>
                                    {item.calories && (
                                        <p className="text-cornsilk/30 text-xs">{item.calories}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========== WEEKLY PROMOTIONS ========== */}
                <section id="weekly-promos" className="scroll-mt-40">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 gap-4">
                        <div className="space-y-3">
                            <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                This Week's Specials
                            </span>
                            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                                Weekly <span className="text-caramel italic">Promotions</span>
                            </h2>
                            <p className="text-cornsilk/60 text-base sm:text-lg font-light max-w-lg">
                                Exclusive weekly offers and bundles crafted for our community.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {WEEKLY_PROMOS.map((promo) => (
                            <div
                                key={promo.id}
                                className="group relative bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl overflow-hidden hover:border-caramel/30 transition-all duration-500"
                            >
                                <div className="relative h-56 sm:h-64 overflow-hidden">
                                    <img
                                        src={promo.image}
                                        alt={promo.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
                                    {promo.tag && (
                                        <div className="absolute top-4 left-4 bg-olive text-cornsilk text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                                            {promo.tag}
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl font-serif text-cornsilk group-hover:text-caramel transition-colors">
                                            {promo.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 space-y-4">
                                    <p className="text-cornsilk/70 font-light leading-relaxed">
                                        {promo.description}
                                    </p>
                                    <p className="text-cornsilk/40 text-sm leading-relaxed">
                                        {promo.details}
                                    </p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-cornsilk/10">
                                        <Clock className="w-3.5 h-3.5 text-caramel" />
                                        <span className="text-caramel text-xs font-medium uppercase tracking-widest">
                                            {promo.validThrough}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========== NEW ITEMS ========== */}
                <section id="new-items" className="scroll-mt-40">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 gap-4">
                        <div className="space-y-3">
                            <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Just Arrived
                            </span>
                            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                                New <span className="text-caramel italic">Additions</span>
                            </h2>
                            <p className="text-cornsilk/60 text-base sm:text-lg font-light max-w-lg">
                                Fresh flavors and exciting creations added to our seasonal lineup.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {NEW_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/menu/product/${item.id}`)}
                                className="group flex flex-col bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl overflow-hidden hover:border-caramel/30 transition-all duration-500 cursor-pointer"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent opacity-60" />
                                    {item.tag && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-caramel to-amber-500 text-forest text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                            <Sparkles className="w-3 h-3" />
                                            {item.tag}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-serif text-cornsilk mb-2 group-hover:text-caramel transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-cornsilk/60 font-light leading-relaxed text-sm sm:text-base">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-cornsilk/10">
                                        <span className="text-caramel text-lg font-bold">{item.price}</span>
                                        {item.calories && (
                                            <span className="text-cornsilk/30 text-xs">{item.calories}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default SeasonalMenuPage;
