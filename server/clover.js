const axios = require('axios');
const { pool } = require('./db');

const CLOVER_API_URL = process.env.CLOVER_ENV === 'production'
    ? 'https://api.clover.com'
    : 'https://sandbox.dev.clover.com';

// Update access token if expired
const getCloverAccessToken = async (merchantId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM clover_connections WHERE merchant_id = $1', [merchantId]);
        if (res.rows.length === 0) throw new Error('Merchant not found');

        const connection = res.rows[0];
        const now = Date.now();

        // Check if token expires in less than 2 minutes
        if (connection.access_token_expiration && (connection.access_token_expiration - now < 120000)) {
            console.log('Refreshing Clover access token...');
            const response = await axios.get(`${process.env.CLOVER_ENV === 'production' ? 'https://www.clover.com' : 'https://sandbox.dev.clover.com'}/oauth/v2/refresh`, {
                params: {
                    client_id: process.env.CLOVER_CLIENT_ID,
                    client_secret: process.env.CLOVER_CLIENT_SECRET,
                    refresh_token: connection.refresh_token,
                },
            });

            const { access_token, access_token_expiration, refresh_token, refresh_token_expiration } = response.data;

            await client.query(
                `UPDATE clover_connections 
         SET access_token = $1, access_token_expiration = $2, refresh_token = $3, refresh_token_expiration = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE merchant_id = $5`,
                [access_token, access_token_expiration + now, refresh_token, refresh_token_expiration + now, merchantId]
            );

            return access_token;
        }

        return connection.access_token;
    } catch (error) {
        console.error('Error getting/refreshing Clover token:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Generic Clover API request
const cloverRequest = async (merchantId, endpoint, method = 'GET', data = null) => {
    const token = await getCloverAccessToken(merchantId);
    try {
        const response = await axios({
            method,
            url: `${CLOVER_API_URL}/v3/merchants/${merchantId}/${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data,
        });
        return response.data;
    } catch (error) {
        console.error(`Clover API Error (${endpoint}):`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = { getCloverAccessToken, cloverRequest };
