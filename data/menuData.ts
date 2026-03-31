// ── Customization Types ──────────────────────────────────────────────────────

export interface CustomizationOption {
    label: string;
    hasQuantity?: boolean;
    default?: number;
    maxQuantity?: number;
}

export interface CustomizationTile {
    id: string;
    label: string;
    type: 'dropdown' | 'radio' | 'counter';
    options?: CustomizationOption[];
    default?: string;
    defaultQuantity?: number;
}

export interface CustomizationCategory {
    id: string;
    title: string;
    items: CustomizationTile[];
}

// ── Menu Item Types ──────────────────────────────────────────────────────────

export interface SizeOption {
    label: string;
    oz: string;
}

export interface MenuItem {
    id: string;
    name: string;
    image: string;
    price: string;
    basePrice: number;
    description?: string;
    calories?: string;
    type: 'coffee' | 'tea' | 'food' | 'bagel' | 'merch';
    sizes?: SizeOption[];
    customizations?: CustomizationCategory[];
}

export interface SubCategory {
    title: string;
    items: MenuItem[];
}

export interface MenuCategory {
    id: string;
    title: string;
    subcategories: SubCategory[];
}

// ── Reusable Customization Blocks ────────────────────────────────────────────
// These are templates that can be spread into product customizations.

const SYRUP_OPTIONS: CustomizationOption[] = [
    { label: 'Vanilla', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Caramel', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Hazelnut', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Mocha Sauce', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'White Mocha Sauce', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Brown Sugar', hasQuantity: true, default: 3, maxQuantity: 12 },
    { label: 'Lavender', hasQuantity: true, default: 3, maxQuantity: 12 },
];

const SWEETENER_LIQUID_OPTIONS: CustomizationOption[] = [
    { label: 'Classic Syrup', hasQuantity: true, default: 2, maxQuantity: 12 },
    { label: 'Liquid Cane Sugar', hasQuantity: true, default: 2, maxQuantity: 12 },
    { label: 'Honey Blend', hasQuantity: true, default: 2, maxQuantity: 12 },
];

const SWEETENER_PACKET_OPTIONS: CustomizationOption[] = [
    { label: 'Sugar', hasQuantity: true, default: 1, maxQuantity: 12 },
    { label: 'Stevia', hasQuantity: true, default: 1, maxQuantity: 12 },
    { label: 'Splenda', hasQuantity: true, default: 1, maxQuantity: 12 },
];

const TOPPING_OPTIONS: CustomizationOption[] = [
    { label: 'Whipped Cream' },
    { label: 'Caramel Drizzle' },
    { label: 'Mocha Drizzle' },
    { label: 'Cinnamon Powder' },
    { label: 'Cocoa Powder' },
    { label: 'Vanilla Powder' },
];

const COLD_FOAM_OPTIONS: CustomizationOption[] = [
    { label: 'Vanilla Sweet Cream Cold Foam' },
    { label: 'Salted Caramel Cold Foam' },
    { label: 'Chocolate Cold Foam' },
    { label: 'Nondairy Cold Foam' },
];

const MILK_OPTIONS: CustomizationOption[] = [
    { label: 'Whole Milk' },
    { label: '2% Milk' },
    { label: 'Nonfat Milk' },
    { label: 'Oat Milk (+$0.80)' },
    { label: 'Almond Milk (+$0.80)' },
    { label: 'Coconut Milk (+$0.80)' },
];

const CREAMER_OPTIONS: CustomizationOption[] = [
    { label: 'Splash of 2% Milk' },
    { label: 'Splash of Whole Milk' },
    { label: 'Splash of Oat Milk (+$0.80)' },
    { label: 'Splash of Almond Milk (+$0.80)' },
    { label: 'Splash of Cream' },
    { label: 'Splash of Half & Half' },
];

const ICE_OPTIONS: CustomizationOption[] = [
    { label: 'Regular Ice' },
    { label: 'Light Ice' },
    { label: 'Extra Ice' },
    { label: 'No Ice' },
];

const ESPRESSO_ROAST_OPTIONS: CustomizationOption[] = [
    { label: 'Signature Roast' },
    { label: 'Blonde Roast' },
    { label: 'Decaf' },
];

const DRINK_SIZES: SizeOption[] = [
    { label: 'Small', oz: '12 fl oz' },
    { label: 'Medium', oz: '16 fl oz' },
    { label: 'Large', oz: '20 fl oz' },
];

const COLD_DRINK_SIZES: SizeOption[] = [
    { label: 'Small', oz: '12 fl oz' },
    { label: 'Medium', oz: '16 fl oz' },
    { label: 'Large', oz: '24 fl oz' },
];

// ── Per-Product Customization Builders ───────────────────────────────────────

function espressoCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'milk',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'espresso',
            title: 'Espresso & Shots',
            items: [
                { id: 'espresso_roast', label: 'Espresso Roast', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS, default: 'Signature Roast' },
                { id: 'shots', label: 'Shots', type: 'counter', defaultQuantity: 2 },
            ]
        },
    ];
}

function latteCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'cold_foams',
            title: 'Cold Foams',
            items: [
                { id: 'cold_foam', label: 'Add Cold Foam', type: 'dropdown', options: COLD_FOAM_OPTIONS },
            ]
        },
        {
            id: 'espresso',
            title: 'Espresso & Shots',
            items: [
                { id: 'espresso_roast', label: 'Espresso Roast', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS, default: 'Signature Roast' },
                { id: 'shots', label: 'Shots', type: 'counter', defaultQuantity: 2 },
            ]
        },
        {
            id: 'milk_options',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
            ]
        },
    ];
}

function coldBrewCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
                { id: 'drizzle', label: 'Add Drizzle', type: 'dropdown', options: [{ label: 'Caramel Drizzle' }, { label: 'Mocha Drizzle' }] },
            ]
        },
        {
            id: 'cold_foams',
            title: 'Cold Foams',
            items: [
                { id: 'cold_foam', label: 'Add Cold Foam', type: 'dropdown', options: COLD_FOAM_OPTIONS },
            ]
        },
        {
            id: 'espresso',
            title: 'Espresso & Shots',
            items: [
                { id: 'espresso_roast', label: 'Espresso Roast Options', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS },
                { id: 'shots', label: 'Add Shots', type: 'counter', defaultQuantity: 0 },
            ]
        },
        {
            id: 'addins',
            title: 'Add-ins',
            items: [
                { id: 'ice', label: 'Ice', type: 'dropdown', options: ICE_OPTIONS, default: 'Regular Ice' },
                { id: 'creamer', label: 'Add Creamer', type: 'dropdown', options: CREAMER_OPTIONS },
            ]
        },
    ];
}

function dripCoffeeCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'addins',
            title: 'Add-ins',
            items: [
                { id: 'creamer', label: 'Add Creamer', type: 'dropdown', options: CREAMER_OPTIONS },
                { id: 'room', label: 'Room for Cream', type: 'dropdown', options: [{ label: 'Room' }, { label: 'Extra Room' }, { label: 'Light Room' }, { label: 'No Room' }] },
            ]
        },
    ];
}

function americanoCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'espresso',
            title: 'Espresso & Shots',
            items: [
                { id: 'espresso_roast', label: 'Espresso Roast', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS, default: 'Signature Roast' },
                { id: 'shots', label: 'Shots', type: 'counter', defaultQuantity: 2 },
            ]
        },
        {
            id: 'addins',
            title: 'Add-ins',
            items: [
                { id: 'creamer', label: 'Add Creamer', type: 'dropdown', options: CREAMER_OPTIONS },
            ]
        },
    ];
}

function cappuccinoCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'flavors',
            title: 'Flavors',
            items: [
                { id: 'syrups', label: 'Add Syrups', type: 'dropdown', options: SYRUP_OPTIONS },
            ]
        },
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'espresso',
            title: 'Espresso & Shots',
            items: [
                { id: 'espresso_roast', label: 'Espresso Roast', type: 'dropdown', options: ESPRESSO_ROAST_OPTIONS, default: 'Signature Roast' },
                { id: 'shots', label: 'Shots', type: 'counter', defaultQuantity: 2 },
            ]
        },
        {
            id: 'milk_options',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
            ]
        },
    ];
}

function teaCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'addins',
            title: 'Add-ins',
            items: [
                { id: 'creamer', label: 'Add Creamer', type: 'dropdown', options: CREAMER_OPTIONS },
            ]
        },
    ];
}

function teaLatteCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Add Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }] },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'milk_options',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
            ]
        },
    ];
}

function matchaLatteCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
                { id: 'sweetener_packets', label: 'Add Sweetener Packets', type: 'dropdown', options: SWEETENER_PACKET_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: [...TOPPING_OPTIONS, { label: 'Matcha Powder' }] },
            ]
        },
        {
            id: 'milk_options',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: '2% Milk' },
            ]
        },
        {
            id: 'scoops',
            title: 'Matcha',
            items: [
                { id: 'matcha_scoops', label: 'Matcha Scoops', type: 'counter', defaultQuantity: 3 },
            ]
        },
    ];
}

function hotChocolateCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'sweeteners',
            title: 'Sweeteners',
            items: [
                { id: 'liquid_sweetener', label: 'Add Liquid Sweetener', type: 'dropdown', options: SWEETENER_LIQUID_OPTIONS },
            ]
        },
        {
            id: 'toppings',
            title: 'Toppings',
            items: [
                { id: 'whipped_cream', label: 'Whipped Cream', type: 'dropdown', options: [{ label: 'Whipped Cream' }], default: 'Whipped Cream' },
                { id: 'topping_options', label: 'Add Toppings', type: 'dropdown', options: TOPPING_OPTIONS },
            ]
        },
        {
            id: 'milk_options',
            title: 'Milk',
            items: [
                { id: 'milk', label: 'Milk', type: 'dropdown', options: MILK_OPTIONS, default: 'Whole Milk' },
            ]
        },
    ];
}

function bagelCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'preparation',
            title: 'Preparation',
            items: [
                { id: 'toasting', label: 'Toasting', type: 'dropdown', options: [
                    { label: 'Lightly Toasted' },
                    { label: 'Toasted' },
                    { label: 'Double Toasted' },
                    { label: 'Not Toasted' },
                ], default: 'Toasted' },
                { id: 'spread', label: 'Spread', type: 'dropdown', options: [
                    { label: 'Butter' },
                    { label: 'Cream Cheese' },
                    { label: 'Peanut Butter' },
                    { label: 'Strawberry Jam' },
                ], default: 'Butter' },
            ]
        },
    ];
}

function pastryCustomizations(): CustomizationCategory[] {
    return [
        {
            id: 'preparation',
            title: 'Preparation',
            items: [
                { id: 'warming', label: 'Warming', type: 'dropdown', options: [
                    { label: 'Warmed' },
                    { label: 'Not Warmed' },
                ], default: 'Warmed' },
            ]
        },
    ];
}


// ── Menu Data ────────────────────────────────────────────────────────────────

export const MENU_DATA: MenuCategory[] = [
    {
        id: 'drinks',
        title: 'Drinks',
        subcategories: [
            {
                title: 'Coffee (12oz / 16oz / 20oz)',
                items: [
                    {
                        id: 'redeye',
                        name: 'Redeye',
                        image: '/gallery3.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Fresh brewed coffee topped with a shot of espresso.',
                        calories: '5 calories',
                        type: 'coffee',
                        sizes: DRINK_SIZES,
                        customizations: dripCoffeeCustomizations(),
                    },
                    {
                        id: 'drip',
                        name: 'Drip',
                        image: '/Hero1.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'Our signature house blend, brewed fresh daily.',
                        calories: '5 calories',
                        type: 'coffee',
                        sizes: DRINK_SIZES,
                        customizations: dripCoffeeCustomizations(),
                    },
                    {
                        id: 'signature-latte',
                        name: 'Latte',
                        image: '/gallery0.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Rich espresso balanced with steamed milk and a light layer of foam.',
                        calories: '190 calories',
                        type: 'coffee',
                        sizes: DRINK_SIZES,
                        customizations: latteCustomizations(),
                    },
                    {
                        id: 'americano',
                        name: 'Americano',
                        image: '/gallery8.jpg',
                        price: '$4.00',
                        basePrice: 4.00,
                        description: 'Espresso shots topped with hot water create a light layer of crema.',
                        calories: '15 calories',
                        type: 'coffee',
                        sizes: DRINK_SIZES,
                        customizations: americanoCustomizations(),
                    },
                    {
                        id: 'cappuccino',
                        name: 'Cappuccino',
                        image: '/gallery2.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam.',
                        calories: '140 calories',
                        type: 'coffee',
                        sizes: DRINK_SIZES,
                        customizations: cappuccinoCustomizations(),
                    },
                    {
                        id: 'cold-brew',
                        name: 'Cold Brew',
                        image: '/menu11.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Hand-crafted in small batches daily, slow-steeped in cool water for 20 hours.',
                        calories: '5 calories',
                        type: 'coffee',
                        sizes: COLD_DRINK_SIZES,
                        customizations: coldBrewCustomizations(),
                    },
                    {
                        id: 'espresso',
                        name: 'Espresso',
                        image: '/menu5.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'Our smooth signature Espresso Roast with rich flavor and caramel sweetness.',
                        calories: '10 calories',
                        type: 'coffee',
                        customizations: espressoCustomizations(),
                    },
                ]
            },
            {
                title: 'Tea & Others',
                items: [
                    {
                        id: 'london-fog',
                        name: 'London Fog',
                        image: '/gallery7.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'Bright, citrusy spark of Italian bergamot blended with subtle hints of lavender, vanilla syrup, and steamed milk.',
                        calories: '180 calories',
                        type: 'tea',
                        sizes: DRINK_SIZES,
                        customizations: teaLatteCustomizations(),
                    },
                    {
                        id: 'matcha-latte',
                        name: 'Matcha Latte',
                        image: '/menu12.jpg',
                        price: '$6.00',
                        basePrice: 6.00,
                        description: 'Smooth and creamy matcha sweetened just right and served with steamed milk.',
                        calories: '240 calories',
                        type: 'tea',
                        sizes: DRINK_SIZES,
                        customizations: matchaLatteCustomizations(),
                    },
                    {
                        id: 'chai-latte',
                        name: 'Chai Latte',
                        image: '/gallery5.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Black tea infused with cinnamon, clove and other warming spices is combined with steamed milk.',
                        calories: '240 calories',
                        type: 'tea',
                        sizes: DRINK_SIZES,
                        customizations: teaLatteCustomizations(),
                    },
                    {
                        id: 'hot-chocolate',
                        name: 'Hot Chocolate',
                        image: '/gallery10.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Steamed milk with chocolate-flavored syrups. Topped with sweetened whipped cream and chocolate-flavored drizzle.',
                        calories: '370 calories',
                        type: 'tea',
                        sizes: DRINK_SIZES,
                        customizations: hotChocolateCustomizations(),
                    },
                    {
                        id: 'tea',
                        name: 'Tea',
                        image: '/gallery5.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'A selection of our finest loose leaf teas.',
                        calories: '0 calories',
                        type: 'tea',
                        sizes: DRINK_SIZES,
                        customizations: teaCustomizations(),
                    },
                ]
            }
        ]
    },
    {
        id: 'food',
        title: 'Food',
        subcategories: [
            {
                title: 'Bagels & Food',
                items: [
                    {
                        id: 'bagel',
                        name: 'Bagel w/ Butter',
                        image: '/menu6.jpg',
                        price: '$4.00',
                        basePrice: 4.00,
                        description: 'A classic bagel toasted and topped with butter.',
                        calories: '280 calories',
                        type: 'bagel',
                        customizations: bagelCustomizations(),
                    },
                    {
                        id: 'four-cookies',
                        name: 'Four Cookies',
                        image: '/menu10.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'A selection of our daily baked cookies.',
                        calories: '320 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                    {
                        id: 'gf-carrot-cake',
                        name: 'GF Mini Bundt Carrot Cake',
                        image: '/gallery18.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Moist, spiced carrot cake in a mini bundt form. Gluten-free.',
                        calories: '350 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                    {
                        id: 'gf-bagel',
                        name: 'GF Bagel w/ Butter',
                        image: '/menu6.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'A delicious gluten-free bagel toasted with butter.',
                        calories: '260 calories',
                        type: 'bagel',
                        customizations: bagelCustomizations(),
                    },
                    {
                        id: 'cupcake',
                        name: 'Cupcake',
                        image: '/gallery13.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Sweet, fluffy cupcake with creamy frosting.',
                        calories: '300 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                    {
                        id: 'mini-bundt',
                        name: 'Mini Bundt Cake',
                        image: '/menu4.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Our classic mini bundt cake.',
                        calories: '340 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                    {
                        id: 'morning-bun',
                        name: 'Morning Bun',
                        image: '/gallery14.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Flaky pastry swirled with cinnamon and sugar.',
                        calories: '350 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                    {
                        id: 'test',
                        name: 'Test',
                        image: '/gallery14.jpg',
                        price: '$1.00',
                        basePrice: 1.00,
                        description: 'Test menu item for sync verification.',
                        calories: '0 calories',
                        type: 'food',
                        customizations: pastryCustomizations(),
                    },
                ]
            }
        ]
    }
];

export const getAllProducts = (): MenuItem[] => {
    const products: MenuItem[] = [];
    MENU_DATA.forEach(category => {
        category.subcategories.forEach(sub => {
            products.push(...sub.items);
        });
    });
    return products;
};

import { getAllSeasonalProducts } from './seasonalMenuData';

export const getProductById = (id: string): MenuItem | undefined => {
    return getAllProducts().find(p => p.id === id)
        || getAllSeasonalProducts().find(p => p.id === id);
};
