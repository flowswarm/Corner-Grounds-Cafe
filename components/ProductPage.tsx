import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getProductById, MenuItem, CustomizationCategory, SizeOption } from '../data/menuData';
import { useCart } from '../context/CartContext';
import CustomizationTile from './CustomizationTile';

interface SelectedValue {
    option: string;
    quantity?: number;
}

const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<MenuItem | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [customizations, setCustomizations] = useState<Record<string, SelectedValue | null>>({});
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
                        setCustomizations(cartItem.selectedOptions || {});
                        setSelectedSize(cartItem.selectedOptions?.__size?.option || foundProduct.sizes?.[1]?.label || '');
                        return;
                    }
                }

                // Load defaults
                const defaults: Record<string, SelectedValue | null> = {};
                // Set default size (Medium)
                if (foundProduct.sizes && foundProduct.sizes.length > 1) {
                    setSelectedSize(foundProduct.sizes[1].label); // Medium is index 1
                } else if (foundProduct.sizes && foundProduct.sizes.length > 0) {
                    setSelectedSize(foundProduct.sizes[0].label);
                }

                // Set defaults from customization tiles
                foundProduct.customizations?.forEach(category => {
                    category.items.forEach(tile => {
                        if (tile.default) {
                            defaults[tile.id] = { option: tile.default };
                        }
                        if (tile.type === 'counter' && tile.defaultQuantity !== undefined && tile.defaultQuantity > 0) {
                            defaults[tile.id] = { option: tile.label, quantity: tile.defaultQuantity };
                        }
                    });
                });
                setCustomizations(defaults);
            }
        }
    }, [id, editCartId, items]);

    const handleTileChange = (tileId: string, value: SelectedValue | null) => {
        setCustomizations(prev => {
            const updated = { ...prev };
            if (value === null) {
                delete updated[tileId];
            } else {
                updated[tileId] = value;
            }
            return updated;
        });
    };

    const handleAction = () => {
        if (!product) return;

        // Include size in the customizations
        const finalCustomizations: Record<string, any> = { ...customizations };
        if (selectedSize) {
            finalCustomizations.__size = { option: selectedSize };
        }

        if (editCartId) {
            updateItem(editCartId, finalCustomizations);
            navigate('/checkout');
        } else {
            addToCart(product, finalCustomizations, 1);
        }
    };

    // Count active customizations
    const activeCustomizationCount = Object.keys(customizations).length;

    // Get defaults summary for the "What's included" section
    const getDefaultsSummary = (): string[] => {
        const summary: string[] = [];
        product?.customizations?.forEach(category => {
            category.items.forEach(tile => {
                if (tile.default) {
                    summary.push(tile.default);
                }
                if (tile.type === 'counter' && tile.defaultQuantity && tile.defaultQuantity > 0) {
                    summary.push(`${tile.defaultQuantity} ${tile.label}`);
                }
            });
        });
        return summary;
    };

    if (!product) return <div className="min-h-screen bg-forest flex items-center justify-center text-cornsilk">Loading...</div>;

    const currentSize = product.sizes?.find(s => s.label === selectedSize);

    return (
        <div className="min-h-screen bg-forest font-sans selection:bg-caramel selection:text-forest">
            <Navbar isScrolled={isScrolled} />

            <div className="relative pt-24 pb-32">
                {/* ── Product Hero ─────────────────────────────────────────────── */}
                <div className="bg-forest pt-8 pb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-caramel/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative aspect-square rounded-full overflow-hidden border-4 border-cornsilk/5 shadow-2xl max-w-[400px] mx-auto md:mx-0"
                        >
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Link
                                to={product.id.startsWith('deal-') || product.id.startsWith('new-') ? '/seasonal-menu' : '/menu'}
                                className="inline-flex items-center text-cornsilk/60 hover:text-caramel transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {product.id.startsWith('deal-') || product.id.startsWith('new-') ? 'Back to seasonal menu' : 'Back to menu'}
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

                            {currentSize && (
                                <p className="text-cornsilk/50 text-sm">{currentSize.label} · {currentSize.oz}</p>
                            )}

                            <p className="text-lg text-cornsilk/80 font-light leading-relaxed max-w-md">
                                {product.description}
                            </p>

                            {/* ── Size Selector Pills ───────────────────────────────── */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-cornsilk/50 uppercase tracking-[0.15em]">Size</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size.label}
                                                onClick={() => setSelectedSize(size.label)}
                                                className={`product-size-pill ${selectedSize === size.label ? 'product-size-pill--active' : ''}`}
                                            >
                                                <span className="product-size-pill__name">{size.label}</span>
                                                <span className="product-size-pill__oz">{size.oz}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* ── Phase Toggle & Customization Area ────────────────────────── */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4 relative z-20">
                    <AnimatePresence mode="wait">
                        {!isCustomizing ? (
                            /* ── Phase 1: Overview ────────────────────── */
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="product-overview-panel"
                            >
                                {/* What's Included */}
                                {getDefaultsSummary().length > 0 && (
                                    <div className="product-overview-panel__section">
                                        <h3 className="product-overview-panel__section-title">What's included</h3>
                                        <div className="product-overview-panel__defaults">
                                            {getDefaultsSummary().map((item, i) => (
                                                <span key={i} className="product-overview-panel__default-tag">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Customize Button */}
                                {product.customizations && product.customizations.length > 0 && (
                                    <button
                                        className="product-customize-btn"
                                        onClick={() => {
                                            setIsCustomizing(true);
                                            setTimeout(() => {
                                                window.scrollTo({ top: 500, behavior: 'smooth' });
                                            }, 100);
                                        }}
                                    >
                                        <SlidersHorizontal className="w-5 h-5" />
                                        <span>Customize</span>
                                        {activeCustomizationCount > 0 && (
                                            <span className="product-customize-btn__badge">{activeCustomizationCount}</span>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            /* ── Phase 2: Full Customization Grid ─────── */
                            <motion.div
                                key="customization"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="product-customization-panel"
                            >
                                {/* Done Customizing Header */}
                                <button
                                    className="product-done-btn"
                                    onClick={() => setIsCustomizing(false)}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Done customizing</span>
                                </button>

                                {/* Customization Grid */}
                                <div className="product-customization-grid">
                                    {product.customizations?.map((category) => (
                                        <div key={category.id} className="product-customization-category">
                                            <div className="product-customization-category__header">
                                                <h3 className="product-customization-category__title">{category.title}</h3>
                                                <div className="product-customization-category__accent" />
                                            </div>
                                            <div className="product-customization-category__tiles">
                                                {category.items.map((tile) => (
                                                    <CustomizationTile
                                                        key={tile.id}
                                                        tile={tile}
                                                        value={customizations[tile.id] || undefined}
                                                        onChange={handleTileChange}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Sticky Add to Order Footer ───────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 bg-forest/95 backdrop-blur-lg border-t border-cornsilk/10 p-4 sm:p-6 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="hidden md:block">
                        <h3 className="text-cornsilk font-serif text-xl">{product.name}</h3>
                        <p className="text-caramel font-medium">
                            {selectedSize && <span className="text-cornsilk/40 mr-2">{selectedSize} ·</span>}
                            ${product.basePrice.toFixed(2)}
                        </p>
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
