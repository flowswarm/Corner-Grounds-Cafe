import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Minus, Plus, Trash2, Pencil, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isWithinBusinessHours, getTodayHours, getNextOpenTime } from '../lib/businessHours';

const ReviewOrderPage: React.FC = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();
    const [pickupTime, setPickupTime] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [pickupError, setPickupError] = useState(false);

    // Generate pickup time slots
    useEffect(() => {
        const mockSlots: string[] = [];
        for (let h = 7; h < 18; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hour = h % 12 || 12;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const min = m.toString().padStart(2, '0');
                mockSlots.push(`${hour}:${min} ${ampm}`);
            }
        }
        setSlots(mockSlots);
    }, []);

    const handleContinue = () => {
        if (!pickupTime) {
            setPickupError(true);
            // Scroll to pickup time selector on mobile
            document.getElementById('pickup-time-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setPickupError(false);
        navigate('/checkout/payment', { state: { pickupTime } });
    };

    // Empty cart redirect
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#16291b] flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <ShoppingBag className="w-10 h-10 text-[#c8a97e]" />
                    </div>
                    <h2 className="text-3xl font-serif text-[#fff8e7] mb-3">Your cart is empty</h2>
                    <p className="text-stone-400 mb-8">Add some items from our menu to get started.</p>
                    <Link to="/menu" className="inline-block px-8 py-4 bg-[#c8a97e] text-[#16291b] font-bold rounded-full hover:bg-white transition-colors">
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans">
            {/* ==================== */}
            {/* LEFT: Review Header  */}
            {/* ==================== */}
            <div className="w-full lg:w-[420px] xl:w-[460px] bg-[#16291b] text-white p-6 sm:p-8 lg:p-12 flex flex-col lg:min-h-screen flex-shrink-0">
                <div className="mb-10">
                    <Link to="/menu" className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-lg tracking-wide">Back to menu</span>
                    </Link>
                </div>

                <div className="flex-grow">
                    <h1 className="text-3xl lg:text-4xl font-serif text-[#fff8e7] mb-10">
                        Review order ({cartCount})
                    </h1>

                    {/* Pickup Time */}
                    <div className="space-y-4">
                        <div className={`bg-white/5 rounded-xl border p-5 transition-colors ${
                            pickupError ? 'border-red-400 ring-2 ring-red-400/30' : 'border-white/10'
                        }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className={`w-4 h-4 ${pickupError ? 'text-red-400' : 'text-[#c8a97e]'}`} />
                                <label className={`text-xs uppercase tracking-[0.15em] font-bold ${pickupError ? 'text-red-400' : 'text-[#c8a97e]'}`}>Pickup time</label>
                            </div>
                            <select
                                id="pickup-time-select"
                                required
                                value={pickupTime}
                                onChange={e => { setPickupTime(e.target.value); setPickupError(false); }}
                                className={`w-full bg-white/10 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#c8a97e] appearance-none cursor-pointer ${
                                    pickupError ? 'border-red-400' : 'border-white/15'
                                }`}
                            >
                                <option value="" className="bg-[#16291b]">Select a time</option>
                                {slots.map(slot => (
                                    <option key={slot} value={slot} className="bg-[#16291b]">{slot}</option>
                                ))}
                            </select>
                            {pickupError && (
                                <p className="text-red-400 text-xs mt-2 font-medium animate-pulse">
                                    ⚠ Please select a pickup time before continuing
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Totals at bottom of left panel */}
                <div className="mt-auto pt-8 space-y-3">
                    <div className="flex justify-between text-stone-400 text-sm">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* ======================== */}
            {/* RIGHT: Order Items List  */}
            {/* ======================== */}
            <div className="flex-1 bg-white text-stone-900 flex flex-col lg:min-h-screen">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 xl:p-12">
                    <div className="max-w-2xl mx-auto space-y-4">
                        {items.map(item => (
                            <div
                                key={item.cartId}
                                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-4 sm:gap-5">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-stone-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg sm:text-xl font-semibold text-stone-900 leading-tight">
                                                {item.name}
                                            </h3>
                                        </div>

                                        {/* Customizations / Options */}
                                        <div className="space-y-1 mb-3">
                                            {/* Base price line */}
                                            <div className="flex justify-between text-sm text-stone-600">
                                                <span>{item.price}</span>
                                                <span className="font-medium">${item.basePrice.toFixed(2)}</span>
                                            </div>

                                            {/* Selected options */}
                                            {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => {
                                                if (key === '__size') {
                                                    return (
                                                        <div key={key} className="flex justify-between text-sm text-stone-500">
                                                            <span>Size: {value?.option || value}</span>
                                                        </div>
                                                    );
                                                }

                                                // New format: { option: string, quantity?: number }
                                                if (value && typeof value === 'object' && value.option) {
                                                    const display = value.quantity
                                                        ? `${value.option} × ${value.quantity}`
                                                        : value.option;
                                                    const label = key.replace(/_/g, ' ');
                                                    return (
                                                        <div key={key} className="flex justify-between text-sm text-stone-500">
                                                            <span className="capitalize">{label}: {display}</span>
                                                        </div>
                                                    );
                                                }

                                                // Legacy format
                                                if (!value || value === 'None' || value === 'No' || value === false) return null;
                                                const label = key.replace(/_/g, ' ');
                                                const displayValue = value === true ? 'Yes' : String(value);
                                                return (
                                                    <div key={key} className="flex justify-between text-sm text-stone-500">
                                                        <span className="capitalize">{label}: {displayValue}</span>
                                                    </div>
                                                );
                                            })}

                                            {/* Quantity if > 1 */}
                                            {item.quantity > 1 && (
                                                <div className="flex justify-between text-sm text-stone-500 pt-1">
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Item total */}
                                        <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1">
                                                {/* Quantity controls */}
                                                <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity === 1) {
                                                                removeFromCart(item.cartId);
                                                            } else {
                                                                updateQuantity(item.cartId, -1);
                                                            }
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
                                                    >
                                                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-stone-800 border-x border-stone-200 bg-stone-50">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Delete button */}
                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <span className="text-lg font-bold text-stone-900">
                                                ${item.totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar with totals + Continue */}
                <div className="border-t border-stone-200 bg-white p-4 sm:p-6 lg:px-10">
                    <div className="max-w-2xl mx-auto">
                        {/* Mobile totals (hidden on desktop since left panel shows them) */}
                        <div className="lg:hidden mb-4 space-y-2">
                            <div className="flex justify-between text-sm text-stone-500">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-stone-900 pt-1 border-t border-stone-100">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full sm:w-auto sm:float-right bg-[#16291b] hover:bg-black text-white font-bold text-base py-4 px-10 rounded-full transition-all shadow-lg"
                        >
                            Continue
                        </button>
                        <div className="clear-both" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewOrderPage;
