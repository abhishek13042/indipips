# Week 1 Launch-Ready Check (Day 5)

This plan outlines the final verification steps for Week 1, ensuring that the "Indipips Royal" identity and the core business flow (Registration -> Purchase -> Activation) are ready for minor beta or further development.

## Proposed Verification Steps

### 1. End-to-End User Journey
We will simulate a new trader's first experience:
- **Registration**: Sign up with a new email.
- **Onboarding**: Check if the dashboard greets the user correctly even with zero accounts.
- **Purchase**: Navigate to the "Buy Challenge" page, select a 100K 1-Step challenge.
- **Payment Hook**: Manually verify (via DB check or logs) that a pending payment record is created when the Stripe redirect happens.

### 2. Branding & UI Consistency
A final visual pass to ensure the "Indipips Royal" theme is consistent on:
- Login/Register pages.
- Buy Challenge selection screen.
- Payment Success/Cancel redirects.

### 3. Stability & Performance Pass
- **Error Boundaries**: Verify that if a plan fails to load, the UI doesn't crash.
- **Loading States**: Ensure spinners appear during API calls (e.g., plan fetching).

## Verification Plan

### Automated Tests (via Browser Subagent)
1. **Journey Test**:
   - Register at `/register`.
   - Go to `/dashboard/new-challenge`.
   - Select "1 Step" -> "$100K" -> "Continue".
   - Confirm redirect to Stripe (Checking URL).
2. **Empty State Test**:
   - Verify the "No accounts available" view on a fresh dashboard.

### Manual Verification
- Check backend logs for successful Prisma connection pooling.
- Confirm Stripe Webhook endpoint is reachable (running `curl` test).
