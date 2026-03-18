const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sendTestEmail } = require('../emailService');

// GET /api/admin/email/settings — Get all email notification settings
router.get('/settings', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT id, email, notify_orders, notify_connections, notify_site_changes, is_verified, updated_at FROM email_settings ORDER BY created_at DESC'
        );
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching email settings:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/email/settings — Save or update email notification settings
router.post('/settings', async (req, res) => {
    const { email, notify_orders, notify_connections, notify_site_changes } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required' });
    }

    try {
        const client = await pool.connect();
        try {
            // Upsert: insert or update if email already exists
            const result = await client.query(
                `INSERT INTO email_settings (email, notify_orders, notify_connections, notify_site_changes)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email)
                 DO UPDATE SET
                   notify_orders = EXCLUDED.notify_orders,
                   notify_connections = EXCLUDED.notify_connections,
                   notify_site_changes = EXCLUDED.notify_site_changes,
                   updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [
                    email,
                    notify_orders !== false,
                    notify_connections !== false,
                    notify_site_changes !== false,
                ]
            );
            res.json({ status: 'success', settings: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error saving email settings:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/email/test — Send a test email
router.post('/test', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required' });
    }

    try {
        await sendTestEmail(email);
        // Mark as verified in DB
        const client = await pool.connect();
        try {
            await client.query(
                'UPDATE email_settings SET is_verified = true WHERE email = $1',
                [email]
            );
        } finally {
            client.release();
        }
        res.json({ status: 'success', message: `Test email sent to ${email}` });
    } catch (err) {
        console.error('Error sending test email:', err);
        res.status(500).json({
            error: 'Failed to send test email. Check your SMTP configuration.',
            details: err.message,
        });
    }
});

// DELETE /api/admin/email/settings/:id — Remove an email entry
router.delete('/settings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM email_settings WHERE id = $1', [id]);
            res.json({ status: 'success', message: 'Email setting removed' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error deleting email setting:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
