# Clover Receipt Line Item Truncation — Fix Required

## The Product

Corner Grounds Cafe is an online ordering website for a cafe/restaurant. Customers browse a menu, customize drinks (size, milk, syrups, shots, toppings, etc.), add items to cart, review their order, select a pickup time, and pay — all in one seamless flow. On the business side, the cafe owner receives the order on their Clover POS system with full product names and customization details so they can prepare the order exactly as the customer specified.

## The Goal

A **complete, untruncated** line item display on the Clover receipt and orders dashboard so the barista/staff can see every customization the customer selected. This is critical — if customizations are cut off, the order cannot be prepared correctly.

**Success looks like this on the Clover receipt:**
```
Cold Brew                              $5.50
  → Size: Medium
  → Regular Ice
  → Splash of Cream
  → Liquid Cane Sugar ×2
  → Whipped Cream
  → Caramel Drizzle
  → Vanilla Sweet Cream Cold Foam

Latte                                  $5.50
  → Size: Large
  → Signature Roast
  → Oat Milk
  → Vanilla ×3
```

**What is currently happening (BROKEN):**
```
Latte (Signature Roast | Shots ×2 | 2% Milk | Classic Syrup ×2 | Sugar | Mocha Sauce ×3 | Whipped Cream | Mocha Drizzle | Si...     $5.50
```

All customizations are being concatenated into the line item `name` field, which Clover truncates at 127 characters. The last customizations are always cut off.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React/Vite)                                       │
│  pages/CheckoutPage.tsx → sends cart payload to server       │
│  context/CartContext.tsx → manages CartItem with options      │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/order/checkout
                           │ payload: { merchantId, customer, pickup, tip, sourceToken, cart[] }
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Express/Node)                                      │
│  server/routes/order.js  → checkout handler                  │
│  server/clover.js        → v3 API wrapper (auto token refresh│
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐    ┌─────────────────────────┐
│ Clover v3 REST API  │    │ Clover Ecommerce API    │
│ apisandbox.dev.     │    │ scl-sandbox.dev.        │
│ clover.com          │    │ clover.com              │
│                     │    │                         │
│ • Create orders     │    │ • /v1/orders/{id}/pay   │
│ • Add line items    │    │ • /v1/charges (fallback)│
│ • Uses OAuth token  │    │ • Uses ECOM_PRIVATE_TOKEN│
│   (auto-refreshing) │    │   (static .env token)   │
└─────────────────────┘    └─────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `server/routes/order.js` | **THE FILE TO FIX** — checkout handler, order creation, line items, payment |
| `server/clover.js` | Clover v3 API wrapper with OAuth token refresh (recently fixed) |
| `context/CartContext.tsx` | Cart state — defines `CartItem.selectedOptions` shape |
| `pages/CheckoutPage.tsx` | Frontend checkout — builds payload, sends to server |

### Cart Payload Shape (what the server receives)

```json
{
  "cart": [
    {
      "itemId": "cold-brew",
      "name": "Cold Brew",
      "qty": 1,
      "price": 5.50,
      "options": {
        "__size": { "option": "Medium" },
        "ice": { "option": "Regular Ice" },
        "milk": { "option": "Splash of Cream" },
        "sweetener": { "option": "Liquid Cane Sugar", "quantity": 2 },
        "toppings": { "option": "Whipped Cream" },
        "drizzle": { "option": "Caramel Drizzle" },
        "cold_foam": { "option": "Vanilla Sweet Cream Cold Foam +$0.60" }
      }
    }
  ]
}
```

The `options` object uses this structure:
- Key `__size` → special size field, value is `{ option: "Medium" }` or a string
- Other keys → `{ option: "display name", quantity?: number }`
- Quantity > 1 means multiples (e.g., "Vanilla ×3")
- Some values are plain strings (legacy format)
- Some values may contain price info like `"+$0.60"` — strip this for display

---

## What We Tried and What Broke

### Attempt 1: Concatenate into `name` field
```js
let itemName = c.name;
const opts = formatOptions(c.options); // returns "Signature Roast | Shots ×2 | 2% Milk | ..."
if (opts) itemName += ` (${opts})`;
// name = "Latte (Signature Roast | Shots ×2 | 2% Milk | Classic Syrup ×2 | Sugar | Mocha Sauce ×3 | Whipped Cream | Mocha Drizzle | Size: Medium)"
```
**Result:** Clover truncates `name` at 127 characters. Last customizations always cut off.

### Attempt 2: Use line item `note` field
```js
const lineItemData = { name: itemName, price: ..., note: opts };
```
**Result:** The `note` field does NOT display on Clover receipts or the orders dashboard. It's stored but invisible to staff.

### Attempt 3: Split customizations into separate $0 line items (CURRENT CODE)
```js
// Main product line item with price
await cloverRequest(..., { name: "Cold Brew", price: 550, unitQty: 1000 });

// Each customization as its own $0 line item
for (const [key, value] of Object.entries(c.options)) {
    await cloverRequest(..., { name: "  → Regular Ice", price: 0 });
}
```
**Result:** THE CODE IS IN `order.js` but the receipt STILL shows the concatenated format. This means either:
1. The dev server is serving a cached/stale version of `order.js`
2. The order creation with line items is failing silently and the fallback `/v1/charges` is creating the auto-order with the concatenated description
3. There is another codepath creating the line item with concatenated customizations

---

## The Specific Problem to Fix

The Clover receipt on `sandbox.dev.clover.com` STILL shows this:

```
Latte (Signature Roast | Shots ×2 | 2% Milk | Classic Syrup ×2 | Sugar | Mocha Sauce ×3 | Whipped Cream | Mocha Drizzle | Si...     $5.50
```

This is the `formatOptions()` output (pipe-delimited, parenthesized) being crammed into a single line item name. The code at lines 136-206 in `order.js` was updated to split customizations into separate $0 line items, but this is NOT what's showing up.

### Debugging Checklist

1. **Is the v3 order creation succeeding or silently failing?**
   - Check the server console logs. Look for `📦 Created order:` followed by `✓ Product:` and `✓ Customization:` entries.
   - If you see `❌ Order creation failed:` or `⚠️ FALLBACK:`, the order-first path is failing and `/v1/charges` is creating the auto-order.

2. **Is the OAuth token valid?**
   - We recently fixed the token refresh (it was expired with expiration=0). The refresh endpoint is `POST https://sandbox.dev.clover.com/oauth/v2/refresh` with `{ client_id, refresh_token }` in JSON body.
   - If the token expired again, order creation will 401 → silently fall back to `/v1/charges`.
   - Run: `SELECT access_token_expiration FROM clover_connections LIMIT 1;` — if it's 0 or in the past, the token needs refresh.

3. **Is `/v1/orders/{id}/pay` working or falling back to `/v1/charges`?**
   - Look for `💳 Paying for order:` in logs → success means receipts show line items
   - Look for `⚠️ FALLBACK: Retrying as standalone charge` → means `/pay` failed and `/v1/charges` created a generic "Item 1" order
   - `/v1/charges` ALWAYS creates its own auto-order with a single "Item 1" line item

4. **Is the `/v1/charges` fallback using `description` which gets shown as the line item name?**
   - The `runStandaloneCharge()` function builds a description like `1x Latte, 1x Cold Brew | 3:00 PM | John` — but this goes in the charge `description` field, not the line item name.
   - However: Clover's auto-created order from `/v1/charges` may use the `description` as the line item name, which would explain the concatenated text appearing on the receipt.

---

## What the Fixed Code Must Do

### The order creation in `server/routes/order.js` must:

1. **Create an order shell** via `POST /v3/merchants/{mId}/orders` with `{ state: 'open', title, note }`
2. **For each cart item**, create the product as a priced line item: `POST /v3/merchants/{mId}/orders/{orderId}/line_items` with `{ name: "Cold Brew", price: 550, unitQty: 1000 }`
3. **For each customization on that item**, create a separate $0 line item: `{ name: "  → Regular Ice", price: 0 }` — each customization gets its own line so nothing is truncated
4. **Pay for the order** via `POST /v1/orders/{orderId}/pay` with `{ source: cardToken }` using the ECOM_PRIVATE_TOKEN
5. **If any step fails**, log explicitly with `console.warn('⚠️ FALLBACK: ...')` and fall back to `/v1/charges`

### Clover API Constraints
- Line item `name` field: **127 characters max** — MUST NOT concatenate all customizations here
- Line item `note` field: **Does NOT display on receipts or orders dashboard** — useless for our purpose
- `/v1/charges` auto-creates its own order with a single generic "Item 1" line item — we cannot modify this after the fact
- Paid orders have **locked line items** — you cannot add/modify/delete line items after payment

### Token Refresh (recently fixed, verify it works)
- Endpoint: `POST https://sandbox.dev.clover.com/oauth/v2/refresh`
- Body: `{ "client_id": "...", "refresh_token": "..." }` (JSON, NOT query params)
- The old code used `GET` with query params which returns **405 Method Not Allowed**
- The old fallback used `POST /oauth/v2/token` with `grant_type` which returns **400 "code: must not be null"**
- This is in `server/clover.js` — verify the current code uses the correct POST approach

---

## How to Verify the Fix

1. Start the dev server: `npm run dev` from the project root
2. Open `http://localhost:3000/menu`
3. Add 2 different items with multiple customizations each (pick every option category to make names long)
4. Go through checkout with test card: `4005 5717 0222 2222` (any CVV, any future date)
5. Check the server console — you MUST see:
   ```
   📦 Created order: XXXXX
     ✓ Product: Cold Brew → YYYYY
       ✓ Customization:   → Size: Medium
       ✓ Customization:   → Regular Ice
       ✓ Customization:   → Splash of Cream
       ...
     ✓ Product: Latte → ZZZZZ
       ✓ Customization:   → Size: Large
       ...
   ✅ Order created with detailed line items
   💳 Paying for order: XXXXX
   ✅ Payment successful!
   ```
6. Check the Clover receipt at `https://sandbox.dev.clover.com/r/{orderId}` — each product should be its own line with price, and each customization should be listed separately below it
7. **If you see `⚠️ FALLBACK` in the logs, the fix is NOT working** — diagnose which step failed

---

## Environment Details

- **Project root:** `c:\Users\Foste\.gemini\antigravity\scratch\Corner-Grounds-Cafe`
- **Dev server:** `npm run dev` runs Vite frontend + Express backend concurrently
- **Database:** PostgreSQL (Supabase) — connection string in `.env` as `DATABASE_URL`
- **Clover sandbox merchant ID:** `SRF885FJY7FP1`
- **Key env vars:** `CLOVER_CLIENT_ID`, `CLOVER_CLIENT_SECRET`, `CLOVER_ECOM_PRIVATE_TOKEN`, `CLOVER_ECOM_PUBLIC_TOKEN`, `DATABASE_URL`
- **Test cards:** `4005 5717 0222 2222` (Visa), `5200 8282 8282 8210` (MC), `6011 3610 0000 6668` (Discover)
