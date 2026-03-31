const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
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
        charge_id VARCHAR(255),
        pickup_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_settings (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        notify_orders BOOLEAN DEFAULT true,
        notify_connections BOOLEAN DEFAULT true,
        notify_site_changes BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS menu_item_mappings (
        id SERIAL PRIMARY KEY,
        local_item_id VARCHAR(255) NOT NULL,
        clover_item_id VARCHAR(255) NOT NULL,
        clover_category_id VARCHAR(255),
        merchant_id VARCHAR(255) NOT NULL,
        item_name VARCHAR(255),
        synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(local_item_id, merchant_id)
      );

      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS smtp_config (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) NOT NULL DEFAULT 'gmail',
        smtp_host VARCHAR(255) NOT NULL,
        smtp_port INTEGER NOT NULL DEFAULT 587,
        smtp_secure BOOLEAN NOT NULL DEFAULT false,
        smtp_user VARCHAR(255) NOT NULL,
        smtp_pass TEXT NOT NULL,
        from_name VARCHAR(255) DEFAULT 'Corner Grounds Cafe',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add notification columns to orders table (safe idempotent ALTERs)
    const alterStatements = [
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_reminder_sent BOOLEAN DEFAULT false`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_json JSONB`,
    ];
    for (const stmt of alterStatements) {
        try { await client.query(stmt); } catch (e) { /* column may already exist */ }
    }

        // Seed default admin credentials if none exist
        const adminCheck = await client.query('SELECT COUNT(*) FROM admin_credentials');
        if (parseInt(adminCheck.rows[0].count) === 0) {
            const defaultHash = await bcrypt.hash('1234', 10);
            await client.query(
                'INSERT INTO admin_credentials (username, password_hash) VALUES ($1, $2)',
                ['1234', defaultHash]
            );
            console.log('🔑 Default admin credentials created (username: 1234, password: 1234)');
        }

        client.release();
        console.log('Database schema initialized');

    } catch (err) {
        console.error('Database connection error:', err);
    }
};

module.exports = { pool, connectDB };
