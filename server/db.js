const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');

        // Initialize Schema
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

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        clover_order_id VARCHAR(255),
        merchant_id VARCHAR(255),
        customer_email VARCHAR(255),
        total_amount INTEGER, -- in cents
        status VARCHAR(50),
        pickup_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        client.release();
        console.log('Database schema initialized');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

module.exports = { pool, connectDB };
