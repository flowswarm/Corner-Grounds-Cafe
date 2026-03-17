const axios = require('axios');
const { pool } = require('../../_lib/db');
const { CLOVER_BASE_URL } = require('../../_lib/helpers');

module.exports = async (req, res) => {
  const { merchant_id, code } = req.query;

  if (!merchant_id || !code) {
    return res.status(400).send('Missing merchant_id or code');
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.get(`${CLOVER_BASE_URL}/oauth/v2/token`, {
      params: {
        client_id: process.env.CLOVER_CLIENT_ID,
        client_secret: process.env.CLOVER_CLIENT_SECRET,
        code: code,
      },
    });

    const {
      access_token,
      access_token_expiration,
      refresh_token,
      refresh_token_expiration,
    } = tokenResponse.data;

    // Store in database
    const client = await pool.connect();
    try {
      // Ensure table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS clover_connections (
          id SERIAL PRIMARY KEY,
          merchant_id VARCHAR(255) UNIQUE NOT NULL,
          access_token TEXT NOT NULL,
          access_token_expiration BIGINT,
          refresh_token TEXT,
          refresh_token_expiration BIGINT,
          timezone VARCHAR(50) DEFAULT 'UTC',
          notification_email VARCHAR(255),
          lead_time_minutes INTEGER DEFAULT 20,
          slot_interval_minutes INTEGER DEFAULT 10,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

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
        [
          merchant_id,
          access_token,
          access_token_expiration + Date.now(),
          refresh_token,
          refresh_token_expiration + Date.now(),
        ]
      );
    } finally {
      client.release();
    }

    res.redirect(
      302,
      `${process.env.BASE_URL}/admin/connect-clover?success=true&merchantId=${merchant_id}`
    );
  } catch (error) {
    console.error(
      'Clover OAuth Error:',
      error.response?.data || error.message
    );
    res.status(500).send('Authentication Failed');
  }
};
