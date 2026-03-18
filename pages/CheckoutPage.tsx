import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { getPickupSlots } from '../lib/api';
import axios from '../lib/api'; // use the configured instance
import { isWithinBusinessHours, getTodayHours, getNextOpenTime } from '../lib/businessHours';

declare global {
    interface Window {
        Clover: any;
    }
}

const CheckoutPage: React.FC = () => {
    const { items, cartTotal } = useCart();
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        setIsOpen(isWithinBusinessHours());
        // Re-check every minute
        const interval = setInterval(() => {
            setIsOpen(isWithinBusinessHours());
        }, 60000);
        return () => clearInterval(interval);
    }, []);
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
    const [showCloverError, setShowCloverError] = useState(false);

    // Generate mock pickup time slots (every 15 min from 7 AM to 6 PM)
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

    if (!isOpen) {
        const todayHours = getTodayHours();
        const nextOpen = getNextOpenTime();
        return (
            <div className="min-h-screen bg-[#16291b] flex flex-col">
                <Navbar isScrolled={true} />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="max-w-lg w-full text-center">
                        {/* Icon */}
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 backdrop-blur-sm">
                            <Coffee className="w-12 h-12 text-caramel" />
                        </div>

                        {/* Message */}
                        <h2 className="text-4xl sm:text-5xl font-serif text-cornsilk mb-4">
                            We're Currently Closed
                        </h2>
                        <p className="text-stone-300 text-lg mb-8 leading-relaxed max-w-md mx-auto">
                            Sorry, we're not accepting orders right now. Our kitchen is resting, but we'll be back soon!
                        </p>

                        {/* Hours Card */}
                        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 max-w-sm mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Clock className="w-4 h-4 text-caramel" />
                                <span className="text-xs uppercase tracking-[0.2em] font-bold text-caramel">Today's Hours</span>
                            </div>
                            <p className="text-2xl font-serif text-cornsilk mb-1">
                                {todayHours.dayName}
                            </p>
                            <p className="text-stone-300 text-lg">
                                {todayHours.open} — {todayHours.close}
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-stone-400 text-sm">
                                    We reopen <span className="text-cornsilk font-medium">{nextOpen.dayName}</span> at <span className="text-cornsilk font-medium">{nextOpen.open}</span>
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                            <Link
                                to="/menu"
                                className="flex-1 bg-white/10 hover:bg-white/20 text-cornsilk font-bold py-3.5 px-6 rounded-full transition-all text-center border border-white/10"
                            >
                                Browse Menu
                            </Link>
                            <Link
                                to="/"
                                className="flex-1 bg-caramel hover:bg-white text-forest font-bold py-3.5 px-6 rounded-full transition-all text-center"
                            >
                                Back Home
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

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
                                <span className="text-stone-400 text-xl sm:text-2xl font-medium">US$</span>
                                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{finalTotal.toFixed(2)}</span>
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
                            
                            <form onSubmit={(e) => { e.preventDefault(); setShowCloverError(true); }} className="space-y-10">
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
                                        className="w-full bg-[#16291b] hover:bg-black text-white font-bold text-base sm:text-lg lg:text-xl py-4 sm:py-5 rounded-full transition-all flex items-center justify-center gap-2 mb-6"
                                    >
                                        Credit / debit card
                                    </button>
                                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                                        <span className="h-8 bg-white border border-stone-200 rounded px-3 py-1 flex items-center">
                                            <svg viewBox="0 0 780 500" className="h-5 w-auto"><path d="M293.2 348.73l33.36-195.76h53.35l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.97-27.16-8.21-47.89-8.21-52.78 0-89.94 26.55-90.18 64.59-.5 28.1 26.53 43.77 46.76 53.12 20.73 9.58 27.7 15.71 27.6 24.28-.13 13.11-16.56 19.11-31.89 19.11-21.36 0-32.68-2.96-50.17-10.27l-6.88-3.11-7.48 43.79c12.46 5.45 35.52 10.2 59.47 10.44 56.16 0 92.59-26.25 93.05-66.88.22-22.27-14.02-39.22-44.79-53.19-18.65-9.06-30.07-15.1-29.95-24.28 0-8.14 9.67-16.83 30.55-16.83 17.45-.28 30.09 3.53 39.94 7.5l4.78 2.26 7.23-42.32h-.15zm137.31-4.22h-41.27c-12.77 0-22.33 3.49-27.94 16.22l-79.27 179.54h56.08s9.16-24.13 11.24-29.42l68.37.08c1.6 6.85 6.49 29.34 6.49 29.34h49.58l-43.28-195.76zm-65.86 126.37c4.43-11.28 21.31-54.72 21.31-54.72-.32.53 4.39-11.33 7.09-18.68l3.61 16.87s10.25 46.83 12.39 56.64l-44.4-.11v-.01zM231.5 152.97l-52.32 133.6-5.59-27.17c-9.73-31.27-40.04-65.16-73.95-82.12l47.85 171.33 56.56-.07 84.13-195.57h-56.68" fill="#1A1F71"/><path d="M152.71 152.97H66.88l-.68 4.07c67.08 16.21 111.45 55.38 129.82 102.41L177.87 169.4c-3.19-12.22-12.63-16.02-25.16-16.43" fill="#F9A533"/></svg>
                                        </span>
                                        <span className="h-8 bg-white border border-stone-200 rounded px-3 py-1 flex items-center">
                                            <svg viewBox="0 0 780 500" className="h-5 w-auto"><circle cx="310" cy="250" r="180" fill="#EB001B"/><circle cx="470" cy="250" r="180" fill="#F79E1B"/><path d="M390 100.22a179.95 179.95 0 00-80 149.78c0 62.15 31.56 116.87 79.5 149.05A179.95 179.95 0 00470 250c0-62.93-32.27-118.3-81.18-150.57" fill="#FF5F00"/></svg>
                                        </span>
                                        <span className="h-8 bg-white border border-stone-200 rounded px-3 py-1 flex items-center">
                                            <svg viewBox="0 0 780 500" className="h-5 w-auto"><path d="M0 0h780v500H0z" fill="#2557D6"/><path d="M390 437.07l-45.38-29.52h90.77L390 437.07zm-175.07-29.52V91.44h350.14v316.11H214.93z" fill="#fff"/><path d="M348.47 199.95h-70.86v25.27h69.34v23.74h-69.34v27.29h70.86v23.74h-97.22V176.22h97.22v23.73zm81.39 100.04l42.32-51.22-41.56-50.46 32.97.01 25.31 31.4 25.5-31.41 31.73.01-41.37 49.67 42.13 51.23h-32.57l-26.28-32.17-26.08 32.17-32.1.77zm-189.07-45.54l-17.77-55.16h-.39l-17.37 55.16h35.53zm-28.91-78.23h23.74l45.38 123.77h-26.68l-9.47-27.29h-43.45l-9.67 27.29h-25.67l45.82-123.77z" fill="#2557D6"/></svg>
                                        </span>
                                        <span className="h-8 bg-white border border-stone-200 rounded px-3 py-1 flex items-center text-xs font-bold text-stone-700 tracking-wider">DISCOVER</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={items.length === 0}
                                        className="w-full bg-black hover:bg-stone-900 text-white text-base sm:text-lg lg:text-xl py-3.5 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 mb-6"
                                    >
                                        <span style={{ fontWeight: 400 }}>Check out with</span>
                                        <svg className="h-4 sm:h-5 w-auto mb-[2px]" viewBox="0 0 384 512" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                        </svg>
                                        <span className="text-base sm:text-lg lg:text-[1.35rem]" style={{ fontWeight: 600 }}>Pay</span>
                                    </button>
                                    
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
                                        <div className="flex gap-1.5 pb-1 items-center">
                                            <svg viewBox="0 0 780 500" className="h-4 w-auto"><path d="M293.2 348.73l33.36-195.76h53.35l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.97-27.16-8.21-47.89-8.21-52.78 0-89.94 26.55-90.18 64.59-.5 28.1 26.53 43.77 46.76 53.12 20.73 9.58 27.7 15.71 27.6 24.28-.13 13.11-16.56 19.11-31.89 19.11-21.36 0-32.68-2.96-50.17-10.27l-6.88-3.11-7.48 43.79c12.46 5.45 35.52 10.2 59.47 10.44 56.16 0 92.59-26.25 93.05-66.88.22-22.27-14.02-39.22-44.79-53.19-18.65-9.06-30.07-15.1-29.95-24.28 0-8.14 9.67-16.83 30.55-16.83 17.45-.28 30.09 3.53 39.94 7.5l4.78 2.26 7.23-42.32h-.15zm137.31-4.22h-41.27c-12.77 0-22.33 3.49-27.94 16.22l-79.27 179.54h56.08s9.16-24.13 11.24-29.42l68.37.08c1.6 6.85 6.49 29.34 6.49 29.34h49.58l-43.28-195.76zm-65.86 126.37c4.43-11.28 21.31-54.72 21.31-54.72-.32.53 4.39-11.33 7.09-18.68l3.61 16.87s10.25 46.83 12.39 56.64l-44.4-.11v-.01zM231.5 152.97l-52.32 133.6-5.59-27.17c-9.73-31.27-40.04-65.16-73.95-82.12l47.85 171.33 56.56-.07 84.13-195.57h-56.68" fill="#1A1F71"/><path d="M152.71 152.97H66.88l-.68 4.07c67.08 16.21 111.45 55.38 129.82 102.41L177.87 169.4c-3.19-12.22-12.63-16.02-25.16-16.43" fill="#F9A533"/></svg>
                                            <svg viewBox="0 0 780 500" className="h-4 w-auto"><circle cx="310" cy="250" r="180" fill="#EB001B"/><circle cx="470" cy="250" r="180" fill="#F79E1B"/><path d="M390 100.22a179.95 179.95 0 00-80 149.78c0 62.15 31.56 116.87 79.5 149.05A179.95 179.95 0 00470 250c0-62.93-32.27-118.3-81.18-150.57" fill="#FF5F00"/></svg>
                                            <svg viewBox="0 0 780 500" className="h-4 w-auto"><path d="M0 0h780v500H0z" fill="#2557D6"/><path d="M390 437.07l-45.38-29.52h90.77L390 437.07zm-175.07-29.52V91.44h350.14v316.11H214.93z" fill="#fff"/><path d="M348.47 199.95h-70.86v25.27h69.34v23.74h-69.34v27.29h70.86v23.74h-97.22V176.22h97.22v23.73zm81.39 100.04l42.32-51.22-41.56-50.46 32.97.01 25.31 31.4 25.5-31.41 31.73.01-41.37 49.67 42.13 51.23h-32.57l-26.28-32.17-26.08 32.17-32.1.77zm-189.07-45.54l-17.77-55.16h-.39l-17.37 55.16h35.53zm-28.91-78.23h23.74l45.38 123.77h-26.68l-9.47-27.29h-43.45l-9.67 27.29h-25.67l45.82-123.77z" fill="#2557D6"/></svg>
                                            <span className="text-[10px] font-bold text-stone-600 tracking-wider">DISCOVER</span>
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

            {/* Clover Connection Error Modal */}
            {showCloverError && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCloverError(false)} />
                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5Z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-3">Not Connected to Clover</h3>
                        <p className="text-stone-600 mb-6 leading-relaxed">
                            The cafe's POS system isn't connected yet. Online ordering will be available once the Clover integration is set up.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCloverError(false)}
                                className="flex-1 bg-[#16291b] hover:bg-black text-white font-bold py-3 rounded-full transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
