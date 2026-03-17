const express = require('express');
const router = express.Router();
const { cloverRequest } = require('../clover');
const { pool } = require('../db');

// GET /api/pickup-slots
router.get('/pickup-slots', (req, res) => {
    const { date, merchantId } = req.query;

    // TODO: Fetch Merchant Opening Hours from Clover if available or use config
    // For now, we return fixed slots 8 AM to 5 PM
    const slots = [];
    const startHour = 8;
    const endHour = 17;

    for (let h = startHour; h < endHour; h++) {
        const hour = h < 10 ? `0${h}` : h;
        slots.push(`${hour}:00`, `${hour}:15`, `${hour}:30`, `${hour}:45`);
    }

    res.json({ slots });
});

// POST /api/order/checkout
router.post('/checkout', async (req, res) => {
    const { merchantId, customer, pickup, tip, cart, payment } = req.body;

    if (!merchantId || !cart || !payment || !payment.source) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create Atomic Order object
        // Map cart items to Clover line items
        // Note: Real implementation needs to verify Item IDs and prices with Clover Inventory
        // to prevent price tampering.
        const orderItems = cart.map(item => ({
            item: { id: item.itemId },
            price: item.price * item.qty, // This should normally be unit price
            // Clover atomic order structure is complex.
            // Simplified:
            // "items": [{"item": {"id": "..."}, "quantity": 1}]
        }));

        // 2. Call Clover to Create Atomic Order
        // POST /v3/merchants/{mId}/atomic_orders
        const atomicOrderPayload = {
            orderCart: {
                lineItems: cart.map(c => ({
                    item: { id: c.itemId },
                    unitQty: c.qty
                }))
            },
            orderType: { id: 'ONLINE_PICKUP' }, // Need to find valid Order Type ID
            title: `Online Order - ${customer.name}`,
            note: `Pickup at ${pickup.slotISO}`,
            // Add customer info...
        };

        // MOCK: Creating order locally since we can't hit real Clover API without valid tokens/IDs
        // const cloverOrder = await cloverRequest(merchantId, 'atomic_orders', 'POST', atomicOrderPayload);
        const cloverOrder = { id: 'CLV_' + Date.now(), total: 0 }; // Mock

        // 3. Calculate Totals (Clover does this in Atomic Order response)
        // total = cloverOrder.total + tip
        let calculatedTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0); // Mock total
        let tipAmount = 0;
        if (tip.type === 'percent') {
            tipAmount = Math.round(calculatedTotal * (tip.value / 100)); // in cents
        } else {
            tipAmount = Math.round(tip.value * 100);
        }
        const finalTotal = calculatedTotal + tipAmount;

        // 4. Pay for the Order
        // POST /v3/merchants/{mId}/orders/{orderId}/payments
        // OR use /v1/orders/{orderId}/pay with token
        const payPayload = {
            source: payment.source,
            amount: finalTotal,
            tipAmount: tipAmount,
            orderId: cloverOrder.id
        };

        // await cloverRequest(merchantId, 'payments', 'POST', payPayload);

        // 5. Save to local DB
        await client.query(
            `INSERT INTO orders (clover_order_id, merchant_id, customer_email, total_amount, status, pickup_time)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [cloverOrder.id, merchantId, customer.email, finalTotal, 'PAID', pickup.slotISO || new Date()]
        );

        await client.query('COMMIT');

        // 6. Send Notification (Email) - Placeholder

        res.json({ status: 'success', orderId: cloverOrder.id, total: finalTotal });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Checkout Error:', error);
        res.status(500).json({ status: 'error', message: 'Payment processing failed' });
    } finally {
        client.release();
    }
});

module.exports = router;
