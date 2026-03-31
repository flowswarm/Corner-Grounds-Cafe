const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { cloverRequest } = require('../clover');
const { pool } = require('../db');

// Read menu data from the shared JSON file
function getMenuData() {
    const menuPath = path.join(__dirname, '../../data/menuData.json');
    if (!fs.existsSync(menuPath)) {
        throw new Error('menuData.json not found. Run the export script or create it manually.');
    }
    return JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
}

// Normalize a name for fuzzy matching (lowercase, trim, collapse whitespace)
function normalizeName(name) {
    return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// POST /api/admin/menu-sync — Smart sync: match existing Clover inventory, only create new items
router.post('/', async (req, res) => {
    const client = await pool.connect();

    try {
        // Get the connected merchant
        const connResult = await client.query('SELECT merchant_id FROM clover_connections LIMIT 1');
        if (connResult.rows.length === 0) {
            return res.status(400).json({ error: 'No Clover merchant connected. Connect first via /admin/connect-clover.' });
        }
        const merchantId = connResult.rows[0].merchant_id;
        const menuData = getMenuData();

        const results = {
            matched: [],   // Linked to existing Clover items (no duplicate created)
            created: [],   // New items created in Clover
            updated: [],   // Existing items with price/name updated
            categories_matched: [],
            categories_created: [],
            errors: [],
        };

        // ================================================================
        // STEP 1: Fetch ALL existing Clover inventory upfront
        // ================================================================
        console.log('📦 Fetching existing Clover inventory...');

        let cloverItems = [];
        let cloverCategories = [];

        try {
            const itemsResponse = await cloverRequest(
                merchantId,
                `v3/merchants/${merchantId}/items?limit=500`
            );
            cloverItems = itemsResponse.elements || [];
            console.log(`   Found ${cloverItems.length} existing items in Clover`);
        } catch (err) {
            console.error('Failed to fetch Clover items:', err.response?.data || err.message);
            return res.status(500).json({ error: 'Failed to fetch existing Clover inventory. Check permissions.' });
        }

        try {
            const catsResponse = await cloverRequest(
                merchantId,
                `v3/merchants/${merchantId}/categories?limit=200`
            );
            cloverCategories = catsResponse.elements || [];
            console.log(`   Found ${cloverCategories.length} existing categories in Clover`);
        } catch (err) {
            console.error('Failed to fetch Clover categories:', err.response?.data || err.message);
            return res.status(500).json({ error: 'Failed to fetch existing Clover categories. Check permissions.' });
        }

        // Build lookup maps (normalized name -> Clover object)
        const cloverItemMap = {};
        for (const item of cloverItems) {
            cloverItemMap[normalizeName(item.name)] = item;
        }

        const cloverCategoryMap = {};
        for (const cat of cloverCategories) {
            cloverCategoryMap[normalizeName(cat.name)] = cat;
        }

        // ================================================================
        // STEP 2: Match/create categories
        // ================================================================
        console.log('📂 Syncing categories...');
        const categoryIdMap = {}; // local category id -> Clover category id

        for (const category of menuData) {
            try {
                const normalizedName = normalizeName(category.title);
                const existingCat = cloverCategoryMap[normalizedName];

                if (existingCat) {
                    // Category already exists in Clover — just link it
                    categoryIdMap[category.id] = existingCat.id;
                    results.categories_matched.push({
                        name: category.title,
                        clover_id: existingCat.id,
                        clover_name: existingCat.name,
                    });
                    console.log(`   ✅ Category "${category.title}" matched to existing "${existingCat.name}" (${existingCat.id})`);
                } else {
                    // Category doesn't exist — create it
                    const newCat = await cloverRequest(
                        merchantId,
                        `v3/merchants/${merchantId}/categories`,
                        'POST',
                        { name: category.title, sortOrder: Object.keys(categoryIdMap).length }
                    );
                    categoryIdMap[category.id] = newCat.id;
                    results.categories_created.push({
                        name: category.title,
                        clover_id: newCat.id,
                    });
                    console.log(`   ✨ Category "${category.title}" created (${newCat.id})`);
                }
            } catch (err) {
                console.error(`Error syncing category "${category.title}":`, err.response?.data || err.message);
                results.errors.push(`Category "${category.title}": ${err.response?.data?.message || err.message}`);
            }
        }

        // ================================================================
        // STEP 3: Match/create items
        // ================================================================
        console.log('🍵 Syncing menu items...');

        for (const category of menuData) {
            const cloverCategoryId = categoryIdMap[category.id];

            for (const sub of category.subcategories) {
                for (const item of sub.items) {
                    try {
                        const normalizedName = normalizeName(item.name);
                        const existingItem = cloverItemMap[normalizedName];
                        const websitePriceCents = Math.round(item.basePrice * 100);

                        if (existingItem) {
                            // ─── MATCH FOUND: item exists in Clover ───
                            const priceChanged = existingItem.price !== websitePriceCents;

                            if (priceChanged) {
                                // Update price in Clover to match the website
                                await cloverRequest(
                                    merchantId,
                                    `v3/merchants/${merchantId}/items/${existingItem.id}`,
                                    'POST',
                                    {
                                        name: item.name,
                                        price: websitePriceCents,
                                        ...(item.description ? { description: item.description } : {}),
                                    }
                                );
                                results.updated.push({
                                    name: item.name,
                                    local_id: item.id,
                                    clover_id: existingItem.id,
                                    clover_name: existingItem.name,
                                    old_price: (existingItem.price / 100).toFixed(2),
                                    new_price: item.basePrice.toFixed(2),
                                });
                                console.log(`   🔄 "${item.name}" matched & price updated: $${(existingItem.price/100).toFixed(2)} → $${item.basePrice.toFixed(2)}`);
                            } else {
                                results.matched.push({
                                    name: item.name,
                                    local_id: item.id,
                                    clover_id: existingItem.id,
                                    clover_name: existingItem.name,
                                    price: item.basePrice.toFixed(2),
                                });
                                console.log(`   ✅ "${item.name}" matched to existing "${existingItem.name}" ($${(existingItem.price/100).toFixed(2)})`);
                            }

                            // Save/update the mapping in our database
                            await client.query(
                                `INSERT INTO menu_item_mappings (local_item_id, clover_item_id, clover_category_id, merchant_id, item_name)
                                 VALUES ($1, $2, $3, $4, $5)
                                 ON CONFLICT (local_item_id, merchant_id) DO UPDATE SET
                                   clover_item_id = EXCLUDED.clover_item_id,
                                   clover_category_id = EXCLUDED.clover_category_id,
                                   item_name = EXCLUDED.item_name,
                                   synced_at = CURRENT_TIMESTAMP`,
                                [item.id, existingItem.id, cloverCategoryId || null, merchantId, item.name]
                            );

                        } else {
                            // ─── NO MATCH: item is new — create it in Clover ───
                            const newItem = await createCloverItem(merchantId, item, cloverCategoryId);

                            // Save mapping
                            await client.query(
                                `INSERT INTO menu_item_mappings (local_item_id, clover_item_id, clover_category_id, merchant_id, item_name)
                                 VALUES ($1, $2, $3, $4, $5)
                                 ON CONFLICT (local_item_id, merchant_id) DO UPDATE SET
                                   clover_item_id = EXCLUDED.clover_item_id,
                                   clover_category_id = EXCLUDED.clover_category_id,
                                   item_name = EXCLUDED.item_name,
                                   synced_at = CURRENT_TIMESTAMP`,
                                [item.id, newItem.id, cloverCategoryId || null, merchantId, item.name]
                            );

                            results.created.push({
                                name: item.name,
                                local_id: item.id,
                                clover_id: newItem.id,
                            });
                            console.log(`   ✨ "${item.name}" created in Clover (${newItem.id})`);
                        }

                    } catch (err) {
                        console.error(`Error syncing item "${item.name}":`, err.response?.data || err.message);
                        results.errors.push(`Item "${item.name}": ${err.response?.data?.message || err.message}`);
                    }
                }
            }
        }

        // ================================================================
        // Summary
        // ================================================================
        console.log('\n📊 Sync complete!');
        console.log(`   Matched: ${results.matched.length}, Created: ${results.created.length}, Updated: ${results.updated.length}, Errors: ${results.errors.length}`);

        res.json({
            status: 'success',
            merchant_id: merchantId,
            summary: {
                items_matched: results.matched.length,
                items_created: results.created.length,
                items_updated: results.updated.length,
                categories_matched: results.categories_matched.length,
                categories_created: results.categories_created.length,
                errors: results.errors.length,
            },
            details: results,
        });

    } catch (error) {
        console.error('Menu sync error:', error);
        res.status(500).json({ error: error.message || 'Menu sync failed' });
    } finally {
        client.release();
    }
});

// GET /api/admin/menu-sync/status — Check sync status
router.get('/status', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT local_item_id, clover_item_id, item_name, merchant_id, synced_at FROM menu_item_mappings ORDER BY synced_at DESC'
        );
        res.json({ synced_items: result.rows.length, items: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper: Create an item in Clover and assign to category
async function createCloverItem(merchantId, item, cloverCategoryId) {
    const newItem = await cloverRequest(
        merchantId,
        `v3/merchants/${merchantId}/items`,
        'POST',
        {
            name: item.name,
            price: Math.round(item.basePrice * 100),
            ...(item.description ? { description: item.description } : {}),
            defaultTaxRates: true,
        }
    );

    // Associate with category if we have one
    if (cloverCategoryId) {
        try {
            await cloverRequest(
                merchantId,
                `v3/merchants/${merchantId}/category_items`,
                'POST',
                {
                    elements: [
                        { category: { id: cloverCategoryId }, item: { id: newItem.id } }
                    ]
                }
            );
        } catch (catErr) {
            console.warn(`Could not associate item "${item.name}" with category:`, catErr.response?.data || catErr.message);
        }
    }

    return newItem;
}

module.exports = router;
