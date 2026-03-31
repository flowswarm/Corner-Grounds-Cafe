const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db');

const CLOVER_ENV = (process.env.CLOVER_ENV || 'sandbox').trim();
const CLOVER_API_URL = CLOVER_ENV === 'production'
    ? 'https://api.clover.com'
    : 'https://apisandbox.dev.clover.com';

// GET /api/admin/clover-health — Comprehensive connection & permissions check
router.get('/', async (req, res) => {
    const result = {
        connected: false,
        merchant_id: null,
        token_valid: false,
        token_expires_in: null,   // minutes remaining
        token_expires_at: null,   // ISO date string
        has_refresh_token: false,
        permissions: {
            read_merchant: false,
            read_inventory: false,
            write_inventory: false,
            read_orders: false,
            write_orders: false,
        },
        all_ready: false,
        errors: [],
    };

    try {
        // 1. Check if we have a stored connection
        const connResult = await pool.query('SELECT * FROM clover_connections LIMIT 1');
        if (connResult.rows.length === 0) {
            result.errors.push('No Clover merchant connected');
            return res.json(result);
        }

        const conn = connResult.rows[0];
        result.connected = true;
        result.merchant_id = conn.merchant_id;
        result.has_refresh_token = !!conn.refresh_token;

        // 2. Check token expiration
        const now = Date.now();
        const expiration = Number(conn.access_token_expiration);
        if (expiration && expiration > now) {
            result.token_expires_in = Math.round((expiration - now) / 1000 / 60); // minutes
            result.token_expires_at = new Date(expiration).toISOString();
            result.token_valid = true;
        } else if (expiration && expiration <= now) {
            result.token_expires_at = new Date(expiration).toISOString();
            result.errors.push('Access token is expired — reconnect to Clover');
            return res.json(result);
        }

        const token = conn.access_token;
        const merchantId = conn.merchant_id;
        const headers = { 'Authorization': `Bearer ${token}` };

        // 3. Test READ_MERCHANT
        try {
            await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchantId}`, { headers, timeout: 8000 });
            result.permissions.read_merchant = true;
        } catch (e) {
            result.errors.push(`Read Merchant: ${e.response?.status} ${e.response?.data?.message || e.message}`);
        }

        // 4. Test READ_INVENTORY (categories)
        try {
            await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchantId}/categories?limit=1`, { headers, timeout: 8000 });
            result.permissions.read_inventory = true;
        } catch (e) {
            result.errors.push(`Read Inventory: ${e.response?.status} ${e.response?.data?.message || e.message}`);
        }

        // 5. Test WRITE_INVENTORY (create + delete a test item)
        try {
            const testItem = await axios.post(`${CLOVER_API_URL}/v3/merchants/${merchantId}/items`, 
                { name: '__health_check_test__', price: 0 },
                { headers: { ...headers, 'Content-Type': 'application/json' }, timeout: 8000 }
            );
            result.permissions.write_inventory = true;
            // Clean up — delete the test item
            try {
                await axios.delete(`${CLOVER_API_URL}/v3/merchants/${merchantId}/items/${testItem.data.id}`, { headers, timeout: 8000 });
            } catch (_) { /* ignore cleanup errors */ }
        } catch (e) {
            result.errors.push(`Write Inventory: ${e.response?.status} ${e.response?.data?.message || e.message}`);
        }

        // 6. Test READ_ORDERS
        try {
            await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchantId}/orders?limit=1`, { headers, timeout: 8000 });
            result.permissions.read_orders = true;
        } catch (e) {
            result.errors.push(`Read Orders: ${e.response?.status} ${e.response?.data?.message || e.message}`);
        }

        // 7. Test WRITE_ORDERS (create + delete a test order)
        try {
            const testOrder = await axios.post(`${CLOVER_API_URL}/v3/merchants/${merchantId}/orders`,
                { title: '__health_check_test__', state: 'open' },
                { headers: { ...headers, 'Content-Type': 'application/json' }, timeout: 8000 }
            );
            result.permissions.write_orders = true;
            // Clean up — delete the test order
            try {
                await axios.delete(`${CLOVER_API_URL}/v3/merchants/${merchantId}/orders/${testOrder.data.id}`, { headers, timeout: 8000 });
            } catch (_) { /* ignore cleanup errors */ }
        } catch (e) {
            result.errors.push(`Write Orders: ${e.response?.status} ${e.response?.data?.message || e.message}`);
        }

        // 8. Determine if all required permissions are met
        const p = result.permissions;
        result.all_ready = p.read_merchant && p.read_inventory && p.write_inventory && p.read_orders && p.write_orders;

    } catch (error) {
        result.errors.push(`Health check error: ${error.message}`);
    }

    res.json(result);
});

// DELETE /api/admin/clover-health — Disconnect from Clover
router.delete('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Remove menu item mappings
        await client.query('DELETE FROM menu_item_mappings');
        // Remove the Clover connection
        await client.query('DELETE FROM clover_connections');
        await client.query('COMMIT');
        console.log('🔌 Clover disconnected — connection and mappings removed');
        res.json({ status: 'ok', message: 'Disconnected from Clover' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to disconnect:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
