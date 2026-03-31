const CLOVER_ENV = (process.env.CLOVER_ENV || 'sandbox').trim();

const CLOVER_BASE_URL =
  CLOVER_ENV === 'production'
    ? 'https://www.clover.com'
    : 'https://sandbox.dev.clover.com';

// Token, refresh, and REST API endpoints use the API domain
const CLOVER_API_URL =
  CLOVER_ENV === 'production'
    ? 'https://api.clover.com'
    : 'https://apisandbox.dev.clover.com';

module.exports = { CLOVER_ENV, CLOVER_BASE_URL, CLOVER_API_URL };
