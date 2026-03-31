const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// POST /api/admin/login — Verify admin credentials
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM admin_credentials WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        res.json({ status: 'ok', message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// PUT /api/admin/credentials — Change username and/or password
router.put('/credentials', async (req, res) => {
    const { currentUsername, currentPassword, newUsername, newPassword } = req.body;

    if (!currentUsername || !currentPassword) {
        return res.status(400).json({ status: 'error', message: 'Current credentials are required' });
    }

    if (!newUsername && !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Provide a new username and/or new password' });
    }

    try {
        // Verify current credentials
        const result = await pool.query('SELECT * FROM admin_credentials WHERE username = $1', [currentUsername]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Current credentials are incorrect' });
        }

        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Current credentials are incorrect' });
        }

        // Check if new username is already taken (by a different admin)
        if (newUsername && newUsername !== currentUsername) {
            const existing = await pool.query('SELECT id FROM admin_credentials WHERE username = $1 AND id != $2', [newUsername, admin.id]);
            if (existing.rows.length > 0) {
                return res.status(409).json({ status: 'error', message: 'Username already taken' });
            }
        }

        // Update credentials
        const updatedUsername = newUsername || currentUsername;
        const updatedHash = newPassword ? await bcrypt.hash(newPassword, 10) : admin.password_hash;

        await pool.query(
            'UPDATE admin_credentials SET username = $1, password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [updatedUsername, updatedHash, admin.id]
        );

        console.log(`🔑 Admin credentials updated (username: ${updatedUsername})`);
        res.json({ status: 'ok', message: 'Credentials updated successfully' });
    } catch (error) {
        console.error('Credential change error:', error.message);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

module.exports = router;
