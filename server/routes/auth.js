const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db');
const { sendConnectionNotification } = require('../emailService');

const CLOVER_ENV = process.env.CLOVER_ENV || 'sandbox';
const CLOVER_BASE_URL = CLOVER_ENV === 'production' ? 'https://www.clover.com' : 'https://sandbox.dev.clover.com';

// Step 1: Redirect to Clover for OAuth
router.get('/start', (req, res) => {
    const redirectUri = `${CLOVER_BASE_URL}/oauth/v2/authorize?client_id=${process.env.CLOVER_CLIENT_ID}&redirect_uri=${process.env.CLOVER_REDIRECT_URI}`;
    res.redirect(redirectUri);
});

// Step 2: Handle Callback
router.get('/callback', async (req, res) => {
    const { merchant_id, code } = req.query;

    if (!merchant_id || !code) {
        return res.status(400).send('Missing merchant_id or code');
    }

    try {
        // Exchange code for token
        const tokenResponse = await axios.get(`${CLOVER_BASE_URL}/oauth/v2/token`, {
            params: {
                client_id: process.env.CLOVER_CLIENT_ID,
                client_secret: process.env.CLOVER_CLIENT_SECRET,
                code: code,
            },
        });

        const { access_token, access_token_expiration, refresh_token, refresh_token_expiration } = tokenResponse.data;

        // Store in DB
        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO clover_connections (merchant_id, access_token, access_token_expiration, refresh_token, refresh_token_expiration)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (merchant_id) 
         DO UPDATE SET 
           access_token = EXCLUDED.access_token,
           access_token_expiration = EXCLUDED.access_token_expiration,
           refresh_token = EXCLUDED.refresh_token,
           refresh_token_expiration = EXCLUDED.refresh_token_expiration,
           updated_at = CURRENT_TIMESTAMP`,
                [merchant_id, access_token, access_token_expiration + Date.now(), refresh_token, refresh_token_expiration + Date.now()]
            );
        } finally {
            client.release();
        }

        // Send connection notification emails
        try {
            const emailResult = await pool.query(
                'SELECT email FROM email_settings WHERE notify_connections = true'
            );
            for (const row of emailResult.rows) {
                sendConnectionNotification(row.email, merchant_id)
                    .catch(err => console.error('Failed to send connection email to', row.email, err));
            }
        } catch (emailErr) {
            console.error('Error querying email settings for connection notification:', emailErr);
        }

        res.redirect(`${process.env.BASE_URL}/admin/connect-clover?success=true&merchantId=${merchant_id}`);
    } catch (error) {
        console.error('Clover OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Authentication Failed');
    }
});

// Status check
router.get('/status', async (req, res) => {
    // For now, simplify logic to return checking connection for a hardcoded merchant or query param?
    // Since we're multi-tenant, we might need to pass the merchant ID or infer it.
    // Let's assume for this MVP user context, we check if ANY connection exists or specific one.
    // For admin UI, we'll list connections.
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT merchant_id, updated_at FROM clover_connections');
        client.release();
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mock Bypass for local testing (no DB required)
router.get('/bypass', (req, res) => {
    const merchant_id = 'MOCK_MERCHANT_ID';
    // Simply redirect back with success — no database needed
    res.redirect(`http://localhost:3000/admin/connect-clover?success=true&merchantId=${merchant_id}`);
});

module.exports = router;
