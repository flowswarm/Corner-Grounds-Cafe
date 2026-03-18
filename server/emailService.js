const nodemailer = require('nodemailer');

// Create reusable transporter from environment variables
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: parseInt(process.env.SMTP_PORT || '587') === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
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
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || `Corner Grounds Cafe <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
    });

    console.log('Email sent:', info.messageId);
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
                        <td style="text-align:right;padding:8px;color:#292524;">$${((item.price * (item.qty || 1)) / 100).toFixed(2)}</td>
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

module.exports = {
    sendEmail,
    sendOrderNotification,
    sendConnectionNotification,
    sendSiteChangeNotification,
    sendTestEmail,
};
