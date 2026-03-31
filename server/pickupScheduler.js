const { pool } = require('./db');
const { sendCustomerPickupReminder } = require('./emailService');

const REMINDER_MINUTES_BEFORE = 10;
const CHECK_INTERVAL_MS = 60 * 1000; // Every 60 seconds

/**
 * Check for upcoming pickups and send email reminders.
 * SMS reminders are handled natively by Clover's transactional messaging.
 */
const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        const reminderWindow = new Date(now.getTime() + REMINDER_MINUTES_BEFORE * 60 * 1000);

        // Find orders where pickup is within the next 10 minutes AND reminder hasn't been sent
        const result = await pool.query(
            `SELECT id, clover_order_id, customer_email, customer_name, 
                    pickup_time, cart_json, total_amount
             FROM orders 
             WHERE pickup_time IS NOT NULL 
               AND pickup_time <= $1 
               AND pickup_time >= $2
               AND pickup_reminder_sent = false 
               AND status = 'PAID'`,
            [reminderWindow.toISOString(), now.toISOString()]
        );

        if (result.rows.length === 0) return;

        console.log(`🔔 Found ${result.rows.length} order(s) due for pickup reminder`);

        for (const order of result.rows) {
            const pickupTime = new Date(order.pickup_time);
            const timeStr = pickupTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            const orderDetails = {
                orderId: order.clover_order_id,
                customerName: order.customer_name,
                pickupTime: timeStr,
            };

            // Send email reminder
            if (order.customer_email) {
                try {
                    await sendCustomerPickupReminder(order.customer_email, orderDetails);
                    console.log(`  📧 Pickup reminder email sent to ${order.customer_email}`);
                } catch (err) {
                    console.error(`  ❌ Pickup reminder email failed for ${order.customer_email}:`, err.message);
                }
            }

            // Mark reminder as sent
            await pool.query(
                'UPDATE orders SET pickup_reminder_sent = true WHERE id = $1',
                [order.id]
            );
        }
    } catch (err) {
        // Silently handle if table columns don't exist yet
        if (err.code === '42703' || err.code === '42P01') return;
        console.error('⏰ Pickup scheduler error:', err.message);
    }
};

/**
 * Start the pickup reminder scheduler
 */
const startPickupScheduler = () => {
    console.log(`⏰ Pickup reminder scheduler started (checking every ${CHECK_INTERVAL_MS / 1000}s, reminder ${REMINDER_MINUTES_BEFORE}min before pickup)`);
    
    // Run immediately on startup
    setTimeout(checkAndSendReminders, 5000);

    // Then run every 60 seconds
    setInterval(checkAndSendReminders, CHECK_INTERVAL_MS);
};

module.exports = { startPickupScheduler };
