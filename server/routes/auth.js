const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../db');
const { sendConnectionNotification } = require('../emailService');

const CLOVER_ENV = (process.env.CLOVER_ENV || 'sandbox').trim();
const CLOVER_BASE_URL = CLOVER_ENV === 'production' ? 'https://www.clover.com' : 'https://sandbox.dev.clover.com';
// Token/refresh endpoints use the API domain, NOT the web domain
const CLOVER_API_BASE_URL = CLOVER_ENV === 'production' ? 'https://api.clover.com' : 'https://apisandbox.dev.clover.com';

// Step 1: Redirect to Clover for OAuth
router.get('/start', (req, res) => {
    const redirectUri = `${CLOVER_BASE_URL}/oauth/v2/authorize?client_id=${process.env.CLOVER_CLIENT_ID}&redirect_uri=${process.env.CLOVER_REDIRECT_URI}`;
    res.redirect(redirectUri);
});

// Step 2: Handle Callback
router.get('/callback', async (req, res) => {
    console.log('Clover OAuth Callback - Full URL:', req.originalUrl);
    console.log('Clover OAuth Callback - Query params:', req.query);
    const { merchant_id, code } = req.query;

    if (!merchant_id || !code) {
        return res.status(400).send(`Missing merchant_id or code. Received params: ${JSON.stringify(req.query)}`);
    }

    try {
        // Exchange code for token
        const tokenResponse = await axios.post(`${CLOVER_API_BASE_URL}/oauth/v2/token`, {
            client_id: process.env.CLOVER_CLIENT_ID,
            client_secret: process.env.CLOVER_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
        }, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('=== CLOVER TOKEN RESPONSE ===');
        console.log('Full response data:', JSON.stringify(tokenResponse.data, null, 2));
        console.log('Response keys:', Object.keys(tokenResponse.data));

        const { access_token, access_token_expiration, refresh_token, refresh_token_expiration } = tokenResponse.data;
        
        console.log('access_token length:', access_token?.length);
        console.log('access_token (first 50):', access_token?.substring(0, 50));
        console.log('access_token_expiration:', access_token_expiration);
        console.log('has refresh_token:', !!refresh_token);

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

        // Validate the token by making a test API call
        let permissionsValid = true;
        try {
            await axios.get(`${CLOVER_API_BASE_URL}/v3/merchants/${merchant_id}`, {
                headers: { 'Authorization': `Bearer ${access_token}` },
                timeout: 10000,
            });
            console.log('✅ Clover token validated — merchant API access confirmed');
        } catch (validationErr) {
            const status = validationErr.response?.status;
            if (status === 401) {
                console.error('❌ Clover token validation FAILED — 401 Unauthorized. App likely missing required permissions.');
                permissionsValid = false;
            } else {
                console.warn('⚠️ Clover token validation returned non-401 error:', status, validationErr.response?.data);
                // Non-auth errors (network, 500, etc) — still consider connected, might be transient
            }
        }

        const redirectBase = process.env.BASE_URL || 'http://localhost:3000';
        if (permissionsValid) {
            const redirectUrl = `${redirectBase}/admin/connect-clover?success=true&merchantId=${merchant_id}`;
            console.log('✅ Redirecting to:', redirectUrl);
            res.redirect(redirectUrl);
        } else {
            const redirectUrl = `${redirectBase}/admin/connect-clover?success=true&merchantId=${merchant_id}&permissions=missing`;
            console.log('⚠️ Redirecting to (permissions missing):', redirectUrl);
            res.redirect(redirectUrl);
        }
    } catch (error) {
        const errorData = error.response?.data;
        const errorStatus = error.response?.status;
        console.error('=== CLOVER OAUTH ERROR ===');
        console.error('Token exchange URL:', `${CLOVER_API_BASE_URL}/oauth/v2/token`);
        console.error('Status:', errorStatus);
        console.error('Response:', JSON.stringify(errorData));
        console.error('Client ID:', process.env.CLOVER_CLIENT_ID);
        console.error('Redirect URI:', process.env.CLOVER_REDIRECT_URI);
        
        const errorMsg = errorData?.message || error.message || 'Unknown error';
        res.redirect(`${process.env.BASE_URL}/admin/connect-clover?error=${encodeURIComponent(errorMsg)}`);
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
    const redirectBase = process.env.BASE_URL || 'http://localhost:3000';
    res.redirect(`${redirectBase}/admin/connect-clover?success=true&merchantId=${merchant_id}`);
});

module.exports = router;
