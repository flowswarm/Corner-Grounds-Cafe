import React, { useEffect, useState } from 'react';
import { getMenu } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';

const MenuPage: React.FC = () => {
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    useEffect(() => {
        // TODO: Get merchantId from context or global config
        const merchantId = 'TEST_MERCHANT_ID';

        getMenu(merchantId)
            .then(data => setMenu(data))
            .catch(err => {
                console.error(err);
                setError('Failed to load menu. Please make sure the cafe is connected to Clover.');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <Navbar isScrolled={true} />
            <div className="relative h-[40vh] bg-stone-900 overflow-hidden">
                <img
                    src="/images/menu-hero.jpg"
                    alt="Menu"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-5xl md:text-6xl font-serif text-white tracking-wide">Our Menu</h1>
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-16">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mx-auto"></div>
                        <p className="mt-4 text-stone-600">Loading fresh menu...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg text-center max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold mb-2">Oops!</h3>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid gap-12">
                        {menu.map((category: any) => (
                            <section key={category.id}>
                                <h2 className="text-3xl font-serif text-stone-800 mb-8 border-b border-stone-200 pb-4">{category.name}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {category.items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedProduct(item)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-medium text-stone-900">{item.name}</h3>
                                                <span className="text-stone-600 font-medium">
                                                    ${(item.price / 100).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-stone-500 text-sm line-clamp-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default MenuPage;
