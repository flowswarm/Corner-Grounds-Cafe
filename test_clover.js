require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const conn = (await pool.query('SELECT * FROM clover_connections LIMIT 1')).rows[0];
    const now = Date.now();

    console.log('Refreshing via POST /oauth/v2/refresh (JSON body)...');
    try {
        const r = await axios.post('https://sandbox.dev.clover.com/oauth/v2/refresh', {
            client_id: process.env.CLOVER_CLIENT_ID,
            refresh_token: conn.refresh_token,
        }, { headers: { 'Content-Type': 'application/json' } });

        console.log('Response:', JSON.stringify(r.data));
        const { access_token, access_token_expiration, refresh_token, refresh_token_expiration } = r.data;
        const newExpiry = access_token_expiration + now;
        const newRefreshExpiry = refresh_token_expiration ? refresh_token_expiration + now : Number(conn.refresh_token_expiration);

        await pool.query(
            'UPDATE clover_connections SET access_token=$1, access_token_expiration=$2, refresh_token=$3, refresh_token_expiration=$4, updated_at=CURRENT_TIMESTAMP WHERE merchant_id=$5',
            [access_token, newExpiry, refresh_token || conn.refresh_token, newRefreshExpiry, conn.merchant_id]
        );
        console.log('Token saved! Expires:', new Date(newExpiry).toLocaleString());

        // Quick verification
        const v3H = { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' };
        const test = await axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}`, { headers: v3H });
        console.log('Merchant name:', test.data.name, '- TOKEN WORKS!');

        // Test full order flow
        const order = await axios.post(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}/orders`,
            { state: 'open', title: 'RECEIPT FIX TEST' }, { headers: v3H });
        console.log('Order created:', order.data.id);
        await axios.post(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}/orders/${order.data.id}/line_items`,
            { name: 'Cold Brew (Vanilla x3)', price: 550, unitQty: 1000 }, { headers: v3H });
        await axios.post(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}/orders/${order.data.id}/line_items`,
            { name: 'Bagel Cream Cheese', price: 450, unitQty: 2000 }, { headers: v3H });
        console.log('2 line items added');

        // Verify
        const v = await axios.get(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}/orders/${order.data.id}?expand=lineItems`, { headers: v3H });
        console.log('Items:', v.data.lineItems?.elements?.map(li => li.name));

        // Test /pay
        const ecomH = { 'Authorization': `Bearer ${process.env.CLOVER_ECOM_PRIVATE_TOKEN}`, 'Content-Type': 'application/json' };
        try {
            await axios.post(`https://scl-sandbox.dev.clover.com/v1/orders/${order.data.id}/pay`, { source: 'FAKE' }, { headers: ecomH });
        } catch (pe) {
            console.log('/pay status:', pe.response?.status, pe.response?.data?.error?.code || pe.response?.data?.message);
            if (pe.response?.status === 400) console.log('CONFIRMED: /v1/orders/pay WORKS with v3 orders!');
            if (pe.response?.status === 404) console.log('PROBLEM: /pay cannot find v3 orders');
        }

        // Cleanup
        await axios.delete(`https://apisandbox.dev.clover.com/v3/merchants/${conn.merchant_id}/orders/${order.data.id}`, { headers: v3H });
        console.log('Cleaned up test order');
    } catch (e) {
        console.error('FAILED:', e.response?.status, JSON.stringify(e.response?.data));
    }

    await pool.end();
}
main().catch(e => console.error('Fatal:', e.message));
