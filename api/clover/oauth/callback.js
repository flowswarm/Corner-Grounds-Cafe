const axios = require('axios');
const { pool } = require('../../_lib/db');
const { CLOVER_API_URL } = require('../../_lib/helpers');

module.exports = async (req, res) => {
  const { merchant_id, code } = req.query;

  if (!merchant_id || !code) {
    return res.status(400).send('Missing merchant_id or code');
  }

  try {
    // Exchange authorization code for access token — uses API domain, NOT web domain
    const tokenResponse = await axios.post(`${CLOVER_API_URL}/oauth/v2/token`, {
      client_id: process.env.CLOVER_CLIENT_ID,
      client_secret: process.env.CLOVER_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
    }, {
      headers: { 'Content-Type': 'application/json' },
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

    // Validate the token by making a test API call
    let permissionsValid = true;
    try {
      await axios.get(`${CLOVER_API_URL}/v3/merchants/${merchant_id}`, {
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
      }
    }

    if (permissionsValid) {
      res.redirect(302, `${process.env.BASE_URL}/admin/connect-clover?success=true&merchantId=${merchant_id}`);
    } else {
      res.redirect(302, `${process.env.BASE_URL}/admin/connect-clover?success=true&merchantId=${merchant_id}&permissions=missing`);
    }
  } catch (error) {
    console.error('Clover OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication Failed');
  }
};
