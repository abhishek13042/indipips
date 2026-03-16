# Week 3 Day 17: Week 3 QA & Load Prep

The final day of Week 3 is about "Breaking the System" to ensure it holds up. We will simulate an entire operational cycle for a small fleet of simulated traders.

## Proposed Verification Steps

### 1. Operational "Pulse Test"
We will develop `verify-week3.js` to automate the following sequence:
- **KYC Onboarding**: Simulate 5 users submitting Aadhaar/PAN details.
- **Trading Volume**: Users place a series of trades (profitable and losing) to generate global data.
- **Admin Hub Audit**: Verify that the Matrix Hub accurately reports `Total Users`, `Active Challenges`, and `Total AUM`.
- **Cache Verification**: Ensure Redis cache "HITS" are occurring for subsequent admin loads.
- **Payout Workflow**: Profitable users request withdrawals; verify the breakdown math and database persistence.

### 2. Performance & Redis Validation
- Measure response times for cached vs. uncached endpoints.
- Verify that cache invalidation works correctly when an admin intervenes (e.g., terminating a challenge).

### 3. Final Artifact Sync
- Ensure `zDocuments/` is updated with the absolute latest state of the codebase.
- Archive the Week 3 roadmap and prepare the Week 4 (Live Integration) roadmap.

## Verification Plan

### Automated Tests
1. **Simulation Script**: Run `node scripts/verify-week3.js`.
2. **Prisma Integrity**: Check for any orphaned payout or KYC records.

### Manual Verification
- Log in as Admin and visually confirm the MatrixHub matches the script's output.
- Log in as a "Simulation User" and check the withdrawal breakdown modal.
