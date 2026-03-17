import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getProductById, MenuItem } from '../data/menuData';
import { useCart } from '../context/CartContext';

// Customization Options Interfaces
interface OptionGroup {
    id: string;
    title: string;
    type: 'select' | 'counter' | 'boolean';
    options?: string[];
    default?: string | number | boolean;
}

const PRODUCT_OPTIONS: Record<string, OptionGroup[]> = {
    coffee: [
        { id: 'size', title: 'Size', type: 'select', options: ['Small (12oz)', 'Medium (16oz)', 'Large (20oz)'], default: 'Medium (16oz)' },
        { id: 'milk', title: 'Milk', type: 'select', options: ['Whole Milk', '2% Milk', 'Nonfat Milk', 'Oat Milk (+$0.80)', 'Almond Milk (+$0.80)', 'Breve (+$0.80)'], default: '2% Milk' },
        { id: 'esp_opt', title: 'Espresso Options', type: 'select', options: ['Signature Roast', 'Decaf', 'Blonde Roast'], default: 'Signature Roast' },
        { id: 'shots', title: 'Shots', type: 'counter', default: 2 },
        { id: 'flavors', title: 'Flavors (Syrups/Sauces)', type: 'select', options: ['None', 'Vanilla', 'Caramel', 'Hazelnut', 'Mocha', 'White Mocha'], default: 'None' },
        { id: 'toppings', title: 'Toppings', type: 'select', options: ['None', 'Whipped Cream', 'Caramel Drizzle', 'Mocha Drizzle', 'Cinnamon Powder'], default: 'None' },
        { id: 'cold_foam', title: 'Cold Foam', type: 'select', options: ['None', 'Vanilla Sweet Cream', 'Salted Caramel', 'Chocolate'], default: 'None' },
        { id: 'prep', title: 'Preparation', type: 'boolean', default: false } // e.g. Add Milk instead of water
    ],
    tea: [
        { id: 'size', title: 'Size', type: 'select', options: ['Small (12oz)', 'Medium (16oz)', 'Large (20oz)'], default: 'Medium (16oz)' },
        { id: 'milk', title: 'Milk', type: 'select', options: ['None', 'Whole Milk', '2% Milk', 'Oat Milk (+$0.80)', 'Almond Milk (+$0.80)'], default: '2% Milk' },
        { id: 'sweetener', title: 'Sweeteners', type: 'counter', default: 0 },
        { id: 'toppings', title: 'Toppings', type: 'select', options: ['None', 'Whipped Cream', 'Cinnamon Powder', 'Matcha Powder'], default: 'None' },
        { id: 'scoops', title: 'Matcha/Chai Scoops', type: 'counter', default: 3 }
    ],
    bagel: [
        { id: 'toasting', title: 'Toasting', type: 'select', options: ['Not Toasted', 'Lightly Toasted', 'Toasted', 'Double Toasted'], default: 'Toasted' },
        { id: 'spread', title: 'Spread', type: 'select', options: ['Butter', 'Cream Cheese', 'Peanut Butter', 'Strawberry Jam'], default: 'Butter' }
    ],
    food: [
        { id: 'warming', title: 'Warming', type: 'select', options: ['Warmed', 'Not Warmed'], default: 'Warmed' }
    ]
};

const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<MenuItem | null>(null);
    const [customizations, setCustomizations] = useState<Record<string, any>>({});
    const [isScrolled, setIsScrolled] = useState(false);
    const { addToCart, updateItem, items } = useCart();

    // Check if we are in edit mode
    const searchParams = new URLSearchParams(location.search);
    const editCartId = searchParams.get('edit');

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (id) {
            const foundProduct = getProductById(id);
            if (foundProduct) {
                setProduct(foundProduct);

                // If editing, load existing options
                if (editCartId) {
                    const cartItem = items.find(item => item.cartId === editCartId);
                    if (cartItem) {
                        setCustomizations(cartItem.selectedOptions);
                        return;
                    }
                }

                // Otherwise load defaults
                const defaults: Record<string, any> = {};
                const options = PRODUCT_OPTIONS[foundProduct.type] || [];
                options.forEach(opt => {
                    defaults[opt.id] = opt.default;
                });
                setCustomizations(defaults);
            }
        }
    }, [id, editCartId, items]);

    const handleAction = () => {
        if (!product) return;

        if (editCartId) {
            updateItem(editCartId, customizations);
            navigate('/checkout');
        } else {
            addToCart(product, customizations, 1);
        }
    };

    const handleOptionChange = (optionId: string, value: any) => {
        setCustomizations(prev => ({ ...prev, [optionId]: value }));
    };

    const renderOption = (option: OptionGroup) => {
        const currentValue = customizations[option.id];

        switch (option.type) {
            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={currentValue}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            className="w-full appearance-none bg-white border border-cornsilk/20 rounded-lg py-4 px-4 text-forest font-medium focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-colors cursor-pointer"
                        >
                            {option.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                    </div>
                );
            case 'counter':
                return (
                    <div className="flex items-center justify-between border border-cornsilk/20 rounded-lg p-2 bg-white">
                        <span className="px-4 font-medium text-forest">{option.title}</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleOptionChange(option.id, Math.max(0, Number(currentValue) - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-forest hover:bg-forest/10 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-lg text-forest">{currentValue}</span>
                            <button
                                onClick={() => handleOptionChange(option.id, Number(currentValue) + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-forest hover:bg-forest/10 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            case 'boolean': // Simplified select for boolean visual consistency
                return (
                    <div className="relative">
                        <select
                            value={currentValue ? 'Yes' : 'No'}
                            onChange={(e) => handleOptionChange(option.id, e.target.value === 'Yes')}
                            className="w-full appearance-none bg-white border border-cornsilk/20 rounded-lg py-4 px-4 text-forest font-medium outline-none focus:border-caramel"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50 pointer-events-none" />
                    </div>
                );
            default:
                return null;
        }
    };

    if (!product) return <div className="min-h-screen bg-forest flex items-center justify-center text-cornsilk">Loading...</div>;

    const options = PRODUCT_OPTIONS[product.type] || [];

    return (
        <div className="min-h-screen bg-forest font-sans selection:bg-caramel selection:text-forest">
            <Navbar isScrolled={isScrolled} />

            <div className="relative pt-24 pb-32">
                {/* Product Hero */}
                <div className="bg-forest pt-8 pb-16 relative overflow-hidden">
                    {/* Background Blurs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-caramel/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-square rounded-full overflow-hidden border-4 border-cornsilk/5 shadow-2xl"
                        >
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Breadcrumb / Back */}
                            <Link to="/menu" className="inline-flex items-center text-cornsilk/60 hover:text-caramel transition-colors mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back onto menu
                            </Link>

                            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cornsilk">{product.name}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl text-caramel font-serif">{product.price}</span>
                                {product.calories && (
                                    <span className="text-cornsilk/60 text-sm font-light border border-cornsilk/20 px-3 py-1 rounded-full">
                                        {product.calories}
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-cornsilk/80 font-light leading-relaxed max-w-md">
                                {product.description}
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Customization Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
                    <div className="bg-cornsilk/5 backdrop-blur-md border border-cornsilk/10 rounded-3xl p-4 sm:p-6 md:p-12 shadow-xl">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-cornsilk/10">
                            <span className="p-2 bg-caramel/20 rounded-lg text-caramel">
                                <ShoppingBag className="w-5 h-5" />
                            </span>
                            <h2 className="font-serif text-2xl text-cornsilk">Customize Your Order</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {options.map((option) => (
                                <div key={option.id} className="space-y-3">
                                    <label className="text-sm font-medium text-cornsilk/70 uppercase tracking-wider pl-1">
                                        {option.title}
                                    </label>
                                    {renderOption(option)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Add to Order Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-forest/95 backdrop-blur-lg border-t border-cornsilk/10 p-6 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="hidden md:block">
                        <h3 className="text-cornsilk font-serif text-xl">{product.name}</h3>
                        <p className="text-caramel font-medium"> Total: ${product.basePrice.toFixed(2)}</p>
                    </div>

                    <button
                        onClick={handleAction}
                        className="w-full md:w-auto bg-caramel text-forest px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg hover:shadow-caramel/20 flex items-center justify-center gap-3"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {editCartId ? 'Update Order' : 'Add to Order'}
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductPage;
