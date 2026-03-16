# Indipips - Technical Scaling Roadmap (To Lakhs of Users)

To transition from a startup MVP to an industry-leading platform handling hundreds of thousands of users, the following technical migrations must occur:

## 1. Database Tier Scaling
- **From:** Single RDS Instance.
- **To:** Multiple **Read Replicas** specifically for dashboard reads and public leaderboards.
- **Partitioning:** Implement database partitioning on the `Trades` table by `challengeId` or `month` once records exceed 10M.
- **Pooling:** Mandatory **PgBouncer** or Prisma Accelerate for connection lifecycle management.

## 2. Event-Driven Risk Engine
- **The Problem:** Processing trades synchronously slows down the API and can lead to rule evaluation misses.
- **The Solution:** 
  1. Broker Webhook → **Redis Queue**.
  2. Workers → Consume queue → Evaluate Rules → Update DB.
  3. Emit Socket event to user.
- This ensures high volume trading doesn't block the main API thread.

## 3. Caching Strategy
- **Session Cache:** Store active challenge P&L summaries in Redis (expire every 1-5 mins).
- **Rate Limiting:** Move rate limits to a shared Redis cluster so they work across multiple server instances.
- **Plan Cache:** Cache all Challenge Plans (rarely change).

## 4. Horizontal Scaling
- **Cloud:** Migrate to **AWS EKS (Kubernetes)**.
- **Auto-scaling:** Set Horizontal Pod Autoscalers (HPA) to spin up new API instances when CPU/Memory usage > 60%.
- **Edge:** Use Cloudflare to cache static frontend assets and protect against DDoS attacks.

## 5. High-Precision Finance
- Store all values as `bigint` (Paise).
- Never use `float` or `number` for currency logic in calculations.
- Implement **Double-Entry Bookkeeping** for all wallet transactions to ensure zero-loss auditing.

---
*Technical Strategy by AI Engineering Assistant*
