export interface MenuItem {
    id: string;
    name: string;
    image: string;
    price: string;
    basePrice: number;
    description?: string;
    calories?: string;
    type: 'coffee' | 'tea' | 'food' | 'bagel' | 'merch';
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
                        type: 'coffee'
                    },
                    {
                        id: 'drip',
                        name: 'Drip',
                        image: '/Hero1.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'Our signature house blend, brewed fresh daily.',
                        calories: '5 calories',
                        type: 'coffee'
                    },
                    {
                        id: 'signature-latte',
                        name: 'Latte',
                        image: '/gallery0.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Rich espresso balanced with steamed milk and a light layer of foam.',
                        calories: '190 calories',
                        type: 'coffee'
                    },
                    {
                        id: 'americano',
                        name: 'Americano',
                        image: '/gallery8.jpg',
                        price: '$4.00',
                        basePrice: 4.00,
                        description: 'Espresso shots topped with hot water create a light layer of crema.',
                        calories: '15 calories',
                        type: 'coffee'
                    },
                    {
                        id: 'cappuccino',
                        name: 'Cappuccino',
                        image: '/gallery2.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam.',
                        calories: '140 calories',
                        type: 'coffee'
                    },
                    {
                        id: 'cold-brew',
                        name: 'Cold Brew',
                        image: '/menu11.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Hand-crafted in small batches daily, slow-steeped in cool water for 20 hours.',
                        calories: '5 calories',
                        type: 'coffee'
                    },
                    {
                        id: 'espresso',
                        name: 'Espresso',
                        image: '/menu5.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'Our smooth signature Espresso Roast with rich flavor and caramel sweetness.',
                        calories: '10 calories',
                        type: 'coffee'
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
                        type: 'tea'
                    },
                    {
                        id: 'matcha-latte',
                        name: 'Matcha Latte',
                        image: '/menu12.jpg',
                        price: '$6.00',
                        basePrice: 6.00,
                        description: 'Smooth and creamy matcha sweetened just right and served with steamed milk.',
                        calories: '240 calories',
                        type: 'tea'
                    },
                    {
                        id: 'chai-latte',
                        name: 'Chai Latte',
                        image: '/gallery5.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Black tea infused with cinnamon, clove and other warming spices is combined with steamed milk.',
                        calories: '240 calories',
                        type: 'tea'
                    },
                    {
                        id: 'hot-chocolate',
                        name: 'Hot Chocolate',
                        image: '/gallery10.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Steamed milk with chocolate-flavored syrups. Topped with sweetened whipped cream and chocolate-flavored drizzle.',
                        calories: '370 calories',
                        type: 'tea' // Using tea type for simplicity of options (milk/toppings)
                    },
                    {
                        id: 'tea',
                        name: 'Tea',
                        image: '/gallery5.jpg',
                        price: '$3.50',
                        basePrice: 3.50,
                        description: 'A selection of our finest loose leaf teas.',
                        calories: '0 calories',
                        type: 'tea'
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
                        type: 'bagel'
                    },
                    {
                        id: 'four-cookies',
                        name: 'Four Cookies',
                        image: '/menu10.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'A selection of our daily baked cookies.',
                        calories: '320 calories',
                        type: 'food'
                    },
                    {
                        id: 'gf-carrot-cake',
                        name: 'GF Mini Bundt Carrot Cake',
                        image: '/gallery18.jpg',
                        price: '$5.50',
                        basePrice: 5.50,
                        description: 'Moist, spiced carrot cake in a mini bundt form. Gluten-free.',
                        calories: '350 calories',
                        type: 'food'
                    },
                    {
                        id: 'gf-bagel',
                        name: 'GF Bagel w/ Butter',
                        image: '/menu6.jpg',
                        price: '$5.00',
                        basePrice: 5.00,
                        description: 'A delicious gluten-free bagel toasted with butter.',
                        calories: '260 calories',
                        type: 'bagel'
                    },
                    {
                        id: 'cupcake',
                        name: 'Cupcake',
                        image: '/gallery13.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Sweet, fluffy cupcake with creamy frosting.',
                        calories: '300 calories',
                        type: 'food'
                    },
                    {
                        id: 'mini-bundt',
                        name: 'Mini Bundt Cake',
                        image: '/menu4.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Our classic mini bundt cake.',
                        calories: '340 calories',
                        type: 'food'
                    },
                    {
                        id: 'morning-bun',
                        name: 'Morning Bun',
                        image: '/gallery14.jpg',
                        price: '$4.50',
                        basePrice: 4.50,
                        description: 'Flaky pastry swirled with cinnamon and sugar.',
                        calories: '350 calories',
                        type: 'food'
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

export const getProductById = (id: string): MenuItem | undefined => {
    return getAllProducts().find(p => p.id === id);
};
