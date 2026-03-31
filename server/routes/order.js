const express = require('express');
const router = express.Router();
const axios = require('axios');
const { cloverRequest, getCloverAccessToken } = require('../clover');
const { pool } = require('../db');
const { sendOrderNotification } = require('../emailService');

const CLOVER_ENV = (process.env.CLOVER_ENV || 'sandbox').trim();
const ECOM_BASE_URL = CLOVER_ENV === 'production'
    ? 'https://scl.clover.com'
    : 'https://scl-sandbox.dev.clover.com';

// GET /api/order/pickup-slots
router.get('/pickup-slots', (req, res) => {
    const slots = [];
    const startHour = 8;
    const endHour = 17;

    for (let h = startHour; h < endHour; h++) {
        const hour = h < 10 ? `0${h}` : h;
        slots.push(`${hour}:00`, `${hour}:15`, `${hour}:30`, `${hour}:45`);
    }

    res.json({ slots });
});

// POST /api/order/checkout — Full payment processing
router.post('/checkout', async (req, res) => {
    const { merchantId, customer, pickup, tip, cart, sourceToken } = req.body;

    if (!merchantId || !cart || cart.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields (merchantId and cart)' });
    }

    if (!sourceToken) {
        return res.status(400).json({ status: 'error', message: 'Missing payment token. Please enter card details.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('💳 Checkout request:', { merchantId, customerName: customer?.name, cartItems: cart.length, hasToken: !!sourceToken });

        // ================================================================
        // STEP 1: Calculate totals
        // ================================================================
        let calculatedTotal = cart.reduce((sum, item) => sum + Math.round(item.price * 100 * item.qty), 0);
        let tipAmount = 0;
        if (tip && tip.type === 'percent') {
            tipAmount = Math.round(calculatedTotal * (tip.value / 100));
        } else if (tip && tip.value) {
            tipAmount = Math.round(tip.value * 100);
        }
        const finalTotal = calculatedTotal + tipAmount;
        console.log('💰 Order total:', finalTotal, 'cents (subtotal:', calculatedTotal, '+ tip:', tipAmount, ')');

        // ================================================================
        // STEP 2: Create Order with Line Items FIRST via Clover v3 API
        // This ensures the receipt shows actual product names, not "Item 1".
        // ================================================================
        let cloverOrderId = null;
        try {
            // 2a. Create the order shell
            let orderTitle = `Online - ${customer?.name || 'Guest'}`;
            if (pickup?.slotISO) orderTitle += ` (${pickup.slotISO})`;
            if (orderTitle.length > 127) orderTitle = orderTitle.substring(0, 124) + '...';

            let orderNote = `Online Order | ${customer?.name || 'Guest'}`;
            if (customer?.phone) orderNote += ` | ${customer.phone}`;
            if (customer?.email) orderNote += ` | ${customer.email}`;
            if (pickup?.slotISO) orderNote += ` | Pickup: ${pickup.slotISO}`;
            if (orderNote.length > 255) orderNote = orderNote.substring(0, 252) + '...';

            const orderData = await cloverRequest(
                merchantId,
                `v3/merchants/${merchantId}/orders`,
                'POST',
                {
                    state: 'open',
                    title: orderTitle,
                    note: orderNote,
                }
            );
            cloverOrderId = orderData.id;
            console.log('📦 Created order:', cloverOrderId);

            // 2b. Add each cart item as line items
            // Clover truncates `name` at 127 chars and `note` doesn't show on receipts.
            // Clover also does NOT display line items in creation order.
            // Solution: product name as main priced line item, each customization as a
            // separate $0 line item prefixed with the product name so they sort together.
            console.log('📋 Adding detailed line items:');
            for (const c of cart) {
                let itemName = c.name || c.itemId;
                if (itemName.length > 127) itemName = itemName.substring(0, 124) + '...';

                // Main item with price
                const created = await cloverRequest(
                    merchantId,
                    `v3/merchants/${merchantId}/orders/${cloverOrderId}/line_items`,
                    'POST',
                    {
                        name: itemName,
                        price: Math.round(c.price * 100),
                        unitQty: c.qty * 1000,
                    }
                );
                console.log('  ✓ Product:', itemName, '→', created.id);

                // Add each customization as a separate $0 line item
                // Prefix with product name so they group together on the receipt
                if (c.options && typeof c.options === 'object') {
                    for (const [key, value] of Object.entries(c.options)) {
                        if (!value || value === '' || value === false) continue;

                        let detail = '';

                        if (key === '__size') {
                            const sizeVal = typeof value === 'object' && value.option ? value.option : value;
                            detail = `Size: ${sizeVal}`;
                        } else if (typeof value === 'object' && !Array.isArray(value) && value.option) {
                            const optionName = value.option.replace(/\s*\+\$[\d.]+$/, '').trim();
                            if (value.quantity && value.quantity > 1) {
                                detail = `${optionName} ×${value.quantity}`;
                            } else {
                                detail = optionName;
                            }
                        } else if (typeof value === 'string') {
                            if (['none', 'no', 'default', 'regular'].includes(value.toLowerCase())) continue;
                            detail = value;
                        } else if (Array.isArray(value)) {
                            const filtered = value.filter(v => v && v !== 'None');
                            if (filtered.length === 0) continue;
                            detail = filtered.join(', ');
                        } else if (value === true) {
                            detail = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        } else {
                            continue;
                        }

                        if (detail) {
                            // Prefix with product name so items group on receipt
                            let custText = `${itemName} → ${detail}`;
                            if (custText.length > 127) custText = custText.substring(0, 124) + '...';
                            try {
                                await cloverRequest(
                                    merchantId,
                                    `v3/merchants/${merchantId}/orders/${cloverOrderId}/line_items`,
                                    'POST',
                                    { name: custText, price: 0 }
                                );
                                console.log('    ✓ Customization:', custText);
                            } catch (custErr) {
                                console.error('    ✗ Customization failed:', custText, custErr.message);
                            }
                        }
                    }
                }
            }
            console.log('✅ Order created with detailed line items');

        } catch (orderErr) {
            console.error('❌ Order creation failed:', orderErr.response?.data || orderErr.message);
            // Fall back to charge-only — receipt will show generic "Item 1" instead of product names
            console.warn('⚠️ FALLBACK: Clover order creation failed — payment will proceed as a standalone charge. Receipt will NOT show item names (will show "Item 1"). Check Clover API logs above.');
        }

        // ================================================================
        // STEP 3: Process Payment
        // If we have an order ID, use /v1/orders/{id}/pay (receipt shows items)
        // If not, fall back to /v1/charges (receipt shows generic "Item 1")
        // ================================================================
        let chargeResult = null;

        try {
            const ecomPrivateToken = process.env.CLOVER_ECOM_PRIVATE_TOKEN;
            if (!ecomPrivateToken) {
                throw new Error('Clover Ecommerce private token not configured');
            }

            console.log('💳 Processing payment...');

            // Helper: standalone /v1/charges (fallback when no order ID or /pay endpoint fails)
            const runStandaloneCharge = async () => {
                let chargeDescription = cart.map(c => `${c.qty}x ${c.name}`).join(', ')
                    + ` | ${pickup?.slotISO || 'ASAP'} | ${customer?.name || 'Guest'}`;
                if (chargeDescription.length > 255) {
                    chargeDescription = chargeDescription.substring(0, 252) + '...';
                }

                const chargePayload = {
                    amount: finalTotal,
                    currency: 'usd',
                    source: sourceToken,
                    ecomind: 'ecom',
                    capture: true,
                    description: chargeDescription,
                    ...(tipAmount > 0 ? { tip_amount: tipAmount } : {}),
                    ...(customer?.email ? { receipt_email: customer.email } : {}),
                };

                console.log('💳 Charging card (standalone)...');
                const chargeResponse = await axios.post(
                    `${ECOM_BASE_URL}/v1/charges`,
                    chargePayload,
                    {
                        headers: {
                            'Authorization': `Bearer ${ecomPrivateToken}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000,
                    }
                );

                return chargeResponse.data;
            };

            if (cloverOrderId) {
                // ── Pay for the existing order (preferred — receipt shows items) ──
                const payPayload = {
                    source: sourceToken,
                    email: customer?.email || undefined,
                    ...(tipAmount > 0 ? { tip_amount: tipAmount } : {}),
                };

                console.log('💳 Paying for order:', cloverOrderId);
                try {
                    const payResponse = await axios.post(
                        `${ECOM_BASE_URL}/v1/orders/${cloverOrderId}/pay`,
                        payPayload,
                        {
                            headers: {
                                'Authorization': `Bearer ${ecomPrivateToken}`,
                                'Content-Type': 'application/json',
                            },
                            timeout: 30000,
                        }
                    );
                    chargeResult = payResponse.data;
                    console.log('✅ Payment successful! ID:', chargeResult.id, 'Status:', chargeResult.status);
                } catch (payErr) {
                    const payErrData = payErr.response?.data;
                    const payStatus = payErr.response?.status;
                    // 402 = card declined — surface to customer, do not retry
                    if (payStatus === 402 || payErrData?.error?.type === 'card_error') {
                        throw payErr;
                    }
                    // Any other error (404, 422, 5xx) means the /pay endpoint can't handle this order.
                    // Fall back to standalone charge so the customer isn't left hanging.
                    console.warn('⚠️ /v1/orders/{id}/pay failed (status', payStatus, '):', payErrData || payErr.message);
                    console.warn('⚠️ FALLBACK: Retrying as standalone charge — receipt will show "Item 1"');
                    chargeResult = await runStandaloneCharge();
                    console.log('✅ Standalone charge successful! ID:', chargeResult.id);
                }
            } else {
                // ── Fallback: standalone charge (no order ID available) ──
                chargeResult = await runStandaloneCharge();
                console.log('✅ Charge successful! ID:', chargeResult.id, 'Status:', chargeResult.status);
            }

        } catch (chargeErr) {
            const errData = chargeErr.response?.data;
            console.error('❌ Payment failed:', JSON.stringify(errData) || chargeErr.message);

            // If we created an order but payment failed, try to delete the order
            if (cloverOrderId) {
                try {
                    await cloverRequest(
                        merchantId,
                        `v3/merchants/${merchantId}/orders/${cloverOrderId}`,
                        'DELETE'
                    );
                    console.log('🗑️ Deleted unpaid order:', cloverOrderId);
                } catch (delErr) {
                    console.error('⚠️ Could not delete unpaid order:', delErr.message);
                }
            }

            await client.query('ROLLBACK');

            return res.status(402).json({
                status: 'error',
                message: errData?.error?.message || errData?.message || 'Payment was declined. Please check your card details and try again.',
                code: errData?.error?.code || 'charge_failed',
            });
        }

        // ================================================================
        // STEP 4: Parse pickup time
        // ================================================================
        let pickupTimestamp = new Date();
        if (pickup?.slotISO) {
            const timeMatch = pickup.slotISO.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const mins = parseInt(timeMatch[2]);
                const ampm = timeMatch[3];
                if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                pickupTimestamp.setHours(hours, mins, 0, 0);
            }
        }

        // ================================================================
        // STEP 5: Save to local DB
        // ================================================================
        await client.query(
            `INSERT INTO orders (clover_order_id, merchant_id, customer_email, customer_name, customer_phone, total_amount, status, pickup_time, charge_id, confirmation_sent, cart_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                cloverOrderId || ('LOCAL_' + Date.now()),
                merchantId,
                customer?.email,
                customer?.name,
                customer?.phone,
                finalTotal,
                'PAID',
                pickupTimestamp.toISOString(),
                chargeResult?.id || null,
                false,
                JSON.stringify(cart),
            ]
        );

        await client.query('COMMIT');
        console.log('✅ Order saved to DB');

        // ================================================================
        // STEP 6: Send admin email notifications
        // ================================================================
        try {
            const emailResult = await client.query(
                'SELECT email FROM email_settings WHERE notify_orders = true'
            );
            for (const row of emailResult.rows) {
                sendOrderNotification(row.email, {
                    orderId: cloverOrderId || chargeResult?.id,
                    customerName: customer?.name,
                    customerEmail: customer?.email,
                    total: finalTotal,
                    pickupTime: pickup?.slotISO,
                    items: cart,
                }).catch(err => console.error('Failed to send order email to', row.email, err));
            }
        } catch (emailErr) {
            console.error('Error querying email settings for order notification:', emailErr);
        }

        // ================================================================
        // STEP 7: Send CUSTOMER confirmation email
        // (SMS is handled natively by Clover's transactional messaging)
        // ================================================================
        if (customer?.email) {
            const { sendCustomerOrderConfirmation } = require('../emailService');
            const orderDetailsForCustomer = {
                orderId: cloverOrderId || chargeResult?.id,
                customerName: customer?.name,
                total: finalTotal,
                tipAmount: tipAmount,
                pickupTime: pickup?.slotISO,
                cart: cart,
            };
            sendCustomerOrderConfirmation(customer.email, orderDetailsForCustomer)
                .then(() => console.log('📧 Customer confirmation email sent to', customer.email))
                .catch(err => console.error('❌ Customer email failed:', err.message));
        }

        res.json({
            status: 'success',
            orderId: cloverOrderId || chargeResult?.id,
            chargeId: chargeResult?.id,
            total: finalTotal,
            message: 'Payment processed successfully!',
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Checkout Error:', error);
        res.status(500).json({ status: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
        client.release();
    }
});

module.exports = router;
