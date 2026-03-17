import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { getPickupSlots } from '../lib/api';
import axios from '../lib/api'; // use the configured instance

declare global {
    interface Window {
        Clover: any;
    }
}

const CheckoutPage: React.FC = () => {
    const { items, cartTotal } = useCart();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [pickupTime, setPickupTime] = useState('');
    const [tipType, setTipType] = useState<'percent' | 'amount'>('percent');
    const [tipValue, setTipValue] = useState(15);
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [cloverElements, setCloverElements] = useState<any>(null);

    // Fetch slots on mount
    useEffect(() => {
        // TODO: Get merchantId from context
        const merchantId = 'TEST_MERCHANT_ID';
        const today = new Date().toISOString().split('T')[0];

        getPickupSlots(merchantId, today)
            .then(data => setSlots(data.slots || []))
            .catch(err => console.error('Failed to load slots', err));
    }, []);

    // Initialize Clover only when payment details view is shown
    useEffect(() => {
        if (!showPaymentDetails) return;

        const el = document.getElementById('card-element');
        if (window.Clover && el) {
            // This key should come from an endpoint that returns the PK NOT the secret
            // Currently assuming we have a way to get the Public Key (PAK) for the connected merchant.
            // For Sandbox, we might need to hardcode or fetch it.
            // Since we are multi-tenant, the backend should provide the PAK for the current merchant.
            // For this implementation, I'll assume we fetch it or it's hardcoded for the test merchant.

            // NOTE: You cannot init Clover without a Public Key.
            // I will add a placeholder for now and we might need to add an endpoint to get the PAK.
            const clover = new window.Clover('YOUR_CLOVER_PUBLIC_KEY');
            const elements = clover.elements();

            const styles = {
                body: { 'font-family': 'Roboto, sans-serif', 'font-size': '16px' },
                input: { 'font-size': '16px' }
            };

            const card = elements.create('CARD', { styles });
            card.mount('#card-element');
            setCloverElements(card);
        }
    }, [showPaymentDetails]);

    const formatTime = (slot: string) => {
        try {
            const date = new Date(slot);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
            // If it's just a time string like "14:00" or "14:00:00"
            const parts = slot.match(/(\d{1,2}):(\d{2})/);
            if (parts) {
                let h = parseInt(parts[1], 10);
                const m = parts[2];
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            }
            return slot;
        } catch {
            return slot;
        }
    };

    const calculateTipAmount = () => {
        if (tipType === 'percent') {
            return (cartTotal * tipValue) / 100;
        }
        return tipValue;
    };

    const finalTotal = cartTotal + calculateTipAmount();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!cloverElements) {
            setError('Payment system not initialized');
            setLoading(false);
            return;
        }

        try {
            // 1. Tokenize Card
            const result = await new Promise<any>((resolve, reject) => {
                // @ts-ignore
                window.Clover.createToken({ elements: cloverElements }, (result) => {
                    if (result.errors) reject(result.errors);
                    else resolve(result);
                });
            });

            if (result.token) {
                // 2. Send to Backend
                const payload = {
                    merchantId: 'TEST_MERCHANT_ID',
                    customer: { name, email, phone },
                    pickup: { slotISO: pickupTime },
                    tip: { type: tipType, value: tipValue },
                    cart: items.map(item => ({
                        itemId: item.id,
                        qty: item.quantity,
                        modifiers: [], // Todo: map selectedOptions to modifiers
                        price: item.price // Send price for validation/reference
                    })),
                    payment: { source: result.token }
                };

                const response = await axios.post('/order/checkout', payload);
                if (response.data.status === 'success') {
                    setOrderSuccess(true);
                    // Clear cart?
                } else {
                    setError('Order failed: ' + response.data.message);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-[#16291b] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-[#2d7a31] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h2>
                    <p className="text-stone-300 text-lg mb-8">Thanks for your order, {name}. We will have it ready for pickup at {pickupTime}.</p>
                    <Link to="/menu" className="inline-block px-8 py-4 bg-white text-[#16291b] font-bold rounded-lg hover:bg-stone-200 transition-colors">
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans">
            {!showPaymentDetails ? (
                <>
                    {/* Left Column: Order Summary (Dark Theme) */}
                    <div className="w-full lg:w-1/2 bg-[#16291b] text-white p-4 sm:p-8 lg:p-16 flex flex-col lg:min-h-screen relative overflow-hidden">
                        <div className="mb-12">
                            <Link to="/menu" className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium text-lg tracking-wide">Corner Grounds</span>
                            </Link>
                        </div>

                        <div className="flex-grow max-w-lg mx-auto w-full">
                            <p className="text-stone-400 mb-1">Pick-up Order for</p>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-stone-400 text-2xl font-medium">US$</span>
                                <span className="text-6xl font-bold tracking-tight">{finalTotal.toFixed(2)}</span>
                            </div>

                            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-lg">Corner Grounds Cafe order</span>
                                    <span className="font-medium text-lg">US$ {cartTotal.toFixed(2)}</span>
                                </div>
                                <p className="text-stone-400 text-sm mb-6 pb-4 border-b border-white/10">{items.length} items</p>
                                
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.cartId} className="flex justify-between text-stone-300 text-sm">
                                            <span className="truncate pr-4">{item.quantity}x {item.name}</span>
                                            <span className="whitespace-nowrap">US$ {item.totalPrice.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 text-sm mb-8 px-2">
                                <div className="flex justify-between text-stone-400">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-stone-400">
                                    <span>Taxes</span>
                                    <span>Calculated at next step</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-auto text-sm text-stone-500 pt-8 border-t border-white/10">
                            <a href="#" className="underline hover:text-stone-300">Terms</a>
                            <a href="#" className="underline hover:text-stone-300">Privacy</a>
                        </div>
                    </div>

                    {/* Right Column: Checkout Forms */}
                    <div className="w-full lg:w-1/2 bg-white text-stone-900 p-4 sm:p-8 lg:p-16 flex flex-col lg:min-h-screen border-l border-stone-200">
                        <div className="max-w-lg mx-auto w-full pt-8">
                            <h1 className="text-3xl font-bold mb-8">Complete Order</h1>
                            
                            <form onSubmit={(e) => { e.preventDefault(); setShowPaymentDetails(true); }} className="space-y-10">
                                {/* Contact Info */}
                                <div>
                                    <h2 className="text-base font-semibold text-stone-800 mb-4">Contact information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-stone-500 mb-1 ml-1">Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={name} 
                                                onChange={e => setName(e.target.value)} 
                                                className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] focus:border-transparent transition-all" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-stone-500 mb-1 ml-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    value={email} 
                                                    onChange={e => setEmail(e.target.value)} 
                                                    className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] focus:border-transparent transition-all" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-stone-500 mb-1 ml-1">Phone</label>
                                                <input 
                                                    type="tel" 
                                                    required 
                                                    value={phone} 
                                                    onChange={e => setPhone(e.target.value)} 
                                                    className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] focus:border-transparent transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Info */}
                                <div>
                                    <h2 className="text-base font-semibold text-stone-800 mb-4">Pickup time</h2>
                                    <select 
                                        required 
                                        value={pickupTime} 
                                        onChange={e => setPickupTime(e.target.value)} 
                                        className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] focus:border-transparent bg-white transition-all appearance-none"
                                    >
                                        <option value="">Select a time</option>
                                        {slots.map(slot => (
                                            <option key={slot} value={slot}>{formatTime(slot)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Payment Details Step 1 */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={items.length === 0}
                                        className="w-full bg-[#16291b] hover:bg-black text-white font-bold text-xl py-5 rounded-full transition-all flex items-center justify-center gap-2 mb-6"
                                    >
                                        Credit / debit card
                                    </button>
                                    <div className="flex justify-center gap-2 mb-8">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 bg-white border border-stone-200 rounded px-2 py-1" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 bg-white border border-stone-200 rounded px-2 py-1" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-6 bg-white border border-stone-200 rounded px-2 py-1" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Discover_Card_logo.svg/1024px-Discover_Card_logo.svg.png" alt="Discover" className="h-6 bg-white border border-stone-200 rounded px-2 py-1" />
                                    </div>
                                    
                                    <p className="text-sm text-stone-600 text-center leading-relaxed">
                                        By using guest checkout, you agree to the Terms of Use, the use of the information collected for analytics, and acknowledge reading the Privacy Notice
                                    </p>
                                    <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
                                        <a href="#" className="flex items-center gap-1 text-[#16291b] hover:underline">Terms of Use <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                                        <a href="#" className="flex items-center gap-1 text-[#16291b] hover:underline">Privacy Notice <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* NEW Left Column: Add a credit / debit card */}
                    <div className="w-full lg:w-1/2 bg-white text-stone-900 p-4 sm:p-8 flex items-center justify-center lg:min-h-screen">
                        <h1 className="text-3xl font-extrabold tracking-tight text-stone-800">Add a credit / debit card</h1>
                    </div>

                    {/* NEW Right Column: Payment Details Form */}
                    <div className="w-full lg:w-1/2 bg-white text-stone-900 p-4 sm:p-8 lg:p-16 flex flex-col lg:min-h-screen border-l border-stone-200">
                        <div className="max-w-lg mx-auto w-full pt-8">
                            <button onClick={() => setShowPaymentDetails(false)} className="mb-6 text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to details
                            </button>
                            
                            <h2 className="text-xl font-bold mb-6">Credit / debit checkout</h2>

                            {/* Order Summary Box */}
                            <div className="bg-[#16291b]/5 rounded-xl p-6 mb-8 border border-[#16291b]/10">
                                <h3 className="font-semibold text-stone-800 border-b border-[#16291b]/10 pb-3 mb-4">In-store pickup at Odessa, DE</h3>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex -space-x-2">
                                        {items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-medium text-stone-700">
                                                {item.name.charAt(0)}
                                            </div>
                                        ))}
                                        {items.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-xs text-stone-600 font-medium">
                                                +{items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-stone-600">{items.reduce((acc, item) => acc + item.quantity, 0)} items in your order</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-stone-600 border-b border-dotted border-[#16291b]/20 pb-2">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 text-stone-900">
                                        <span>Total</span>
                                        <span>${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Form */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-[#16291b] text-xs font-semibold mb-1">* indicates required field</p>
                                            <h3 className="text-base font-bold text-stone-800 mt-2">Card Information</h3>
                                        </div>
                                        <div className="flex gap-1 pb-1">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-4" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Discover_Card_logo.svg/1024px-Discover_Card_logo.svg.png" alt="Discover" className="h-4" />
                                        </div>
                                    </div>
                                    <div className="h-0.5 w-full bg-[#16291b]/10 mb-6 rounded-full"></div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input type="text" placeholder="* Card number" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                            <div className="absolute right-3 top-3.5 text-stone-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <select className="w-full border border-stone-300 rounded-lg p-3 text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#16291b] appearance-none bg-white font-medium">
                                                    <option>* Exp. month</option>
                                                    <option>01 - Jan</option>
                                                    <option>02 - Feb</option>
                                                    <option>03 - Mar</option>
                                                    <option>04 - Apr</option>
                                                    <option>05 - May</option>
                                                    <option>06 - Jun</option>
                                                    <option>07 - Jul</option>
                                                    <option>08 - Aug</option>
                                                    <option>09 - Sep</option>
                                                    <option>10 - Oct</option>
                                                    <option>11 - Nov</option>
                                                    <option>12 - Dec</option>
                                                </select>
                                                <div className="absolute right-3 top-3.5 text-[#16291b] pointer-events-none">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select className="w-full border border-stone-300 rounded-lg p-3 text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#16291b] appearance-none bg-white font-medium">
                                                    <option>* Exp. year</option>
                                                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                        <option key={year}>{year}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3.5 text-[#16291b] pointer-events-none">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2 sm:pr-2">
                                            <div className="relative">
                                                <input type="text" placeholder="* Security code" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                                <div className="absolute right-3 top-3.5 text-stone-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2 sm:pr-2">
                                            <input type="text" placeholder="* Billing ZIP" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-base font-bold text-stone-800 mb-2">Cardholder information</h3>
                                    <div className="h-0.5 w-full bg-[#16291b]/10 mb-6 rounded-full"></div>
                                    <div className="space-y-4">
                                        <input type="text" value={name.split(' ')[0] || ''} onChange={(e) => setName(e.target.value + ' ' + (name.split(' ').slice(1).join(' ') || ''))} placeholder="* First name" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                        <input type="text" value={name.split(' ').slice(1).join(' ') || ''} onChange={(e) => setName((name.split(' ')[0] || '') + ' ' + e.target.value)} placeholder="* Last name" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="* Email address" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#16291b] placeholder-stone-500 font-medium" />
                                    </div>
                                </div>
                                
                                {error && <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>}

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading || items.length === 0}
                                        className="w-full bg-[#16291b] hover:bg-black text-white font-bold text-lg py-4 rounded-full transition-all shadow-md disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : `Place order $${finalTotal.toFixed(2)}`}
                                    </button>
                                </div>
                                
                                <div className="hidden">
                                    {/* Keep Clover container alive for security logic, though it's hidden now based on the image rendering */}
                                    <div id="card-element"></div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckoutPage;
