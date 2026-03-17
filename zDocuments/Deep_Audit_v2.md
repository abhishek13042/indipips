# Indipips — Deep Audit v2 (Second Pass)
> Date: 18 March 2026 | Every critical file was read line-by-line.

---

## 🔍 NEW BUGS FOUND IN THIS AUDIT (Not in First Pass)

These are **real code bugs** discovered by reading every file. They are ranked by how badly they will break the platform.

### 🔴 BUGS THAT WILL CRASH THE APP RIGHT NOW

| # | Bug | Location | Line | What Breaks |
|---|---|---|---|---|
| 1 | `challenge.nodeAccountId` — **wrong field name** | `payout.controller.js` | L119 | Payout history page will crash with a DB error |
| 2 | `morgana` is **imported but never `app.use()`'d** | `server.js` | L4, never used | No HTTP request logs — blind in production |
| 3 | `Payment` model has **no `razorpayOrderId` field** | `schema.prisma` | Entire model | Razorpay payment creation crashes with Prisma error |
| 4 | `AdminDashboardPage` route has **no admin role check** | `App.jsx` | L52-56 | Any logged-in trader can access `/admin/matrix` |
| 5 | `getMarketPrice()` still returns **`Math.random()`** | `broker.service.js` | L109 | Live price check never uses the real Upstox feed |
| 6 | `upstoxFeed.service.js` `init()` is **never called** | `server.js` | Missing | Live feed never starts, even after broker is connected |

### 🟡 BUGS THAT BREAK SPECIFIC FEATURES

| # | Bug | Location | Line | What Breaks |
|---|---|---|---|---|
| 7 | Payout request has **no KYC verification check** | `payout.controller.js` | L63-107 | Traders who haven't done KYC can request payouts |
| 8 | Trade open checks `tradeType` from request body, but the field name is inconsistent between frontend and broker service | `trade.controller.js` | L12 vs `broker.service.js` L46 | Minor mismatch can cause confusing errors |
| 9 | `admin.controller.js` **has no payout approval endpoint** | `admin.controller.js` | Entire file | Admins cannot approve or reject pending payouts |
| 10 | Challenge `status` filter in admin passes raw string unchecked | `admin.controller.js` | L49 | Any typo in URL query (e.g., `active` vs `ACTIVE`) silently returns wrong data |
| 11 | `auth.controller.js` has **no `forgotPassword` or `resetPassword` handlers** | `auth.controller.js` | L330 | Locked-out traders have no recovery path |

### 🟢 ARCHITECTURE ISSUES (Before Week 8)

| # | Issue | Location | Risk |
|---|---|---|---|
| 12 | JWT secret falls back to hardcoded string in code | `auth.controller.js` L19 | If env vars fail, tokens are still issued with known secret |
| 13 | Challenge balance update on trade close uses `Number()` conversion on `BigInt` — could overflow for very large accounts | `trade.controller.js` L99 | Data corruption for accounts > $21M |
| 14 | No global error handler middleware in `server.js` — async errors may give ugly Express stack traces to users | `server.js` | Security info leak |
| 15 | `upstox.controller.js` callback doesn't validate `state` parameter (OAuth CSRF protection absent) | `upstox.routes.js` | OAuth security vulnerability |

---

## ✅ CONFIRMED WORKING (Verified by Code Read)

These are things confirmed **correct and production-level** by this audit:

- ✅ JWT + Refresh Token rotation logic is solid  
- ✅ Bcrypt password hashing uses salt rounds 12 (strong)
- ✅ Referral code generation with uniqueness loop is correct  
- ✅ Risk Engine (Daily Loss / Max Drawdown) math is accurate
- ✅ PnL calculation in `broker.service.js` handles BUY/SELL direction correctly
- ✅ Socket.io room isolation — users only receive their own notifications
- ✅ Redis cache invalidation on admin actions is correctly wired
- ✅ Prisma schema: `Trade.brokerTradeId` field ✅ exists
- ✅ Prisma schema: `Challenge.isLive` field ✅ exists  
- ✅ Prisma schema: `AuditLog` model ✅ exists
- ✅ Helmet CSP + Rate limiting correctly configured
- ✅ Google OAuth flow + redirect is correctly implemented
- ✅ Admin middleware (`isAdmin`) imports `protect` correctly
- ✅ KYC validation (Aadhaar + PAN regex) is implemented

---

## 🧪 COMPLETE LOCALHOST TESTING GUIDE (Step-by-Step)

### Before you start — confirm all 3 are running:

Open 2 terminals. Run these:
```bash
# Terminal 1 — Backend
cd C:\Users\Admin\Desktop\indipips\backend
npm run dev

# Terminal 2 — Frontend  
cd C:\Users\Admin\Desktop\indipips\frontend
npm run dev
```
Also confirm PostgreSQL and Redis services are running on Windows.

---

### STEP 1: Verify backend is alive
Open browser → `http://localhost:5000/`

✅ **Expected**:
```json
{ "success": true, "message": "Indipips API is running! 🚀", "version": "1.0.0" }
```
❌ **If you see an error**: The backend crashed. Check the terminal for the error message.

---

### STEP 2: Register a new trader account
Go to → `http://localhost:5173/register`

Fill in:
- Full Name: `Test Trader`
- Email: `trader@test.com`
- Phone: `9876543210`
- Password: `test1234` (min 8 chars)

✅ **Expected**: Redirected to `/dashboard` with a welcome screen.

---

### STEP 3: Seed challenge plans (one-time setup)
Open a new terminal and run:
```bash
cd C:\Users\Admin\Desktop\indipips\backend
node src/seed-admin.js
```
This creates the admin user and seeding plans.

---

### STEP 4: Buy a Challenge (Stripe Payment)
Go to → `http://localhost:5173/dashboard/new-challenge`

1. Click on any plan card (e.g., Starter)
2. Click "Proceed to Secure Payment"
3. You'll see Stripe Checkout (use test card):
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/28`)
   - CVC: Any 3 digits (e.g., `123`)
4. Complete payment

✅ **Expected**: Redirected back to dashboard with new challenge card showing your `IP-XXXXXXXX` Node ID.

> ⚠️ If Stripe keys are placeholders in `.env`, the payment fails. You can manually create a challenge via:
> ```bash
> node backend/scripts/seed-pg.js
> ```

---

### STEP 5: View your Challenge Dashboard
Go to → `http://localhost:5173/dashboard`

Click on your challenge card.

✅ **Expected**: Challenge detail page showing:
- Account Node ID (e.g., `IP-12345678`)
- Balance, Equity, Daily PnL meters
- Trade history section (empty at first)
- "CONNECT LIVE BROKER" button

---

### STEP 6: Open a Trade (using Postman or curl)
First, get your auth token. After login, copy the `accessToken` from the response.

Then run in Postman:
```
POST http://localhost:5000/api/v1/trades/open
Headers: Authorization: Bearer {your_token}
Body (JSON):
{
  "challengeId": "your-challenge-id-from-step-5",
  "symbol": "RELIANCE",
  "tradeType": "BUY",
  "quantity": 10,
  "entryPrice": 2500
}
```
✅ **Expected**: `{ "success": true, "message": "Trade opened successfully." }`

---

### STEP 7: Close the Trade (Profit scenario)
```
POST http://localhost:5000/api/v1/trades/close
Headers: Authorization: Bearer {your_token}
Body (JSON):
{
  "tradeId": "trade-id-from-step-6",
  "exitPrice": 2550
}
```
✅ **Expected**: 
```json
{ "success": true, "pnl": 500, "newBalance": 250500, "isBreached": false }
```
PnL = (2550 - 2500) × 10 = ₹500 profit.

---

### STEP 8: Test Risk Breach (Max Loss scenario)
Close a trade at a catastrophically bad price to trigger the breach:
```json
{ "tradeId": "your-trade-id", "exitPrice": 100 }
```
✅ **Expected**: `"isBreached": true` and challenge status updates to `FAILED` in the DB.

---

### STEP 9: Test KYC Flow
Go to → `http://localhost:5173/dashboard/kyc`

1. Enter Aadhaar: `123456789012` (12 digits)
2. Click "Verify Aadhaar" → should confirm
3. Enter PAN: `ABCDE1234F` (standard Indian PAN format)
4. Click "Verify PAN" → should confirm

✅ **Expected**: KYC status shows `VERIFIED`.

---

### STEP 10: Login as Admin & check Matrix Hub

Admin credentials (created by `seed-admin.js`):
- Email: `admin@indipips.com`
- Password: `admin123`

After login, go to → `http://localhost:5173/admin/matrix`

✅ **Expected**: Admin Hub showing:
- Global stats (total users, active challenges, AUM)
- Challenge ledger table with all trader accounts

---

### STEP 11: Test Rate Limiter (Security check)
In Postman, rapid-fire 55+ POST requests to:
```
POST http://localhost:5000/api/v1/auth/login
```
✅ **Expected**: After ~50 requests, you receive HTTP `429 Too Many Requests` with:
```json
{ "message": "Too many sensitive requests. Security lockout engaged." }
```

---

## 📋 TOP 10 FIXES TO DO BEFORE WEEK 5 (Prioritized)

```
[1] FIX: payout.controller.js L119 — change `nodeAccountId` → `accountNodeId`
[2] FIX: Add admin role guard to /admin/matrix route in App.jsx
[3] FIX: Add morgan to app.use() in server.js (it's imported but not active)
[4] FIX: Add razorpayOrderId field to Payment model in schema.prisma + db push
[5] FIX: Add KYC check in requestPayout — only VERIFIED users can withdraw
[6] FIX: Add upstoxFeed.service.js init() call in server.js startup
[7] FIX: Replace Math.random() in getMarketPrice() with real priceFeed lookup
[8] ADD: Admin payout approval endpoint (PATCH /api/v1/admin/payouts/:id/approve)
[9] ADD: Password Reset flow (forgot-password email + token-based reset)
[10] ADD: Global error handler middleware in server.js (prevents stack traces leaking)
```
