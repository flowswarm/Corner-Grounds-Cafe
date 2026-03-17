import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowLeft, MapPin, Clock, Edit2, PlusCircle, Trash2, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const { items, cartTotal, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans">
            {/* Left Panel - Forest Green (Store Info) */}
            <div className="w-full md:w-1/3 min-h-[40vh] md:min-h-screen bg-forest px-6 py-12 md:p-12 text-cornsilk flex flex-col relative z-10">
                <Link to="/menu" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-cornsilk/80 hover:text-caramel transition-colors mb-12">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to menu
                </Link>

                <div className="mt-auto space-y-12">
                    <h1 className="font-serif text-4xl md:text-5xl">
                        Review order ({cartCount})
                    </h1>

                    <div className="space-y-6">
                        {/* Store Selection */}
                        <div className="group cursor-pointer">
                            <label className="text-xs font-bold uppercase tracking-widest text-cornsilk/60 mb-2 block">Store</label>
                            <div className="border border-cornsilk/20 rounded-xl p-4 flex items-center justify-between group-hover:border-caramel/50 transition-colors bg-white/5 backdrop-blur-sm">
                                <div>
                                    <h3 className="font-bold text-lg">Corner Grounds Cafe</h3>
                                    <p className="text-sm text-cornsilk/70">123 Main St • 0.5 mi</p>
                                </div>
                                <div className="p-2 bg-cornsilk/10 rounded-full group-hover:bg-caramel group-hover:text-forest transition-colors">
                                    <MapPin className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Pickup Method & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group cursor-pointer">
                                <label className="text-xs font-bold uppercase tracking-widest text-cornsilk/60 mb-2 block">Pickup method</label>
                                <div className="border border-cornsilk/20 rounded-xl p-4 flex items-center justify-between group-hover:border-caramel/50 transition-colors bg-white/5 backdrop-blur-sm h-full">
                                    <span className="font-bold">In store</span>
                                    <ChevronDown className="w-4 h-4 text-cornsilk/60" />
                                </div>
                            </div>

                            <div className="group cursor-default">
                                <label className="text-xs font-bold uppercase tracking-widest text-cornsilk/60 mb-2 block">Pickup time</label>
                                <div className="border border-cornsilk/20 rounded-xl p-4 flex items-center justify-between bg-white/5 backdrop-blur-sm h-full">
                                    <span className="font-bold">3–6 mins</span>
                                    <Clock className="w-4 h-4 text-cornsilk/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - White (Order Details) */}
            <div className="flex-1 bg-cornsilk/10 md:bg-white min-h-screen relative">
                {/* Background Pattern for Right Side (Subtle) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#2F4F4F_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="max-w-2xl mx-auto px-6 py-12 md:p-24 relative z-10">
                    {items.length === 0 ? (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-serif text-forest mb-4">Your bag is empty</h2>
                            <Link to="/menu" className="inline-block px-8 py-3 bg-forest text-cornsilk rounded-full font-bold uppercase tracking-widest hover:bg-caramel hover:text-forest transition-colors">
                                Browse Menu
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Items List */}
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.cartId} className="bg-white rounded-2xl p-6 shadow-lg shadow-forest/5 flex flex-col sm:flex-row gap-6 border border-forest/5">
                                        {/* Image */}
                                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-cornsilk/20">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-forest">{item.name}</h3>
                                                <span className="font-serif text-lg text-caramel">${item.totalPrice.toFixed(2)}</span>
                                            </div>

                                            {/* Customization Details */}
                                            <div className="text-sm text-forest/70 space-y-1 mb-4">
                                                {Object.entries(item.selectedOptions).map(([key, value]) => {
                                                    if (!value || value === 'None' || value === 'No' || value === false) return null;
                                                    const displayValue = value === true ? 'Yes' : value;
                                                    return (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="capitalize font-medium text-forest/90">{key.replace(/_/g, ' ')}:</span>
                                                            <span>{displayValue}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    to={`/menu/product/${item.id}?edit=${item.cartId}`}
                                                    className="p-2 text-forest/40 hover:text-forest transition-colors rounded-full hover:bg-forest/5"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <div className="w-px h-4 bg-forest/10" />
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, -1)}
                                                        className="p-1 text-forest/60 hover:text-caramel transition-colors"
                                                    >
                                                        {item.quantity === 1 ? <Trash2 className="w-4 h-4" onClick={() => removeFromCart(item.cartId)} /> : <span className="text-lg font-bold">-</span>}
                                                    </button>
                                                    <span className="font-bold text-forest w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartId, 1)}
                                                        className="p-1 text-forest/60 hover:text-caramel transition-colors"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="w-px h-4 bg-forest/10" />
                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="p-2 text-forest/40 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Section */}
                            <div className="border-t border-dashed border-forest/20 pt-8 mt-12 space-y-4 pb-32">
                                <div className="flex justify-between text-forest/70">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-forest/70">
                                    <span>Tax (est.)</span>
                                    <span className="font-mono">${(cartTotal * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-3xl font-serif text-forest pt-4 pb-8">
                                    <span>Total</span>
                                    <span>${(cartTotal * 1.08).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Action Button (Bottom Right) */}
                {items.length > 0 && (
                    <div className="fixed bottom-0 right-0 left-auto w-full md:w-2/3 p-6 md:p-12 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-end">
                        <button className="pointer-events-auto bg-forest text-cornsilk px-10 py-4 rounded-full font-bold uppercase tracking-widest text-lg shadow-xl shadow-forest/20 hover:bg-caramel hover:text-forest hover:shadow-caramel/30 transition-all transform hover:-translate-y-1">
                            Check out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
