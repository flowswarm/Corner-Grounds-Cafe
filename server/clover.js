const axios = require('axios');
const { pool } = require('./db');

const CLOVER_ENV = (process.env.CLOVER_ENV || 'sandbox').trim();
const CLOVER_API_URL = CLOVER_ENV === 'production'
    ? 'https://api.clover.com'
    : 'https://apisandbox.dev.clover.com';
// OAuth endpoints (authorize, token exchange, refresh) live on the web domain, not the API domain
const CLOVER_WEB_URL = CLOVER_ENV === 'production'
    ? 'https://www.clover.com'
    : 'https://sandbox.dev.clover.com';

/**
 * Get a valid Clover access token for a merchant.
 * Automatically refreshes if expired or about to expire.
 */
const getCloverAccessToken = async (merchantId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM clover_connections WHERE merchant_id = $1', [merchantId]);
        if (res.rows.length === 0) throw new Error('Merchant not found in clover_connections');

        const connection = res.rows[0];
        const now = Date.now();
        const expiration = connection.access_token_expiration ? Number(connection.access_token_expiration) : 0;

        // Check if token needs refresh (expired, or expires within 5 minutes)
        const needsRefresh = !connection.access_token || expiration === 0 || (expiration - now < 300000);

        if (needsRefresh && connection.refresh_token) {
            console.log('🔄 Refreshing Clover access token (expired or expiring soon)...');
            try {
                // Clover sandbox requires POST /oauth/v2/refresh with JSON body
                // containing client_id + refresh_token (NOT query params, NOT /oauth/v2/token)
                const response = await axios.post(`${CLOVER_WEB_URL}/oauth/v2/refresh`, {
                    client_id: process.env.CLOVER_CLIENT_ID,
                    refresh_token: connection.refresh_token,
                }, {
                    headers: { 'Content-Type': 'application/json' },
                });
                console.log('✅ Token refresh succeeded via POST /oauth/v2/refresh');

                const { access_token, access_token_expiration, refresh_token, refresh_token_expiration } = response.data;

                // Store the new tokens — use the same formula as the initial OAuth storage in auth.js
                // (treat the returned value as milliseconds-from-now and add to current timestamp)
                const newAccessExpiry = access_token_expiration + now;
                const newRefreshExpiry = refresh_token_expiration
                    ? (refresh_token_expiration + now)
                    : Number(connection.refresh_token_expiration) || 0;

                await client.query(
                    `UPDATE clover_connections 
                     SET access_token = $1, access_token_expiration = $2, 
                         refresh_token = $3, refresh_token_expiration = $4, 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE merchant_id = $5`,
                    [access_token, newAccessExpiry, refresh_token || connection.refresh_token, newRefreshExpiry, merchantId]
                );

                console.log('✅ Token refreshed successfully. New expiry:', new Date(newAccessExpiry).toLocaleString());
                return access_token;
            } catch (refreshErr) {
                console.error('❌ Token refresh failed:', refreshErr.response?.data || refreshErr.message);
                // If refresh fails but we still have a token, try using it anyway
                if (connection.access_token) {
                    console.log('⚠️ Using existing (possibly expired) token as fallback');
                    return connection.access_token;
                }
                throw new Error('Token refresh failed and no existing token available. Please reconnect to Clover.');
            }
        }

        if (!needsRefresh) {
            const minutesLeft = Math.round((expiration - now) / 60000);
            console.log(`🔑 Using existing token (expires in ${minutesLeft} min)`);
        } else {
            console.log('⚠️ Token may be expired and no refresh token available. Using existing token.');
        }

        return connection.access_token;
    } catch (error) {
        console.error('Error getting/refreshing Clover token:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Make a request to the Clover v3 API with automatic retry on 401.
 * If a 401 is received, forces a token refresh and retries once.
 */
const cloverRequest = async (merchantId, endpoint, method = 'GET', data = null, _isRetry = false) => {
    const token = await getCloverAccessToken(merchantId);
    const url = `${CLOVER_API_URL}/${endpoint}`;
    console.log(`[CloverAPI] ${method} ${url}`);

    try {
        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data,
        });
        return response.data;
    } catch (error) {
        console.error(`[CloverAPI] Error ${error.response?.status} on ${method} ${url}`);
        console.error(`[CloverAPI] Response:`, JSON.stringify(error.response?.data));

        // On 401, try forcing a token refresh and retrying once
        if (error.response?.status === 401 && !_isRetry) {
            console.log('🔄 Got 401 — forcing token refresh and retrying...');
            // Invalidate the current token by setting expiration to 0
            try {
                const client = await pool.connect();
                try {
                    await client.query(
                        'UPDATE clover_connections SET access_token_expiration = 0 WHERE merchant_id = $1',
                        [merchantId]
                    );
                } finally {
                    client.release();
                }
            } catch (dbErr) {
                console.error('Failed to invalidate token:', dbErr.message);
            }
            return cloverRequest(merchantId, endpoint, method, data, true);
        }

        throw error;
    }
};

module.exports = { getCloverAccessToken, cloverRequest };
