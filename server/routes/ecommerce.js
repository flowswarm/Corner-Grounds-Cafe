const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/ecommerce/pak — Return the Clover ecommerce public token for frontend SDK
router.get('/pak', async (req, res) => {
    try {
        const publicToken = process.env.CLOVER_ECOM_PUBLIC_TOKEN;
        if (!publicToken) {
            return res.status(500).json({ error: 'Clover Ecommerce public token not configured' });
        }

        // Get the merchant ID from the connection
        const connResult = await pool.query('SELECT merchant_id FROM clover_connections LIMIT 1');
        const merchantId = connResult.rows.length > 0 ? connResult.rows[0].merchant_id : null;

        console.log('Returning Clover ecommerce public token for SDK initialization');
        res.json({
            apiAccessKey: publicToken,
            merchantId,
        });

    } catch (error) {
        console.error('Failed to fetch ecommerce key:', error.message);
        res.status(500).json({
            error: 'Failed to fetch ecommerce API key',
            details: error.message,
        });
    }
});

module.exports = router;
