import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../data/menuData';

export interface CartItem extends MenuItem {
    cartId: string; // Unique ID for this specific instance in cart (uuid)
    selectedOptions: Record<string, any>;
    quantity: number;
    totalPrice: number; // Base price + options * quantity
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    addToCart: (item: MenuItem, options: Record<string, any>, quantity: number) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, delta: number) => void;
    updateItem: (cartId: string, newOptions: Record<string, any>) => void;
    toggleCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Persist cart to local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('corner-grounds-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('corner-grounds-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: MenuItem, options: Record<string, any>, quantity: number) => {
        // Calculate price with modifiers (simplified logic for now)
        // In a real app, you'd calculate based on specific option costs
        let unitPrice = product.basePrice;

        // Example: Add costs for specific options if needed
        if (options.milk?.includes('+$0.80')) unitPrice += 0.80;

        const newItem: CartItem = {
            ...product,
            cartId: crypto.randomUUID(),
            selectedOptions: options,
            quantity: quantity,
            totalPrice: unitPrice * quantity
        };

        setItems(prev => [...prev, newItem]);
        setIsOpen(true); // Open cart when adding item
    };

    const removeFromCart = (cartId: string) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                //  Recalculate total price based on unit price derived from current total/quantity
                const unitPrice = item.totalPrice / item.quantity;
                return { ...item, quantity: newQuantity, totalPrice: unitPrice * newQuantity };
            }
            return item;
        }));
    };

    const updateItem = (cartId: string, newOptions: Record<string, any>) => {
        setItems(prev => prev.map(item => {
            if (item.cartId === cartId) {
                // Recalculate price based on new options (simplified logic same as addToCart)
                let unitPrice = item.basePrice;
                if (newOptions.milk?.includes('+$0.80')) unitPrice += 0.80;

                return {
                    ...item,
                    selectedOptions: newOptions,
                    totalPrice: unitPrice * item.quantity
                };
            }
            return item;
        }));
    };

    const toggleCart = () => setIsOpen(prev => !prev);

    const cartTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, isOpen, addToCart, removeFromCart, updateQuantity, updateItem, toggleCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
