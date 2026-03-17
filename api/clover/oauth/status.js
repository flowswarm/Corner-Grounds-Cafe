const { pool } = require('../../_lib/db');

module.exports = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Ensure table exists (in case status is called before any connection)
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

      const result = await client.query(
        'SELECT merchant_id, updated_at FROM clover_connections'
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Status check error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
