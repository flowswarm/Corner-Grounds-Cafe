import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { items, isOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-forest border-l border-cornsilk/10 shadow-2xl z-[100] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-cornsilk/10">
                            <h2 className="text-2xl font-serif text-cornsilk flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-caramel" />
                                Your Order
                            </h2>
                            <button onClick={toggleCart} className="p-2 text-cornsilk/60 hover:text-caramel transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                    <ShoppingBag className="w-16 h-16 text-cornsilk/20" />
                                    <p className="text-cornsilk text-lg">Your cart is empty.</p>
                                    <button onClick={toggleCart} className="text-caramel underline hover:text-white">Start Ordering</button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.cartId} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-cornsilk/10">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-serif text-lg text-cornsilk truncate">{item.name}</h3>
                                                <span className="text-caramel font-medium">${item.totalPrice.toFixed(2)}</span>
                                            </div>

                                            {/* Options Summary */}
                                            <div className="text-xs text-cornsilk/60 mb-3 space-y-1">
                                                {Object.entries(item.selectedOptions).map(([key, value]) => {
                                                    // Only show interesting options (skip defaults/empty/no)
                                                    if (!value || value === 'None' || value === 'No' || value === false) return null;
                                                    // Format key for display
                                                    const label = key.replace(/_/g, ' ');
                                                    // Format value for display (boolean to 'Yes')
                                                    const displayValue = value === true ? 'Yes' : value;

                                                    return (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="capitalize">{label}:</span>
                                                            <span className="font-medium">{displayValue}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-forest/50 rounded-lg p-1 border border-cornsilk/10">
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, -1)}
                                                        className="w-6 h-6 flex items-center justify-center text-cornsilk/60 hover:text-caramel hover:bg-white/5 rounded"
                                                    >
                                                        {item.quantity === 1 ? <Trash2 className="w-3 h-3" onClick={() => removeFromCart(item.cartId)} /> : <Minus className="w-3 h-3" />}
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-cornsilk/60 hover:text-caramel hover:bg-white/5 rounded"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 bg-forest border-t border-cornsilk/10 space-y-4">
                                <div className="flex justify-between text-cornsilk/60">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-serif text-caramel">
                                    <span>Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        toggleCart();
                                        navigate('/checkout');
                                    }}
                                    className="w-full bg-caramel text-forest py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                    Review Order
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
