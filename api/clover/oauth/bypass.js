module.exports = (req, res) => {
  const merchant_id = 'MOCK_MERCHANT_ID';
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  res.redirect(
    302,
    `${baseUrl}/admin/connect-clover?success=true&merchantId=${merchant_id}`
  );
};
