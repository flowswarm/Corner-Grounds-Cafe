import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Define Data Structure (Expanded for Full Menu)
// Define Data Structure (Expanded for Full Menu)
import { MENU_DATA } from '../data/menuData';

const MenuPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('drinks');
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate(); // Import useNavigate

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Hash Scrolling
    React.useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            // Check if element exists on page (category) or if we need to navigate to product
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-4', 'ring-caramel', 'rounded-xl');
                    setTimeout(() => element.classList.remove('ring-4', 'ring-caramel', 'rounded-xl'), 2000);
                }, 100);
            }
        }
    }, [location]);

    const scrollToSection = (id: string) => {
        setActiveCategory(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleItemClick = (itemId: string) => {
        navigate(`/menu/product/${itemId}`);
    };

    return (
        <div className="min-h-screen bg-forest text-cornsilk font-sans selection:bg-caramel selection:text-forest">
            <Navbar isScrolled={isScrolled} />

            <div className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-12">

                {/* Sidebar Navigation - Sticky */}
                <aside className="w-full md:w-64 flex-shrink-0 relative">
                    <div className="sticky top-32 space-y-8">
                        <h1 className="font-serif text-3xl text-cornsilk mb-8">Menu</h1>

                        <nav className="space-y-4">
                            {MENU_DATA.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => scrollToSection(category.id)}
                                    className={`block w-full text-left text-lg font-medium transition-colors hover:text-caramel ${activeCategory === category.id ? 'text-caramel' : 'text-cornsilk/60'
                                        }`}
                                >
                                    {category.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-24">
                    {MENU_DATA.map((category) => (
                        <section key={category.id} id={category.id} className="scroll-mt-32">
                            <h2 className="font-serif text-4xl mb-12 pb-4 border-b border-cornsilk/10">{category.title}</h2>

                            <div className="space-y-16">
                                {category.subcategories.map((sub, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-2xl font-bold mb-8 text-cornsilk/80">{sub.title}</h3>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                                            {sub.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    id={item.id}
                                                    onClick={() => handleItemClick(item.id)}
                                                    className="group flex flex-col items-center text-center cursor-pointer p-4 transition-all duration-300"
                                                >
                                                    {/* Circular Image */}
                                                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-caramel/50 transition-all duration-300">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                                        {/* Add Button Overlay */}
                                                        <div className="absolute bottom-4 right-4 bg-forest text-cornsilk p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                                            <ShoppingBag size={16} />
                                                        </div>
                                                    </div>

                                                    <h4 className="font-medium text-lg text-cornsilk group-hover:text-caramel transition-colors">{item.name}</h4>
                                                    <span className="text-sm text-cornsilk/60 mt-1">{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default MenuPage;
