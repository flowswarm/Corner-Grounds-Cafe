const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sendTestEmail, detectProvider, getSmtpConfig, PROVIDER_PRESETS } = require('../emailService');

// ================================================================
// SMTP Configuration Endpoints
// ================================================================

// GET /api/admin/email/smtp — Get current SMTP config (password masked)
router.get('/smtp', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM smtp_config ORDER BY id DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.json({ configured: false, providers: PROVIDER_PRESETS });
        }
        const config = result.rows[0];
        res.json({
            configured: true,
            provider: config.provider,
            smtp_host: config.smtp_host,
            smtp_port: config.smtp_port,
            smtp_secure: config.smtp_secure,
            smtp_user: config.smtp_user,
            smtp_pass_set: true, // Never send actual password back
            from_name: config.from_name,
            is_verified: config.is_verified,
            updated_at: config.updated_at,
            providers: PROVIDER_PRESETS,
        });
    } catch (err) {
        console.error('Error fetching SMTP config:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/email/smtp — Save/update SMTP configuration
router.post('/smtp', async (req, res) => {
    const { email, password, provider, smtp_host, smtp_port, smtp_secure, from_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password/app password are required' });
    }

    // Auto-detect provider if not specified
    const detectedProvider = provider || detectProvider(email);
    const preset = PROVIDER_PRESETS[detectedProvider] || PROVIDER_PRESETS.custom;

    // Use preset values for known providers, allow overrides for custom
    const host = detectedProvider === 'custom' ? (smtp_host || '') : preset.host;
    const port = detectedProvider === 'custom' ? (smtp_port || 587) : preset.port;
    const secure = detectedProvider === 'custom' ? (smtp_secure || false) : preset.secure;
    const name = from_name || 'Corner Grounds Cafe';

    if (!host) {
        return res.status(400).json({ error: 'SMTP host is required for custom providers' });
    }

    try {
        // Delete any existing config and insert new one (single config row)
        await pool.query('DELETE FROM smtp_config');
        const result = await pool.query(
            `INSERT INTO smtp_config (provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, is_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *`,
            [detectedProvider, host, port, secure, email, password, name]
        );

        console.log(`📧 SMTP configured: ${detectedProvider} (${email} via ${host}:${port})`);
        res.json({
            status: 'success',
            provider: detectedProvider,
            provider_name: preset.name,
            smtp_host: host,
            smtp_port: port,
            message: `SMTP configured for ${preset.name}. Send a test email to verify.`,
        });
    } catch (err) {
        console.error('Error saving SMTP config:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/email/smtp/detect — Auto-detect provider from email
router.post('/smtp/detect', (req, res) => {
    const { email } = req.body;
    const provider = detectProvider(email);
    const preset = PROVIDER_PRESETS[provider];
    res.json({ provider, ...preset });
});

// DELETE /api/admin/email/smtp — Remove SMTP configuration
router.delete('/smtp', async (req, res) => {
    try {
        await pool.query('DELETE FROM smtp_config');
        console.log('📧 SMTP configuration removed');
        res.json({ status: 'success', message: 'SMTP configuration removed' });
    } catch (err) {
        console.error('Error removing SMTP config:', err);
        res.status(500).json({ error: err.message });
    }
});

// ================================================================
// Email Settings (notification recipients) Endpoints
// ================================================================

// GET /api/admin/email/settings — Get all email notification settings
router.get('/settings', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, notify_orders, notify_connections, notify_site_changes, is_verified, updated_at FROM email_settings ORDER BY created_at DESC'
        );
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
        const result = await pool.query(
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

    // Check SMTP config exists
    const smtpConfig = await getSmtpConfig();
    if (!smtpConfig) {
        return res.status(400).json({
            error: 'SMTP not configured. Please set up your email provider first (Step 1).',
        });
    }

    try {
        await sendTestEmail(email);
        // Mark SMTP as verified
        await pool.query('UPDATE smtp_config SET is_verified = true, updated_at = CURRENT_TIMESTAMP');
        // Mark email recipient as verified
        await pool.query(
            'UPDATE email_settings SET is_verified = true WHERE email = $1',
            [email]
        );
        res.json({ status: 'success', message: `Test email sent to ${email}` });
    } catch (err) {
        console.error('Error sending test email:', err);
        res.status(500).json({
            error: 'Failed to send test email. Check your SMTP credentials.',
            details: err.message,
        });
    }
});

// DELETE /api/admin/email/settings/:id — Remove an email entry
router.delete('/settings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM email_settings WHERE id = $1', [id]);
        res.json({ status: 'success', message: 'Email setting removed' });
    } catch (err) {
        console.error('Error deleting email setting:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
