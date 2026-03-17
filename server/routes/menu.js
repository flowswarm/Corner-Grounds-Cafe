const express = require('express');
const router = express.Router();
const { cloverRequest } = require('../clover');

// Local cache (rudimentary)
let menuCache = {};
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

router.get('/', async (req, res) => {
    const { merchantId } = req.query;

    if (!merchantId) {
        return res.status(400).json({ error: 'Merchant ID required' });
    }

    // Check cache
    if (menuCache[merchantId] && (Date.now() - menuCache[merchantId].timestamp < CACHE_TTL)) {
        return res.json(menuCache[merchantId].data);
    }

    try {
        // 1. Fetch Categories
        const categoriesData = await cloverRequest(merchantId, 'v3/merchants/' + merchantId + '/categories?expand=items');

        // 2. Fetch Items (if needed, but categories usually have item links)
        // Actually, v3/merchants/{mId}/categories?expand=items might give us items but not all details.
        // Better to fetch categories, then for each category fetch items, OR fetch all items and map them.
        // Clover Inventory API structure:
        // /v3/merchants/{mId}/items?expand=categories,modifierGroups,tags

        const itemsData = await cloverRequest(merchantId, 'v3/merchants/' + merchantId + '/items?expand=categories,modifierGroups,tags&limit=1000');

        // Process and structure the menu
        // We want: Categories -> Items -> Modifiers

        // Since we need modifier groups details, we might need to fetch them too if not fully expanded.
        // 'modifierGroups' in item expansion usually gives the ID and minimal info.

        // Let's rely on Items for the bulk of data.
        const items = itemsData.elements || [];
        const categories = categoriesData.elements || [];

        // Build a category map
        const menu = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            sortOrder: cat.sortOrder,
            items: []
        }));

        // bucket items into categories
        items.forEach(item => {
            if (!item.categories) return;
            item.categories.forEach(catRef => {
                const category = menu.find(c => c.id === catRef.id);
                if (category) {
                    category.items.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        modifierGroups: item.modifierGroups, // These ref IDs need to be fetched if we want details? 
                        // Usually we need to fetch all modifier groups and their modifiers separately to be efficient.
                    });
                }
            });
        });

        // Cleanup empty categories
        const filteredMenu = menu.filter(c => c.items.length > 0);

        menuCache[merchantId] = {
            timestamp: Date.now(),
            data: filteredMenu
        };

        res.json(filteredMenu);

    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

module.exports = router;
