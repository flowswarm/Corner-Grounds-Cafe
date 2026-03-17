const { CLOVER_BASE_URL } = require('../../_lib/helpers');

module.exports = (req, res) => {
  const redirectUri = `${CLOVER_BASE_URL}/oauth/v2/authorize?client_id=${process.env.CLOVER_CLIENT_ID}&redirect_uri=${process.env.CLOVER_REDIRECT_URI}`;
  res.redirect(302, redirectUri);
};
