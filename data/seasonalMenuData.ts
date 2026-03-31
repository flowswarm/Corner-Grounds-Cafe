import { MenuItem, CustomizationCategory } from './menuData';

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

// ── Reusable option sets for seasonal items ──────────────────────────────────

const SYRUP_OPTIONS = [
    { label: 'Vanilla', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Caramel', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Hazelnut', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Pumpkin Sauce', hasQuantity: true, default: 4, maxQuantity: 12 },
    { label: 'Brown Sugar', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Mocha Sauce', hasQuantity: true, default: 3, maxQuantity: 12 },
];

const MILK_OPTIONS = [
    { label: 'Whole Milk' }, { label: '2% Milk' }, { label: 'Nonfat Milk' },
    { label: 'Oat Milk (+$0.80)' }, { label: 'Almond Milk (+$0.80)' }, { label: 'Coconut Milk (+$0.80)' },
];

const TOPPING_OPTIONS = [
    { label: 'Whipped Cream' }, { label: 'Caramel Drizzle' }, { label: 'Mocha Drizzle' },
    { label: 'Cinnamon Powder' }, { label: 'Cocoa Powder' },
];

const COLD_FOAM_OPTIONS = [
    { label: 'Vanilla Sweet Cream Cold Foam' }, { label: 'Salted Caramel Cold Foam' },
    { label: 'Chocolate Cold Foam' }, { label: 'Nondairy Cold Foam' },
];

const ICE_OPTIONS = [
    { label: 'Regular Ice' }, { label: 'Light Ice' }, { label: 'Extra Ice' }, { label: 'No Ice' },
];

const ESPRESSO_ROAST_OPTIONS = [
    { label: 'Signature Roast' }, { label: 'Blonde Roast' }, { label: 'Decaf' },
];

const CREAMER_OPTIONS = [
    { label: 'Splash of 2% Milk' }, { label: 'Splash of Whole Milk' },
    { label: 'Splash of Oat Milk (+$0.80)' }, { label: 'Splash of Cream' },
];

const SWEETENER_LIQUID_OPTIONS = [
    { label: 'Classic Syrup', hasQuantity: true, default: 2, maxQuantity: 12 },
    { label: 'Liquid Cane Sugar', hasQuantity: true, default: 2, maxQuantity: 12 },
    { label: 'Honey Blend', hasQuantity: true, default: 2, maxQuantity: 12 },
];

const SWEETENER_PACKET_OPTIONS = [
    { label: 'Sugar', hasQuantity: true, default: 1, maxQuantity: 12 },
    { label: 'Stevia', hasQuantity: true, default: 1, maxQuantity: 12 },
];

function seasonalLatteCustomizations(): CustomizationCategory[] {
    return [
        { id: 'flavors', title: 'Flavors', items: [
            { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
        ]},
        { id: 'sweeteners', title: 'Sweeteners', items: [
            { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
        ]},
        { id: 'toppings', title: 'Toppings', items: [
            { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
            { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
        ]},
        { id: 'espresso', title: 'Espresso & Shots', items: [
            { id: 'espresso_roast', label: 'Espresso Roast', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS, default: 'Signature Roast' },
            { id: 'shots', label: 'Shots', type: 'counter', defaultQuantity: 2 },
        ]},
        { id: 'milk_options', title: 'Milk', items: [
            { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
        ]},
    ];
}

function seasonalColdBrewCustomizations(): CustomizationCategory[] {
    return [
        { id: 'flavors', title: 'Flavors', items: [
            { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
        ]},
        { id: 'sweeteners', title: 'Sweeteners', items: [
            { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
        ]},
        { id: 'toppings', title: 'Toppings', items: [
            { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
        ]},
        { id: 'cold_foams', title: 'Cold Foams', items: [
            { id: 'cold_foam', label: 'Add Cold Foam', type: 'dropdown', options: COLD_FOAM_OPTIONS },
        ]},
        { id: 'addins', title: 'Add-ins', items: [
            { id: 'ice', label: 'Ice', type: 'dropdown', options: ICE_OPTIONS, default: 'Regular Ice' },
            { id: 'creamer', label: 'Add Creamer', type: 'dropdown', options: CREAMER_OPTIONS },
        ]},
    ];
}

function seasonalTeaLatteCustomizations(): CustomizationCategory[] {
    return [
        { id: 'sweeteners', title: 'Sweeteners', items: [
            { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
        ]},
        { id: 'toppings', title: 'Toppings', items: [
            { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
            { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
        ]},
        { id: 'milk_options', title: 'Milk', items: [
            { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
        ]},
    ];
}

function seasonalFoodCustomizations(): CustomizationCategory[] {
    return [
        { id: 'preparation', title: 'Preparation', items: [
            { id: 'warming', label: 'Warming', type: 'dropdown', options: [{ label: 'Warmed' }, { label: 'Not Warmed' }], default: 'Warmed' },
        ]},
    ];
}

const DRINK_SIZES = [
    { label: 'Small', oz: '12 fl oz' },
    { label: 'Medium', oz: '16 fl oz' },
    { label: 'Large', oz: '20 fl oz' },
];

const COLD_DRINK_SIZES = [
    { label: 'Small', oz: '12 fl oz' },
    { label: 'Medium', oz: '16 fl oz' },
    { label: 'Large', oz: '24 fl oz' },
];

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
        type: 'coffee',
        sizes: DRINK_SIZES,
        customizations: seasonalLatteCustomizations(),
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
        type: 'coffee',
        sizes: COLD_DRINK_SIZES,
        customizations: seasonalColdBrewCustomizations(),
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
        type: 'tea',
        sizes: DRINK_SIZES,
        customizations: seasonalTeaLatteCustomizations(),
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
        type: 'food',
        customizations: seasonalFoodCustomizations(),
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
        type: 'coffee',
        sizes: DRINK_SIZES,
        customizations: seasonalLatteCustomizations(),
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
        type: 'coffee',
        sizes: COLD_DRINK_SIZES,
        customizations: seasonalColdBrewCustomizations(),
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
        type: 'food',
        customizations: seasonalFoodCustomizations(),
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
        type: 'coffee',
        sizes: DRINK_SIZES,
        customizations: seasonalLatteCustomizations(),
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
        type: 'coffee',
        sizes: COLD_DRINK_SIZES,
        customizations: seasonalColdBrewCustomizations(),
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
        type: 'tea',
        sizes: DRINK_SIZES,
        customizations: seasonalTeaLatteCustomizations(),
    },
];

/** Get all seasonal items as MenuItems for product page lookup */
export const getAllSeasonalProducts = (): SeasonalItem[] => {
    return [...DAILY_DEALS, ...NEW_ITEMS];
};
