const express = require('express');
const router = express.Router();

// SMS is handled natively by Clover's built-in transactional messaging.
// This route just returns status info for the admin UI.

// GET /api/admin/sms/config — placeholder status
router.get('/config', (req, res) => {
    res.json({
        provider: 'clover',
        message: 'SMS is managed through your Clover Dashboard under Customers → Promos.',
    });
});

module.exports = router;
