# Indipips - Software Requirements Specification (SRS) v2.0

## 1. Introduction
Indipips is a premier Indian prop trading platform. Version 2.0 focuses on **Production Readiness**, **Security**, and **Scalability to Lakhs of Users**.

## 2. Updated High-Scale Architecture
To scale to lakhs of users, the system must move from a monolithic approach to a robust, event-driven architecture.

### 2.1 Technical Stack (Production Grade)
- **Backend:** Node.js (Express) with **TypeScript** for type safety.
- **Database:** PostgreSQL (Managed, e.g., AWS RDS) with **Prisma Service Layer**.
- **Caching:** **Redis** for session management, leaderboards, and real-time trade buffering.
- **Message Queue:** **BullMQ** or **RabbitMQ** for async trade processing, email/SMS notifications, and webhook handling.
- **Payments:** **Stripe** (covering INR, Card, and Crypto/USDT flows).
- **Communication:** SendGrid (Email), MSG91 (SMS/OTP).
- **Infrastructure:** Containerized with **Docker**, orchestrated by **Kubernetes (K8s)** for horizontal scaling.

## 3. Critical Production Requirements

### 3.1 Security & Reliability
- **Rate Limiting:** Implement `express-rate-limit` and Redis-based global rate limiting.
- **Input Validation:** Mandatory **Zod** or **Joi** schemas for every API endpoint to prevent malformed data.
- **Error Handling:** Centralized error middleware with standardized JSON responses and Sentry/Pino logging.
- **Auth Flow:** Robust JWT with **Refresh Token Rotation** to prevent "expired token loops".
- **Security Headers:** Use `helmet.js` and strict CORS policies.

### 3.2 Real-Time Risk Engine (V2)
- **Trade Buffering:** Trade executions from Broker APIs are first pushed to a queue (Redis/BullMQ) to prevent API timeouts.
- **Fast Evaluation:** A dedicated "Risk Worker" processes the queue, evaluates rules, and updates P&L.
- **Socket Efficiency:** Use Socket.io rooms to broadcast updates only to the relevant trader, reducing server load.

### 3.3 Scalability Points
- **Database Indexing:** Critical indexes on `userId`, `challengeId`, and `tradeDate`.
- **Read Replicas:** Use read-only database replicas for the public leaderboard and challenge history.
- **Connection Pooling:** Use PgBouncer to manage thousands of database connections effectively.

## 4. Functional Enhancements
- **KYC:** Aadhaar-based OTP verification (industry standard).
- **Stripe Integration:** Unified flow for INR and USDT payments.
- **Precision Finance:** All calculations must remain in "Paise" (integer) to avoid floating-point errors.

## 5. Non-Functional Requirements
- **Latencey:** < 100ms for API responses (cached).
- **Availability:** 99.99% uptime goal.
- **Concurrency:** Support for 10,000+ simultaneous WebSocket connections.

---
*Prepared by Indipips Founding Team & AI Engineering Assistant*
*March 2026*
