const { Pool } = require('pg');

// Vercel serverless functions are stateless, so we create the pool
// at module level. It gets reused across warm invocations.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit connections in serverless
});

module.exports = { pool };
