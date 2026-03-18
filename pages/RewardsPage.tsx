import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Star, Coffee, Sparkles, Crown, Zap, Heart, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TIERS = [
    {
        name: 'Bronze',
        icon: Coffee,
        pointsRequired: 0,
        color: 'from-amber-700 to-amber-900',
        borderColor: 'border-amber-700/30',
        perks: ['1 point per $1 spent', 'Birthday free drink', 'Member-only offers'],
    },
    {
        name: 'Silver',
        icon: Star,
        pointsRequired: 200,
        color: 'from-gray-400 to-gray-500',
        borderColor: 'border-gray-400/30',
        perks: ['1.5x points on all purchases', 'Free drink every 100 points', 'Early access to seasonal menu', 'Free size upgrades'],
    },
    {
        name: 'Gold',
        icon: Crown,
        pointsRequired: 500,
        color: 'from-caramel to-amber-600',
        borderColor: 'border-caramel/30',
        perks: ['2x points on all purchases', 'Free drink every 75 points', 'Exclusive tasting events', 'Free add-ons & customizations', 'Priority pickup'],
    },
];

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: Heart,
        title: 'Sign Up',
        description: 'Create your free Corner Grounds rewards account in seconds. No fees, no commitments.',
    },
    {
        step: '02',
        icon: Coffee,
        title: 'Earn Points',
        description: 'Earn 1 point for every $1 you spend. Points add up fast with bonus multipliers.',
    },
    {
        step: '03',
        icon: Gift,
        title: 'Get Rewards',
        description: 'Redeem your points for free drinks, food, and exclusive member-only experiences.',
    },
    {
        step: '04',
        icon: Zap,
        title: 'Level Up',
        description: 'Climb tiers to unlock premium perks like 2x points, free add-ons, and VIP events.',
    },
];

const PERKS_HIGHLIGHTS = [
    { icon: Gift, title: 'Free Birthday Drink', description: 'A complimentary drink of your choice during your birthday month.' },
    { icon: Sparkles, title: 'Bonus Point Days', description: 'Earn double or triple points on special promotional days.' },
    { icon: Star, title: 'Early Access', description: 'Be the first to try new seasonal drinks and limited-time offerings.' },
    { icon: Award, title: 'Exclusive Events', description: 'Get invited to members-only tasting events and barista workshops.' },
    { icon: Coffee, title: 'Free Refills', description: 'Gold members enjoy free drip coffee refills during their visit.' },
    { icon: Crown, title: 'Custom Orders', description: 'Gold tier unlocks free customizations — extra shots, alt milks, and more.' },
];

const RewardsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-forest text-cornsilk font-sans selection:bg-caramel selection:text-forest">
            <Navbar isScrolled={isScrolled} />

            {/* Hero */}
            <div className="relative h-[40vh] sm:h-[55vh] min-h-[350px] sm:min-h-[450px] overflow-hidden">
                <img
                    src="/Aboutuswide.jpg"
                    alt="Corner Grounds Community"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/70 to-forest/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-caramel font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Loyalty Program
                        <Crown className="w-4 h-4" />
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-cornsilk mb-4">
                        Corner Grounds <span className="italic text-caramel">Rewards</span>
                    </h1>
                    <p className="text-cornsilk/70 text-base sm:text-lg max-w-xl font-light leading-relaxed mb-8">
                        Join our family and earn points on every purchase. Free drinks, exclusive perks, and more await.
                    </p>
                    <button
                        onClick={() => {
                            const el = document.getElementById('sign-up');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-10 py-4 bg-caramel text-forest font-bold uppercase tracking-widest text-sm hover:bg-cornsilk transition-all duration-300 rounded-full shadow-lg hover:shadow-caramel/20"
                    >
                        Join Now — It's Free
                    </button>
                </div>
            </div>

            {/* Back nav */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-cornsilk/60 hover:text-caramel transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-widest">Back to Home</span>
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-20 sm:space-y-32">

                {/* ========== HOW IT WORKS ========== */}
                <section>
                    <div className="text-center mb-10 sm:mb-16 space-y-3">
                        <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs">Simple & Rewarding</span>
                        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                            How It <span className="text-caramel italic">Works</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {HOW_IT_WORKS.map((item) => (
                            <div key={item.step} className="relative group">
                                <div className="bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl p-8 hover:border-caramel/30 transition-all duration-500 h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-caramel/30 font-serif text-4xl font-bold">{item.step}</span>
                                        <div className="w-10 h-10 bg-caramel/20 rounded-full flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-caramel" />
                                        </div>
                                    </div>
                                    <h3 className="font-serif text-xl text-cornsilk mb-3 group-hover:text-caramel transition-colors">{item.title}</h3>
                                    <p className="text-cornsilk/60 text-sm font-light leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========== REWARDS TIERS ========== */}
                <section>
                    <div className="text-center mb-10 sm:mb-16 space-y-3">
                        <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs">Climb the Ranks</span>
                        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                            Rewards <span className="text-caramel italic">Tiers</span>
                        </h2>
                        <p className="text-cornsilk/60 text-base sm:text-lg font-light max-w-lg mx-auto">
                            The more you visit, the more you earn. Unlock new tiers for elevated perks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`group relative bg-white/5 backdrop-blur-sm border ${tier.borderColor} rounded-2xl overflow-hidden hover:border-caramel/40 transition-all duration-500`}
                            >
                                {/* Tier Header */}
                                <div className={`bg-gradient-to-r ${tier.color} p-6 sm:p-8`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <tier.icon className="w-8 h-8 text-white/90" />
                                            <div>
                                                <h3 className="font-serif text-2xl text-white">{tier.name}</h3>
                                                <p className="text-white/70 text-xs uppercase tracking-widest">
                                                    {tier.pointsRequired === 0 ? 'Starting Tier' : `${tier.pointsRequired}+ points`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Perks List */}
                                <div className="p-6 sm:p-8 space-y-4">
                                    {tier.perks.map((perk, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-caramel/20 flex items-center justify-center mt-0.5 shrink-0">
                                                <Star className="w-3 h-3 text-caramel" />
                                            </div>
                                            <span className="text-cornsilk/80 text-sm font-light">{perk}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========== PERKS HIGHLIGHTS ========== */}
                <section>
                    <div className="text-center mb-10 sm:mb-16 space-y-3">
                        <span className="text-caramel font-medium tracking-[0.2em] uppercase text-xs">Member Benefits</span>
                        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">
                            Exclusive <span className="text-caramel italic">Perks</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PERKS_HIGHLIGHTS.map((perk, i) => (
                            <div
                                key={i}
                                className="group bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl p-6 sm:p-8 hover:border-caramel/30 transition-all duration-500"
                            >
                                <div className="w-12 h-12 bg-caramel/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-caramel/30 transition-colors">
                                    <perk.icon className="w-6 h-6 text-caramel" />
                                </div>
                                <h3 className="font-serif text-xl text-cornsilk mb-2 group-hover:text-caramel transition-colors">{perk.title}</h3>
                                <p className="text-cornsilk/60 text-sm font-light leading-relaxed">{perk.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========== SIGN UP CTA ========== */}
                <section id="sign-up" className="scroll-mt-32">
                    <div className="bg-gradient-to-br from-olive/40 via-forest to-forest border border-cornsilk/10 rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
                        {/* Background Blurs */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-caramel/10 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/10 rounded-full blur-[120px] pointer-events-none" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <div className="w-16 h-16 bg-caramel/20 rounded-full flex items-center justify-center mx-auto">
                                <Crown className="w-8 h-8 text-caramel" />
                            </div>

                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cornsilk">
                                Ready to Join the <span className="italic text-caramel">Family</span>?
                            </h2>
                            <p className="text-cornsilk/70 text-base sm:text-lg font-light leading-relaxed max-w-lg mx-auto">
                                Sign up today and start earning points on your very first order. It's free, simple, and delicious.
                            </p>

                            <form
                                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert('Thank you for joining Corner Grounds Rewards! 🎉');
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-cornsilk/20 text-cornsilk placeholder-cornsilk/40 focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-colors text-sm"
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-caramel text-forest font-bold uppercase tracking-widest text-sm rounded-full hover:bg-cornsilk transition-all duration-300 shadow-lg whitespace-nowrap"
                                >
                                    Join Free
                                </button>
                            </form>

                            <p className="text-cornsilk/40 text-xs">
                                By joining, you agree to receive occasional emails about rewards and promotions. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default RewardsPage;
