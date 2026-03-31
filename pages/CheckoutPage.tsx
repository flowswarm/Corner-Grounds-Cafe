import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Coffee, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkCloverConnection } from '../lib/api';
import axios from '../lib/api';
import { isWithinBusinessHours, getTodayHours, getNextOpenTime } from '../lib/businessHours';

declare global {
    interface Window {
        Clover: any;
    }
}

const CheckoutPage: React.FC = () => {
    const { items, cartTotal } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    // Get pickup time from Review page via router state
    const pickupTime = (location.state as any)?.pickupTime || '';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tipType, setTipType] = useState<'percent' | 'amount'>('percent');
    const [tipValue, setTipValue] = useState(15);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [showCloverError, setShowCloverError] = useState(false);
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [cloverConnected, setCloverConnected] = useState(false);

    // Payment state
    const [pakKey, setPakKey] = useState<string | null>(null);
    const [cloverInstance, setCloverInstance] = useState<any>(null);
    const [cardMounted, setCardMounted] = useState(false);
    const [cardError, setCardError] = useState('');
    const [paymentReady, setPaymentReady] = useState(false);

    // Redirect if no pickup time (user navigated directly)
    useEffect(() => {
        if (!pickupTime && items.length > 0 && !orderSuccess) {
            navigate('/checkout', { replace: true });
        }
    }, [pickupTime, items, navigate, orderSuccess]);

    // Check real Clover connection status on mount
    useEffect(() => {
        checkCloverConnection()
            .then(connections => {
                if (connections && connections.length > 0) {
                    setCloverConnected(true);
                    setMerchantId(connections[0].merchant_id);
                }
            })
            .catch(() => {
                setCloverConnected(false);
            });
    }, []);

    // Fetch PAKMS key when connected
    useEffect(() => {
        if (!cloverConnected) return;
        axios.get('/ecommerce/pak')
            .then(res => {
                setPakKey(res.data.apiAccessKey);
                console.log('PAKMS key fetched');
            })
            .catch(err => {
                console.error('Failed to fetch PAKMS key:', err);
            });
    }, [cloverConnected]);

    // Initialize Clover iframe
    useEffect(() => {
        if (!pakKey || cardMounted) return;

        const timer = setTimeout(() => {
            try {
                if (!window.Clover) {
                    console.error('Clover SDK not loaded');
                    setCardError('Payment system failed to load. Please refresh the page.');
                    return;
                }

                const clover = new window.Clover(pakKey, {
                    merchantId: merchantId,
                });

                const elements = clover.elements();

                const cardNumber = elements.create('CARD_NUMBER');
                const cardDate = elements.create('CARD_DATE');
                const cardCvv = elements.create('CARD_CVV');
                const cardZip = elements.create('CARD_POSTAL_CODE');

                cardNumber.mount('#card-number');
                cardDate.mount('#card-date');
                cardCvv.mount('#card-cvv');
                cardZip.mount('#card-zip');

                cardNumber.addEventListener('change', (event: any) => {
                    if (event.CARD_NUMBER?.error) {
                        setCardError(event.CARD_NUMBER.error);
                    } else {
                        setCardError('');
                    }
                });

                setCloverInstance(clover);
                setCardMounted(true);
                console.log('Clover card elements mounted');

            } catch (err: any) {
                console.error('Clover init error:', err);
                setCardError('Failed to initialize payment form. Please refresh and try again.');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [pakKey, cardMounted, merchantId]);

    const calculateTipAmount = () => {
        if (tipType === 'percent') {
            return (cartTotal * tipValue) / 100;
        }
        return tipValue;
    };

    const finalTotal = cartTotal + calculateTipAmount();

    // Process payment
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cloverConnected) {
            setShowCloverError(true);
            return;
        }

        if (!cloverInstance) {
            setError('Payment system not ready. Please wait a moment and try again.');
            return;
        }

        setLoading(true);
        setError('');
        setCardError('');

        try {
            console.log('Tokenizing card...');
            const tokenResult = await cloverInstance.createToken();

            if (tokenResult.errors) {
                const errorMessages = Object.values(tokenResult.errors).join(', ');
                setError(`Card error: ${errorMessages}`);
                setLoading(false);
                return;
            }

            if (!tokenResult.token) {
                setError('Failed to process card. Please check your card details and try again.');
                setLoading(false);
                return;
            }

            console.log('Card tokenized:', tokenResult.token.substring(0, 20) + '...');

            const payload = {
                merchantId,
                customer: { name, email, phone },
                pickup: { slotISO: pickupTime },
                tip: { type: tipType, value: tipValue },
                sourceToken: tokenResult.token,
                cart: items.map(item => ({
                    itemId: item.id,
                    name: item.name,
                    qty: item.quantity,
                    options: item.selectedOptions || {},
                    price: item.totalPrice / item.quantity,
                })),
            };

            const response = await axios.post('/order/checkout', payload);
            if (response.data.status === 'success') {
                setOrderSuccess(true);
            } else {
                setError('Order failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            const message = err.response?.data?.message || 'Payment failed. Please check your card details and try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // ORDER SUCCESS
    // =====================
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-[#16291b] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-[#2d7a31] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-2">Order Confirmed!</h2>
                        <p className="text-stone-300 text-lg">Thanks, {name}! Your order is being prepared.</p>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#c8a97e]">Order Receipt</span>
                            <span className="text-xs text-stone-400">{new Date().toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                            {items.map(item => (
                                <div key={item.cartId} className="flex justify-between text-stone-200 text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="text-stone-300">${item.totalPrice.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-stone-400">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            {calculateTipAmount() > 0 && (
                                <div className="flex justify-between text-stone-400">
                                    <span>Tip</span>
                                    <span>${calculateTipAmount().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-white/10">
                                <span>Total Paid</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Info */}
                    <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-[#c8a97e]" />
                            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#c8a97e]">Pickup Time</span>
                        </div>
                        <p className="text-xl font-serif text-white">{pickupTime}</p>
                    </div>

                    <div className="text-center">
                        <Link to="/menu" className="inline-block px-8 py-4 bg-white text-[#16291b] font-bold rounded-lg hover:bg-stone-200 transition-colors">
                            Back to Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // =====================
    // COMPLETE ORDER FORM
    // =====================
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row font-sans">
            {/* Left Column: Order Summary (Dark Theme) */}
            <div className="w-full lg:w-1/2 bg-[#16291b] text-white p-4 sm:p-8 lg:p-16 flex flex-col lg:min-h-screen relative overflow-hidden">
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/checkout', { state: { pickupTime } })}
                        className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-lg tracking-wide">Back to review</span>
                    </button>
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

                    {/* Pickup time badge */}
                    {pickupTime && (
                        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-[#c8a97e]" />
                            <div>
                                <p className="text-xs text-stone-400 uppercase tracking-wider font-bold">Pickup</p>
                                <p className="text-white font-medium">{pickupTime}</p>
                            </div>
                        </div>
                    )}

                    {calculateTipAmount() > 0 && (
                        <div className="space-y-2 text-sm mb-4 px-2">
                            <div className="flex justify-between text-stone-400">
                                <span>Tip</span>
                                <span>${calculateTipAmount().toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 text-sm mb-8 px-2">
                        <div className="flex justify-between text-stone-400">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-white/10">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 mt-auto text-sm text-stone-500 pt-8 border-t border-white/10">
                    <a href="#" className="underline hover:text-stone-300">Terms</a>
                    <a href="#" className="underline hover:text-stone-300">Privacy</a>
                </div>
            </div>

            {/* Right Column: Contact + Tip + Payment */}
            <div className="w-full lg:w-1/2 bg-white text-stone-900 p-4 sm:p-8 lg:p-16 flex flex-col lg:min-h-screen border-l border-stone-200">
                <div className="max-w-lg mx-auto w-full pt-8">
                    <h1 className="text-3xl font-bold mb-8">Complete Order</h1>

                    <form onSubmit={handlePlaceOrder} className="space-y-10">
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

                        {/* Tip */}
                        <div>
                            <h2 className="text-base font-semibold text-stone-800 mb-4">Add a tip</h2>
                            <div className="flex gap-2 mb-3">
                                {[10, 15, 20, 25].map(pct => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => { setTipType('percent'); setTipValue(pct); }}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipType === 'percent' && tipValue === pct
                                            ? 'bg-[#16291b] text-white shadow-md'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                            }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => { setTipType('amount'); setTipValue(0); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipType === 'amount'
                                        ? 'bg-[#16291b] text-white shadow-md'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    Custom
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTipType('percent'); setTipValue(0); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipType === 'percent' && tipValue === 0
                                        ? 'bg-[#16291b] text-white shadow-md'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    None
                                </button>
                            </div>
                            {/* Custom tip input */}
                            {tipType === 'amount' && (
                                <div className="relative mt-2 mb-1">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-base">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={tipValue || ''}
                                        onChange={e => setTipValue(parseFloat(e.target.value) || 0)}
                                        className="w-full border border-stone-300 rounded-lg p-3 pl-8 text-stone-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#16291b] focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                </div>
                            )}
                            {calculateTipAmount() > 0 && (
                                <p className="text-sm text-stone-500 text-center mt-2">Tip: ${calculateTipAmount().toFixed(2)}</p>
                            )}
                        </div>

                        {/* Payment Card Fields */}
                        <div>
                            <h2 className="text-base font-semibold text-stone-800 mb-4">Payment</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">Card Number</label>
                                    <div
                                        id="card-number"
                                        className="w-full border border-stone-300 rounded-lg bg-white"
                                        style={{ height: '44px' }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">Expiry</label>
                                        <div
                                            id="card-date"
                                            className="w-full border border-stone-300 rounded-lg bg-white"
                                            style={{ height: '44px' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">CVV</label>
                                        <div
                                            id="card-cvv"
                                            className="w-full border border-stone-300 rounded-lg bg-white"
                                            style={{ height: '44px' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">ZIP</label>
                                        <div
                                            id="card-zip"
                                            className="w-full border border-stone-300 rounded-lg bg-white"
                                            style={{ height: '44px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Errors */}
                        {cardError && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                {cardError}
                            </div>
                        )}
                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                            <div className="flex justify-between text-sm text-stone-600 mb-1">
                                <span>{items.reduce((acc, item) => acc + item.quantity, 0)} items</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            {calculateTipAmount() > 0 && (
                                <div className="flex justify-between text-sm text-stone-600 mb-1">
                                    <span>Tip</span>
                                    <span>${calculateTipAmount().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-stone-900 pt-2 border-t border-stone-200">
                                <span>Total</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            type="submit"
                            disabled={loading || items.length === 0 || !cardMounted}
                            className="w-full bg-[#16291b] hover:bg-black text-white font-bold text-lg py-5 rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Pay ${finalTotal.toFixed(2)}
                                </>
                            )}
                        </button>

                        {/* Card logos */}
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

                        <div className="flex items-center justify-center gap-2 text-stone-400 text-xs">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Your payment is encrypted and secure. Powered by Clover.</span>
                        </div>
                    </form>
                </div>
            </div>

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
                        <button
                            onClick={() => setShowCloverError(false)}
                            className="flex-1 bg-[#16291b] hover:bg-black text-white font-bold py-3 px-8 rounded-full transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
