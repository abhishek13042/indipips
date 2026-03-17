# Indipips — Week 1-4 Codebase Audit & Localhost Testing Guide

> Written: 18 March 2026 | Status: Week 4 Complete

---

## PART 1: WHAT WE BUILT (Week 1-4 Summary)

### ✅ Week 1 — Foundation & Authentication
| Feature | File | Status |
|---|---|---|
| User Registration & Login | `auth.controller.js` | ✅ Done |
| JWT + Refresh Token System | `auth.controller.js` | ✅ Done |
| Google OAuth Login | `config/passport.js` | ✅ Done |
| Protected Routes (middleware) | `auth.middleware.js` | ✅ Done |
| Landing Page UI | `LandingPage.jsx` | ✅ Done |
| Login / Register Pages | `LoginPage.jsx`, `RegisterPage.jsx` | ✅ Done |

### ✅ Week 2 — Payments, Risk Engine & Real-time
| Feature | File | Status |
|---|---|---|
| Stripe Checkout & Webhook | `payment.controller.js`, `webhook.controller.js` | ✅ Done |
| Challenge Activation (post-payment) | `webhook.controller.js` | ✅ Done |
| Unique Account Node ID (`IP-XXXXXXXX`) | `webhook.controller.js` | ✅ Done |
| Risk Engine (Daily Loss + Max Drawdown) | `utils/riskEngine.js` | ✅ Done |
| Trade Open/Close API | `trade.controller.js`, `broker.service.js` | ✅ Done |
| Real-time Socket.io (P&L Streaming) | `utils/socket.js` | ✅ Done |
| Stats Engine (Win Rate, Profit Factor) | `utils/statsEngine.js` | ✅ Done |
| Buy Challenge Page (Bespoke UI) | `BuyChallengePage.jsx` | ✅ Done |
| Challenge Detail Dashboard | `ChallengeDetailPage.jsx` | ✅ Done |

### ✅ Week 3 — Operations, Admin & Payouts
| Feature | File | Status |
|---|---|---|
| KYC (Aadhaar + PAN validation) | `kyc.service.js`, `kyc.controller.js` | ✅ Done |
| KYC Portal (Frontend) | `KYCPage.jsx` | ✅ Done |
| Admin Hub (Global Stats, Ledger) | `admin.controller.js` | ✅ Done |
| Admin Dashboard (Frontend) | `AdminDashboardPage.jsx` | ✅ Done |
| Payout Engine (80/20 split + TDS) | `payout.service.js`, `payout.controller.js` | ✅ Done |
| Breach Scanner Worker (Cron) | `workers/breachScanner.js` | ✅ Done |
| Equity Snapshot Worker (daily) | `workers/snapshotWorker.js` | ✅ Done |
| Redis Caching Layer | `cache.service.js` | ✅ Done |
| Audit Logger (AuditLog DB table) | `utils/auditLogger.js` | ✅ Done |

### ✅ Week 4 — Live Trading Integration
| Feature | File | Status |
|---|---|---|
| Upstox OAuth Service | `upstox.service.js` | ✅ Done |
| Upstox WebSocket Feed (Protobuf) | `upstoxFeed.service.js` | ✅ Done |
| Real-time Price Feed (in-memory) | `utils/priceFeed.js` | ✅ Done |
| Live/Practice Execution Router | `broker.service.js` | ✅ Done |
| Razorpay Integration (INR) | `razorpay.service.js` | ✅ Done |
| Winston Production Logger | `utils/logger.js` | ✅ Done |
| CSP + Rate Limiting (Helmet) | `server.js` | ✅ Done |
| "Connect Live Broker" UI Button | `ChallengeDetailPage.jsx` | ✅ Done |

---

## PART 2: CRITICAL GAPS (Must Fix Before Week 8/Launch)

> These are things that were architected and stubbed, but are **not production-grade yet**.

### 🔴 CRITICAL — Must Fix (Blockers)

| # | Gap | Where | Impact |
|---|---|---|---|
| 1 | **Razorpay `razorpayOrderId` field missing from Prisma schema** | `schema.prisma` + `payment.controller.js` | Payment creation will crash for Indian users |
| 2 | **`brokerTradeId` field missing from `Trade` model in Prisma schema** | `schema.prisma` | Order reconciliation with Upstox will fail |
| 3 | **Upstox Feed `init()` is never called** from server startup | `server.js` | Live feed will never start, even after broker connect |
| 4 | **Morgan logger removed but not replaced** | `server.js` | No HTTP request logs in production |
| 5 | **`.env` has placeholder Stripe keys** | `.env` | Stripe payments will always fail |
| 6 | **No Upstox API keys set in `.env`** | `.env` | Broker authentication cannot work |
| 7 | **`/api/v1/upstox/callback` is unprotected** | `upstox.routes.js` | State parameter is not validated — CSRF risk |

### 🟡 IMPORTANT — Should Fix Before Soft Launch

| # | Gap | Where | Impact |
|---|---|---|---|
| 8 | **No email notifications** | Missing `email.service.js` | Traders never get Welcome / Breach / Payout emails |
| 9 | **Payout approvals are manual** (Admin sees PENDING, no action) | `admin.controller.js` | Admin can't approve/reject from dashboard |
| 10 | **No password reset flow** | `auth.controller.js` | Traders who forget password are locked out forever |
| 11 | **`morgan` removed but `app.use(morgan('dev'))` is not present** | `server.js` | Harder to debug request-level issues |
| 12 | **No Razorpay Webhook handler** | Missing | Indian payments won't trigger Challenge activation |
| 13 | **Frontend has no live price ticker** | `DashboardPage.jsx` | Real-time prices from Upstox Feed don't show in UI |
| 14 | **No Sentry error tracking** | Missing | Unhandled exceptions in production go silent |

### 🟢 POLISH — Nice Before Week 8

| # | Gap | Where | Impact |
|---|---|---|---|
| 15 | **Admin dashboard has no Payout approval button** | `AdminDashboardPage.jsx` | Admin must use DB directly to approve payouts |
| 16 | **Trading Page has no trade history table** | `ChallengeDetailPage.jsx` | Traders can't review past trades in UI |
| 17 | **No Leaderboard** | Missing | No competitive incentive for traders |
| 18 | **Logo/Branding placeholder on Landing Page** | `LandingPage.jsx` | Not investor-pitch ready |

---

## PART 3: LOCALHOST TESTING GUIDE (Step-by-Step)

### Pre-Requisites
Make sure these are running before you start:
- ✅ PostgreSQL is running on port `5432` (database: `indipips_db`)
- ✅ Redis is running on port `6379`
- ✅ Backend is started: `npm run dev` in `/backend` folder
- ✅ Frontend is started: `npm run dev` in `/frontend` folder

---

### STEP 1 — Verify Backend is Alive
Open your browser or [Postman](https://www.postman.com/) and go to:
```
GET http://localhost:5000/
```
**Expected:** JSON response with `"Indipips API is running! 🚀"`

---

### STEP 2 — Register a Trader Account
Open your browser and go to:
```
http://localhost:5173/register
```
1. Fill in any Name, Email, Password
2. Click Sign Up
3. You should be redirected to the **Dashboard**

**Expected:** Welcome screen with "No challenges yet — Buy your first challenge!"

---

### STEP 3 — Buy a Challenge (Stripe Test Payment)
1. Click **"Buy Challenge"** from the dashboard
2. Select any plan (e.g., Starter - $49)
3. Click **"Proceed to Secure Payment"**
4. You'll be sent to Stripe Checkout (or see an error if Stripe keys are not set)
5. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVV

> ⚠️ **NOTE**: If Stripe keys are placeholders in `.env`, you'll see an error. This is expected. To bypass for local testing, you can manually create a challenge via the database.

**Quick manual challenge creation** (using the seed script):
```bash
cd backend
node scripts/seed-pg.js
```

---

### STEP 4 — View Your Challenge Dashboard
1. Go to `http://localhost:5173/dashboard`
2. Click on your challenge card
3. You should see: Account Node ID, Balance, Daily PnL, Equity Meter

---

### STEP 5 — Open a Trade (Risk Engine Test)
Using Postman or browser (after logging in to get your token):
```
POST http://localhost:5000/api/v1/trades/open
Authorization: Bearer {your_jwt_token}
Body: {
  "challengeId": "your-challenge-id",
  "symbol": "RELIANCE",
  "type": "BUY",
  "quantity": 10,
  "entryPrice": 2500
}
```
**Expected:** Trade created with status `OPEN`

---

### STEP 6 — Close the Trade (PnL Calculation Test)
```
POST http://localhost:5000/api/v1/trades/close
Authorization: Bearer {your_jwt_token}
Body: {
  "tradeId": "your-trade-id",
  "exitPrice": 2550
}
```
**Expected:** Trade closed with PnL = `(2550 - 2500) * 10 = ₹500 profit`

---

### STEP 7 — Trigger a Risk Breach (Risk Engine Verification)
Close a trade with a massive loss (e.g., exitPrice of 100 on a 2500 entry). The Breach Scanner Worker runs every minute and will:
1. Detect the breach
2. Update challenge status to `FAILED`
3. If Socket.io is connected, you'll see the dashboard update live

---

### STEP 8 — Test KYC Flow
1. Go to `http://localhost:5173/kyc`
2. Enter a sample Aadhaar format: `123456789012`
3. Enter a sample PAN format: `ABCDE1234F`
4. Both should validate and confirm KYC 

---

### STEP 9 — Test Admin Hub
1. You need an Admin account. Run:
```bash
cd backend
node src/seed-admin.js
```
2. Login with `admin@indipips.com` / `admin123`
3. Go to `http://localhost:5173/admin`
4. You should see the Matrix Hub with global stats and all challenges

---

### STEP 10 — Verify Broker Connect (Upstox)
> This requires real Upstox API keys in `.env`
1. Set `UPSTOX_API_KEY` and `UPSTOX_API_SECRET` in `backend/.env`
2. From the Challenge Detail Page, click **"🔗 CONNECT LIVE BROKER"**
3. You'll be redirected to the Upstox login page
4. After authorizing, you'll be redirected back and the broker status will show as Connected

---

## PART 4: THE IMMEDIATE FIX CHECKLIST (Before Week 5 Starts)

Run these fixes in this exact order:

```
[ ] 1. Add `razorpayOrderId` to Payment model in schema.prisma + run db push
[ ] 2. Add `brokerTradeId` to Trade model in schema.prisma + run db push
[ ] 3. Call upstoxFeed.service init() in server.js startup
[ ] 4. Add morgan back to server.js (for request logging in dev)
[ ] 5. Set real Stripe keys in .env (even sandbox/test keys)
[ ] 6. Set real Upstox keys in .env
[ ] 7. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET to .env
[ ] 8. Build and add Razorpay Webhook handler
[ ] 9. Add password reset endpoint + email flow
[ ] 10. Add Admin: "Approve Payout" button and API endpoint
```
