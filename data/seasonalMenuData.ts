import { MenuItem } from './menuData';

export interface SeasonalItem extends MenuItem {
    originalPrice?: string;
    dealPrice?: string;
    tag?: string;
}

export interface WeeklyPromo {
    id: string;
    title: string;
    description: string;
    image: string;
    details: string;
    validThrough: string;
    tag?: string;
}

export const DAILY_DEALS: SeasonalItem[] = [
    {
        id: 'deal-pumpkin-latte',
        name: 'Pumpkin Spice Latte',
        image: '/menu8.jpg',
        description: 'Our signature fall favorite — real pumpkin, warm spices, and velvety steamed milk.',
        price: '$4.99',
        basePrice: 4.99,
        originalPrice: '$6.50',
        dealPrice: '$4.99',
        tag: "Today's Deal",
        calories: '320 calories',
        type: 'coffee'
    },
    {
        id: 'deal-maple-cold-brew',
        name: 'Maple Pecan Cold Brew',
        image: '/menu11.jpg',
        description: 'Smooth cold brew infused with Vermont maple syrup and toasted pecan.',
        price: '$5.25',
        basePrice: 5.25,
        originalPrice: '$7.00',
        dealPrice: '$5.25',
        tag: "Today's Deal",
        calories: '180 calories',
        type: 'coffee'
    },
    {
        id: 'deal-chai-cookie',
        name: 'Chai Latte + Cookie Combo',
        image: '/gallery5.jpg',
        description: 'A warming chai latte paired with a freshly baked spiced cookie.',
        price: '$6.50',
        basePrice: 6.50,
        originalPrice: '$9.00',
        dealPrice: '$6.50',
        tag: 'Best Value',
        calories: '480 calories',
        type: 'tea'
    },
    {
        id: 'deal-morning-bun',
        name: 'Morning Bun & Drip Coffee',
        image: '/gallery14.jpg',
        description: 'Start your day with our flaky morning bun alongside smooth drip coffee.',
        price: '$5.99',
        basePrice: 5.99,
        originalPrice: '$8.00',
        dealPrice: '$5.99',
        tag: 'Breakfast Deal',
        calories: '380 calories',
        type: 'food'
    },
];

export const WEEKLY_PROMOS: WeeklyPromo[] = [
    {
        id: 'promo-bogo-latte',
        title: 'Buy One, Get One Lattes',
        description: 'Bring a friend and enjoy your favorite lattes together. Any milk, any flavor.',
        image: '/gallery0.jpg',
        details: 'Valid on all latte varieties. Second drink must be of equal or lesser value.',
        validThrough: 'Valid Mon – Fri, 2pm – 5pm',
        tag: 'BOGO'
    },
    {
        id: 'promo-bagel-bundle',
        title: 'Bagel Breakfast Bundle',
        description: 'Two bagels with spreads plus two medium drip coffees for one great price.',
        image: '/menu6.jpg',
        details: '$12.99 for the full bundle. Choice of plain, everything, or cinnamon raisin.',
        validThrough: 'All week — 7am to 11am',
        tag: 'Bundle'
    },
    {
        id: 'promo-happy-hour',
        title: 'Afternoon Happy Hour',
        description: '30% off all cold drinks every afternoon. Beat the slump with a cold brew or iced matcha.',
        image: '/menu12.jpg',
        details: 'Applies to all iced coffees, cold brews, iced teas, and smoothies.',
        validThrough: 'Daily 3pm – 5pm',
        tag: '30% Off'
    },
];

export const NEW_ITEMS: SeasonalItem[] = [
    {
        id: 'new-lavender-latte',
        name: 'Lavender Oat Latte',
        image: '/gallery7.jpg',
        description: 'Delicate French lavender meets creamy oat milk for a floral, calming sip.',
        price: '$6.50',
        basePrice: 6.50,
        tag: 'NEW',
        calories: '210 calories',
        type: 'coffee'
    },
    {
        id: 'new-brown-sugar-espresso',
        name: 'Brown Sugar Shaken Espresso',
        image: '/menu5.jpg',
        description: 'Bold espresso shaken with brown sugar syrup and oat milk over ice.',
        price: '$6.00',
        basePrice: 6.00,
        tag: 'NEW',
        calories: '190 calories',
        type: 'coffee'
    },
    {
        id: 'new-matcha-croissant',
        name: 'Matcha Croissant',
        image: '/gallery18.jpg',
        description: 'Buttery, flaky croissant infused with ceremonial-grade matcha and white chocolate.',
        price: '$5.50',
        basePrice: 5.50,
        tag: 'NEW',
        calories: '360 calories',
        type: 'food'
    },
    {
        id: 'new-honey-cinnamon-cappuccino',
        name: 'Honey Cinnamon Cappuccino',
        image: '/gallery2.jpg',
        description: 'Rich cappuccino drizzled with local honey and dusted with Saigon cinnamon.',
        price: '$6.00',
        basePrice: 6.00,
        tag: 'NEW',
        calories: '200 calories',
        type: 'coffee'
    },
    {
        id: 'new-tiramisu-cold-brew',
        name: 'Tiramisu Cold Brew',
        image: '/menu9.jpg',
        description: 'Cold brew layered with mascarpone cream and a dusting of cocoa. Dessert in a cup.',
        price: '$7.00',
        basePrice: 7.00,
        tag: 'NEW',
        calories: '280 calories',
        type: 'coffee'
    },
    {
        id: 'new-spiced-apple-cider',
        name: 'Spiced Apple Cider',
        image: '/gallery10.jpg',
        description: 'Hot-pressed apple cider with cinnamon sticks, star anise, and a hint of ginger.',
        price: '$5.50',
        basePrice: 5.50,
        tag: 'NEW',
        calories: '150 calories',
        type: 'tea'
    },
];

/** Get all seasonal items as MenuItems for product page lookup */
export const getAllSeasonalProducts = (): SeasonalItem[] => {
    return [...DAILY_DEALS, ...NEW_ITEMS];
};
