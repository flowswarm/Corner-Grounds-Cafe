const nodemailer = require('nodemailer');
const { pool } = require('./db');

// ================================================================
// Provider presets — auto-detected from email domain
// ================================================================
const PROVIDER_PRESETS = {
    gmail: {
        name: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        note: 'Requires an App Password (enable 2FA first at myaccount.google.com/apppasswords)',
    },
    outlook: {
        name: 'Outlook / Hotmail',
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        note: 'Use your regular Outlook/Hotmail password or an app password',
    },
    yahoo: {
        name: 'Yahoo Mail',
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        note: 'Generate an App Password at login.yahoo.com → Account Security → App Passwords',
    },
    icloud: {
        name: 'iCloud Mail',
        host: 'smtp.mail.me.com',
        port: 587,
        secure: false,
        note: 'Generate an App-Specific Password at appleid.apple.com',
    },
    custom: {
        name: 'Custom SMTP',
        host: '',
        port: 587,
        secure: false,
        note: 'Enter your SMTP server details from your email hosting provider',
    },
};

/**
 * Auto-detect provider from email domain
 */
const detectProvider = (email) => {
    if (!email) return 'custom';
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'custom';

    if (domain === 'gmail.com' || domain === 'googlemail.com') return 'gmail';
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com' || domain === 'msn.com') return 'outlook';
    if (domain === 'yahoo.com' || domain === 'ymail.com' || domain === 'rocketmail.com') return 'yahoo';
    if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') return 'icloud';

    return 'custom';
};

/**
 * Get SMTP config from database, fall back to env vars
 */
const getSmtpConfig = async () => {
    try {
        const result = await pool.query('SELECT * FROM smtp_config ORDER BY id DESC LIMIT 1');
        if (result.rows.length > 0) {
            const config = result.rows[0];
            return {
                host: config.smtp_host,
                port: config.smtp_port,
                secure: config.smtp_secure,
                user: config.smtp_user,
                pass: config.smtp_pass,
                fromName: config.from_name || 'Corner Grounds Cafe',
                provider: config.provider,
                isVerified: config.is_verified,
            };
        }
    } catch (err) {
        console.error('Error loading SMTP config from DB:', err.message);
    }

    // Fallback to environment variables
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: parseInt(process.env.SMTP_PORT || '587') === 465,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            fromName: 'Corner Grounds Cafe',
            provider: 'env',
            isVerified: true,
        };
    }

    return null; // No config available
};

/**
 * Create a nodemailer transporter from DB or env config
 */
const createTransporter = async () => {
    const config = await getSmtpConfig();
    if (!config) {
        throw new Error('Email not configured. Please set up SMTP in Admin → Email Notifications.');
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
};

// Shared HTML wrapper with café branding
const wrapInTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;border-bottom:2px solid #d6d3d1;">
      <h1 style="margin:0;font-size:28px;color:#292524;font-family:'Georgia',serif;letter-spacing:1px;">
        Corner Grounds Café
      </h1>
      <p style="margin:4px 0 0;font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:3px;">
        Admin Notification
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px 0;">
      <h2 style="margin:0 0 16px;font-size:22px;color:#292524;">${title}</h2>
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e7e5e4;padding:16px 0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a8a29e;">
        This is an automated notification from your Corner Grounds Café admin system.
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send a generic email
 */
const sendEmail = async (to, subject, html) => {
    const config = await getSmtpConfig();
    if (!config) {
        console.log(`📧 Email skipped (SMTP not configured): ${subject} → ${to}`);
        return null;
    }

    const transporter = await createTransporter();
    const fromAddress = `${config.fromName} <${config.user}>`;

    const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
    });

    console.log('📧 Email sent:', info.messageId, '→', to);
    return info;
};

/**
 * Send order notification email
 */
const sendOrderNotification = async (to, orderDetails) => {
    const { orderId, customerName, customerEmail, total, pickupTime, items } = orderDetails;

    let itemsHtml = '';
    if (items && items.length > 0) {
        itemsHtml = `
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
                <tr style="border-bottom:2px solid #d6d3d1;">
                    <th style="text-align:left;padding:8px;color:#57534e;font-size:13px;">Item</th>
                    <th style="text-align:center;padding:8px;color:#57534e;font-size:13px;">Qty</th>
                    <th style="text-align:right;padding:8px;color:#57534e;font-size:13px;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr style="border-bottom:1px solid #e7e5e4;">
                        <td style="padding:8px;color:#292524;">${item.name || 'Item'}</td>
                        <td style="text-align:center;padding:8px;color:#292524;">${item.qty || 1}</td>
                        <td style="text-align:right;padding:8px;color:#292524;">$${(item.price * (item.qty || 1)).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
    }

    const bodyContent = `
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;color:#166534;font-weight:bold;font-size:16px;">📦 New Online Order Received</p>
        </div>

        <div style="margin-bottom:16px;">
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Customer:</strong> ${customerName || 'N/A'}</p>
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Pickup Time:</strong> ${pickupTime || 'ASAP'}</p>
        </div>

        ${itemsHtml}

        <div style="background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:16px;text-align:right;">
            <p style="margin:0;font-size:20px;color:#292524;font-weight:bold;">Total: $${(total / 100).toFixed(2)}</p>
        </div>
    `;

    const html = wrapInTemplate('New Online Order', bodyContent);
    return sendEmail(to, `📦 New Order #${orderId} — Corner Grounds Café`, html);
};

/**
 * Send Clover connection notification
 */
const sendConnectionNotification = async (to, merchantId) => {
    const bodyContent = `
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;color:#166534;font-weight:bold;font-size:16px;">🔗 Clover POS Connected Successfully</p>
        </div>

        <div style="margin-bottom:16px;">
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Merchant ID:</strong> ${merchantId}</p>
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Connected At:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="color:#78716c;font-size:14px;line-height:1.6;">
            Your Clover POS system has been successfully connected to your Corner Grounds Café website. 
            You can now accept online orders that sync directly with your point-of-sale system.
        </p>
    `;

    const html = wrapInTemplate('Clover Connection Confirmed', bodyContent);
    return sendEmail(to, `🔗 Clover POS Connected — Corner Grounds Café`, html);
};

/**
 * Send site change/update notification
 */
const sendSiteChangeNotification = async (to, changeDescription) => {
    const bodyContent = `
        <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;color:#92400e;font-weight:bold;font-size:16px;">🔄 Website Update Detected</p>
        </div>

        <div style="margin-bottom:16px;">
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Change:</strong> ${changeDescription}</p>
            <p style="margin:4px 0;color:#57534e;font-size:14px;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="color:#78716c;font-size:14px;line-height:1.6;">
            A change has been made to your Corner Grounds Café website. Please review the updates at your earliest convenience.
        </p>
    `;

    const html = wrapInTemplate('Website Update', bodyContent);
    return sendEmail(to, `🔄 Website Updated — Corner Grounds Café`, html);
};

/**
 * Send a test email to verify SMTP configuration
 */
const sendTestEmail = async (to) => {
    const bodyContent = `
        <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;color:#1e40af;font-weight:bold;font-size:16px;">✅ Test Email Successful</p>
        </div>

        <p style="color:#57534e;font-size:14px;line-height:1.6;">
            This is a test email from your Corner Grounds Café admin dashboard. 
            If you're reading this, your email notifications are configured correctly!
        </p>

        <p style="color:#78716c;font-size:13px;margin-top:16px;">
            You will receive notifications for:
        </p>
        <ul style="color:#78716c;font-size:13px;">
            <li>📦 Online order confirmations</li>
            <li>🔗 Clover POS connection changes</li>
            <li>🔄 Website updates and modifications</li>
        </ul>
    `;

    const html = wrapInTemplate('Test Notification', bodyContent);
    return sendEmail(to, `✅ Test Email — Corner Grounds Café`, html);
};

// Customer-facing HTML wrapper (warmer, customer-oriented tone)
const wrapInCustomerTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 24px;background:linear-gradient(135deg,#292524 0%,#44403c 100%);border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:28px;color:#fafaf9;font-family:'Georgia',serif;letter-spacing:1px;">
        Corner Grounds Café
      </h1>
      <p style="margin:8px 0 0;font-size:13px;color:#a8a29e;letter-spacing:2px;text-transform:uppercase;">
        ☕ Handcrafted with care
      </p>
    </div>

    <!-- Body -->
    <div style="background-color:#ffffff;padding:32px 24px;border-left:1px solid #e7e5e4;border-right:1px solid #e7e5e4;">
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="background-color:#f5f5f4;border:1px solid #e7e5e4;border-top:none;border-radius:0 0 12px 12px;padding:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#78716c;">
        Corner Grounds Café • Smyrna, Delaware
      </p>
      <p style="margin:0;font-size:11px;color:#a8a29e;">
        Thank you for choosing Corner Grounds! We look forward to serving you. ☕
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send order confirmation email to CUSTOMER
 */
const sendCustomerOrderConfirmation = async (to, orderDetails) => {
    const { orderId, customerName, total, tipAmount, pickupTime, cart } = orderDetails;

    // Build items table
    let itemsHtml = '';
    if (cart && cart.length > 0) {
        const rows = cart.map(item => {
            let optionsHtml = '';
            if (item.options && typeof item.options === 'object') {
                const optParts = [];
                for (const [key, value] of Object.entries(item.options)) {
                    if (!value || value === '' || value === false) continue;
                    if (key === '__size') {
                        const sizeVal = typeof value === 'object' && value.option ? value.option : value;
                        optParts.push(`Size: ${sizeVal}`);
                    } else if (typeof value === 'object' && value.option) {
                        const name = value.option.replace(/\\s*\\+\\$[\\d.]+$/, '').trim();
                        optParts.push(value.quantity > 1 ? `${name} ×${value.quantity}` : name);
                    } else if (typeof value === 'string' && !['none', 'no', 'default', 'regular'].includes(value.toLowerCase())) {
                        optParts.push(value);
                    }
                }
                if (optParts.length > 0) {
                    optionsHtml = `<br/><span style="font-size:12px;color:#78716c;">${optParts.join(' • ')}</span>`;
                }
            }
            return `
                <tr style="border-bottom:1px solid #f5f5f4;">
                    <td style="padding:12px 8px;color:#292524;font-size:14px;">
                        ${item.name || 'Item'}${optionsHtml}
                    </td>
                    <td style="text-align:center;padding:12px 8px;color:#57534e;font-size:14px;">${item.qty || 1}</td>
                    <td style="text-align:right;padding:12px 8px;color:#292524;font-size:14px;font-weight:600;">$${(item.price * (item.qty || 1)).toFixed(2)}</td>
                </tr>`;
        }).join('');

        itemsHtml = `
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
                <tr style="border-bottom:2px solid #292524;">
                    <th style="text-align:left;padding:8px;color:#292524;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Item</th>
                    <th style="text-align:center;padding:8px;color:#292524;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                    <th style="text-align:right;padding:8px;color:#292524;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Price</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    const subtotal = total - (tipAmount || 0);
    const bodyContent = `
        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;margin-bottom:12px;">
                ✓
            </div>
            <h2 style="margin:0;font-size:24px;color:#292524;font-family:'Georgia',serif;">Order Confirmed!</h2>
            <p style="margin:4px 0 0;font-size:14px;color:#78716c;">Thank you${customerName ? `, ${customerName}` : ''}!</p>
        </div>

        <!-- Pickup Time Banner -->
        <div style="background:linear-gradient(135deg,#292524 0%,#44403c 100%);border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:2px;">Pickup Time</p>
            <p style="margin:0;font-size:22px;color:#fafaf9;font-weight:bold;">${pickupTime || 'ASAP'}</p>
        </div>

        <!-- Order ID -->
        <div style="background-color:#f5f5f4;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
            <p style="margin:0;font-size:12px;color:#78716c;">Order Number</p>
            <p style="margin:2px 0 0;font-size:16px;color:#292524;font-weight:bold;letter-spacing:1px;">${orderId || 'N/A'}</p>
        </div>

        <!-- Items -->
        ${itemsHtml}

        <!-- Total -->
        <div style="border-top:2px solid #292524;padding-top:16px;margin-top:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:14px;color:#57534e;">Subtotal</span>
                <span style="font-size:14px;color:#292524;">$${(subtotal / 100).toFixed(2)}</span>
            </div>
            ${tipAmount > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:14px;color:#57534e;">Tip</span>
                <span style="font-size:14px;color:#292524;">$${(tipAmount / 100).toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #e7e5e4;">
                <span style="font-size:18px;color:#292524;font-weight:bold;">Total</span>
                <span style="font-size:18px;color:#292524;font-weight:bold;">$${(total / 100).toFixed(2)}</span>
            </div>
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:#78716c;text-align:center;line-height:1.6;">
            We're preparing your order with care. Head to Corner Grounds Café at your scheduled pickup time — we'll have it ready for you!
        </p>
    `;

    const html = wrapInCustomerTemplate('Order Confirmed ☕', bodyContent);
    return sendEmail(to, `☕ Order Confirmed — Corner Grounds Café`, html);
};

/**
 * Send pickup reminder email to CUSTOMER
 */
const sendCustomerPickupReminder = async (to, orderDetails) => {
    const { orderId, customerName, pickupTime } = orderDetails;

    const bodyContent = `
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;margin-bottom:12px;">☕</div>
            <h2 style="margin:0;font-size:24px;color:#292524;font-family:'Georgia',serif;">Your Order is Almost Ready!</h2>
            <p style="margin:8px 0 0;font-size:14px;color:#78716c;">
                Hey${customerName ? ` ${customerName}` : ''}! Just a heads up — your order will be ready shortly.
            </p>
        </div>

        <!-- Pickup Time Banner -->
        <div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:2px;">Head Over Now</p>
            <p style="margin:0;font-size:26px;color:#ffffff;font-weight:bold;">Pickup at ${pickupTime || 'Now'}</p>
        </div>

        <div style="background-color:#f5f5f4;border-radius:6px;padding:12px 16px;margin-bottom:20px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#78716c;">Order Number</p>
            <p style="margin:2px 0 0;font-size:16px;color:#292524;font-weight:bold;letter-spacing:1px;">${orderId || 'N/A'}</p>
        </div>

        <p style="margin:16px 0 0;font-size:13px;color:#78716c;text-align:center;line-height:1.6;">
            Your handcrafted drinks and treats are being prepared with love. We can't wait to see you! 🎉
        </p>
    `;

    const html = wrapInCustomerTemplate('Your Order is Ready! ☕', bodyContent);
    return sendEmail(to, `☕ Pickup Reminder — Your Order is Almost Ready!`, html);
};

module.exports = {
    sendEmail,
    sendOrderNotification,
    sendConnectionNotification,
    sendSiteChangeNotification,
    sendTestEmail,
    sendCustomerOrderConfirmation,
    sendCustomerPickupReminder,
    detectProvider,
    getSmtpConfig,
    PROVIDER_PRESETS,
};
