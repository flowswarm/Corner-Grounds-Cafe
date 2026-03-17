import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MENU_DATA } from '../data/menuData';

const MenuPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar isScrolled={true} />
            <div className="relative h-[40vh] bg-stone-900 overflow-hidden">
                <img
                    src="/Hero2.jpg"
                    alt="Menu"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-5xl md:text-6xl font-serif text-white tracking-wide">Our Menu</h1>
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="grid gap-16">
                    {MENU_DATA.map(category => (
                        <section key={category.id}>
                            <h2 className="text-3xl font-serif text-stone-800 mb-10 border-b border-stone-200 pb-4">{category.title}</h2>
                            {category.subcategories.map(sub => (
                                <div key={sub.title} className="mb-12">
                                    <h3 className="text-lg font-medium text-stone-600 mb-6 uppercase tracking-widest">{sub.title}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {sub.items.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
                                                onClick={() => navigate(`/menu/product/${item.id}`)}
                                            >
                                                <div className="h-48 overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-xl font-medium text-stone-900">{item.name}</h4>
                                                        <span className="text-stone-600 font-medium">{item.price}</span>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-stone-500 text-sm line-clamp-2">{item.description}</p>
                                                    )}
                                                    {item.calories && (
                                                        <p className="text-stone-400 text-xs mt-2">{item.calories}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MenuPage;


