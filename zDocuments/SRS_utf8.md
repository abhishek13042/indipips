__INDIPIPS__

*India's Premier Proprietary Trading Platform*

__SOFTWARE REQUIREMENTS SPECIFICATION \(SRS\)__

Version 1\.0  |  Production Level

March 2026

__CONFIDENTIAL & PROPRIETARY__

__Prepared By__

Indipips Founding Team

__Document Type__

SRS \- Technical & Business

__Status__

Final \- Version 1\.0

# __Table of Contents__

# __1\. Introduction__

## __1\.1 Purpose__

This Software Requirements Specification \(SRS\) document defines the complete functional, non\-functional, technical, and business requirements for Indipips ÔÇö India's first dedicated proprietary trading \(prop firm\) platform built exclusively for Indian financial markets\. This document serves as the single source of truth for all development, design, legal, and investor\-facing decisions related to the Indipips platform\.

## __1\.2 Scope__

Indipips is a web\-based proprietary trading evaluation platform that allows Indian retail traders to prove their trading skills using simulated capital across NSE/BSE instruments including Index Options \(Nifty 50, BankNifty, MidcapNifty\), Equity Futures & Options, and Equity Stocks\. Upon successful completion of a structured challenge, traders gain access to a funded simulated account with real profit\-sharing payouts\.

## __1\.3 Document Conventions__

__Term__

__Definition__

Prop Firm

Proprietary Trading Firm ÔÇö a company that funds traders with virtual capital

Challenge

An evaluation period where traders must meet specific profit/loss targets

Funded Account

Virtual trading account awarded after passing the challenge

Drawdown

The reduction in account value from peak to trough

IST

Indian Standard Time \(UTC\+5:30\)

F&O

Futures and Options ÔÇö derivative instruments traded on NSE/BSE

KYC

Know Your Customer ÔÇö mandatory identity verification process

UIDAI

Unique Identification Authority of India ÔÇö Aadhaar issuing body

MVP

Minimum Viable Product ÔÇö initial production\-ready release

P&L

Profit and Loss ÔÇö financial performance metric

API

Application Programming Interface

JWT

JSON Web Token ÔÇö authentication mechanism

## __1\.4 Intended Audience__

- Software Development Team ÔÇö Full technical specifications for building the platform
- Investors & Stakeholders ÔÇö Business model, market opportunity, and financial projections
- Legal & Compliance Team ÔÇö Regulatory requirements and compliance framework
- Business Founders ÔÇö Complete product roadmap and feature specifications

## __1\.5 Product Overview__

Indipips fills a critical gap in the Indian financial market\. While India has become the world's largest options trading market by volume with over 50 lakh active F&O traders monthly, there is no dedicated Indian prop firm platform\. Global platforms like FTMO charge in USD, do not support Indian instruments, and operate in foreign timezones\. Indipips solves all of these problems with an India\-first approach\.

# __2\. Business Overview__

## __2\.1 Vision Statement__

*"To become India's most trusted proprietary trading platform, empowering skilled Indian traders with the capital they deserve ÔÇö built for Bharat, by Bharat\."*

## __2\.2 Mission Statement__

Indipips aims to democratize access to trading capital for skilled Indian retail traders by providing a transparent, fair, and technology\-driven evaluation platform that identifies genuine trading talent and rewards it with real financial opportunity\.

## __2\.3 Business Model__

Indipips operates on a challenge\-fee\-based revenue model\. Traders pay a one\-time fee to participate in a structured evaluation\. The business is inherently profitable because statistically 85\-90% of F&O traders fail to meet the profit targets ÔÇö a fact confirmed by SEBI's own research showing 89% of F&O traders incur losses\. This means the majority of challenge fees represent direct revenue, while payouts to successful traders are funded from the revenue pool\.

### __2\.3\.1 Revenue Streams__

- Primary: Challenge participation fees \(INR\)
- Secondary: Challenge retry fees at a discounted rate
- Tertiary: Future ÔÇö educational content, trading tools subscription, affiliate commissions

## __2\.4 Market Opportunity__

__Market Metric__

__Data__

NSE Registered Investors

4\+ Crore active investors

Monthly Active F&O Traders

50\+ Lakh traders

New Demat Accounts \(Monthly\)

30\-40 Lakh new accounts

Daily F&O Turnover

Rs\. 300\-500 Crore\+

Traders who lose money \(SEBI\)

89% of F&O participants

India Global Options Rank

\#1 by volume worldwide

Existing Indian Prop Firms

Fewer than 5 \(poorly built\)

Target Addressable Market

50 Lakh\+ potential users

## __2\.5 Competitive Advantage__

- Only platform supporting Indian instruments: Nifty, BankNifty, MidcapNifty, F&O, Equity
- 100% INR pricing ÔÇö no USD conversion, no forex risk for traders
- UPI/Razorpay payments ÔÇö instant, familiar, trusted by all Indian traders
- Direct NEFT/IMPS payouts ÔÇö no Wise, Payoneer or international transfer fees
- Algo and automated trading allowed ÔÇö major advantage as most Indian traders use algos
- IST timezone operations ÔÇö support, monitoring, and operations in Indian business hours
- First mover advantage in a completely untapped market segment

## __2\.6 Financial Projections__

__Period__

__Monthly Traders__

__Avg Fee__

__Monthly Revenue__

__Payout Cost__

__Net Profit__

Month 1\-3

50

Rs\. 3,000

Rs\. 1\.5 Lakh

Rs\. 40K

Rs\. 80K

Month 4\-6

150

Rs\. 3,000

Rs\. 4\.5 Lakh

Rs\. 1\.2L

Rs\. 3\.1 Lakh

Month 7\-9

300

Rs\. 3,500

Rs\. 10\.5 Lakh

Rs\. 2\.5L

Rs\. 7\.5 Lakh

Month 10\-12

500

Rs\. 3,500

Rs\. 17\.5 Lakh

Rs\. 4L

Rs\. 12\.9 Lakh

Year 1 Total

\-

\-

\-

\-

~Rs\. 80 Lakh

Year 2 \(scaled\)

2000\+

Rs\. 4,000

Rs\. 80 Lakh\+

\-

Rs\. 50\+ Lakh/mo

### __2\.6\.1 Break\-Even Analysis__

Monthly Fixed Costs \(MVP Stage\): Rs\. 35,000\. Average challenge fee: Rs\. 3,000\. Break\-even point: Only 12 traders per month\. This extremely low break\-even makes Indipips financially viable from the very first month of operations\.

# __3\. Challenge Plans & Pricing__

## __3\.1 Account Plans__

Indipips offers five distinct challenge tiers to accommodate traders of varying capital preferences and risk profiles\. All plans are denominated in Indian Rupees \(INR\) and trade on simulated accounts mirroring live NSE/BSE market data\.

__Plan__

__Virtual Account__

__Challenge Fee__

__Profit Target \(8%\)__

__Daily Loss \(4%\)__

__Max Drawdown \(8%\)__

__Min Days__

Seed

Rs\. 2\.5 Lakh

Rs\. 999

Rs\. 20,000

Rs\. 1,000/day

Rs\. 20,000

5 days

Starter

Rs\. 5 Lakh

Rs\. 1,799

Rs\. 40,000

Rs\. 2,000/day

Rs\. 40,000

5 days

Pro

Rs\. 10 Lakh

Rs\. 3,299

Rs\. 80,000

Rs\. 4,000/day

Rs\. 80,000

5 days

Elite

Rs\. 15 Lakh

Rs\. 4,799

Rs\. 1,20,000

Rs\. 6,000/day

Rs\. 1,20,000

5 days

Master

Rs\. 20 Lakh

Rs\. 5,999

Rs\. 1,60,000

Rs\. 8,000/day

Rs\. 1,60,000

5 days

## __3\.2 Universal Challenge Rules__

The following rules apply uniformly across ALL plans and are monitored in real\-time by the platform's risk engine:

__Rule__

__Value__

__Description__

Profit Target

8% of account

Trader must achieve this to pass the challenge

Max Daily Loss

4% of account

If hit, account suspended for the day ÔÇö monitored real\-time

Max Overall Drawdown

8% of account

If hit at any point, account permanently closed

Minimum Trading Days

5 calendar days

Must trade on at least 5 separate days ÔÇö prevents lucky single\-day pass

Maximum Trading Days

45 calendar days

Challenge expires after 45 days if target not met

Consistency Rule

No single day > 40% of total profit

Prevents gambling ÔÇö ensures consistent performance

Market Hours Only

9:15 AM \- 3:15 PM IST

No pre\-market or post\-market trades allowed

No Overnight Positions

All positions closed by 3:15 PM IST

All trades must be intraday

No News Trading

RBI Policy, Union Budget, Election Results

Trading restricted 30 min before & after major events

No Martingale Strategy

Strictly prohibited

Automated detection ÔÇö immediate account closure if detected

No Copy Trading

Strictly prohibited

Each trader must use original independent strategy

Algo/Bot Trading

Fully Allowed

Unique Indian market advantage ÔÇö automated strategies permitted

## __3\.3 Funded Account & Profit Split__

__Stage__

__Condition__

__Profit Split__

__Max Account Size__

Funded \(Pass\)

Pass the challenge

80% Trader / 20% Indipips

As per plan

Scale 1

Achieve 10% profit on funded account

85% Trader / 15% Indipips

2x account size

Scale 2

Achieve 10% profit again

90% Trader / 10% Indipips

4x account size

Elite Trader

Sustained performance

90% Trader / 10% Indipips

Up to Rs\. 2 Crore

## __3\.4 Payout Policy__

- First payout: Available after 14 days of funded account trading
- Payout frequency: Bi\-weekly \(every 14 days thereafter\)
- Payout method: Direct bank transfer via NEFT/IMPS
- Minimum payout amount: Rs\. 500
- Challenge fee refund: Refunded with first successful payout
- Processing time: 3\-5 business days after approval

## __3\.5 Retry & Failure Policy__

- On challenge failure: Immediate account suspension
- Email notification sent within 5 minutes of failure
- Retry discount: 20% off next challenge of same or higher plan
- Cooling\-off period: None ÔÇö trader can retry immediately
- Maximum retries: Unlimited

# __4\. User Roles & Permissions__

## __4\.1 Role Overview__

__Role__

__Description__

__Access Level__

Trader

Registered user who purchases and attempts challenges

Limited to own account data

Admin

Indipips staff managing trader accounts and payouts

Full trader management access

Super Admin

Platform owner with complete system access

Unrestricted ÔÇö all modules

## __4\.2 Trader Permissions__

- Register, login, and manage personal profile
- Browse and purchase challenge plans
- View real\-time dashboard: P&L, drawdown, rules status
- Connect broker account via API for trade auto\-sync
- Request payout withdrawals
- View challenge history and performance analytics
- Access digital certificates upon passing
- Refer other traders via referral program
- Submit KYC documents

## __4\.3 Admin Permissions__

- View and manage all trader accounts
- Approve or reject payout requests
- Monitor real\-time risk exposure across all funded accounts
- Suspend or reinstate trader accounts
- View platform analytics and revenue reports
- Manage KYC verification queue
- Send notifications and announcements to traders

## __4\.4 Super Admin Permissions__

- All Admin permissions
- Configure challenge plans, pricing, and rules
- Manage Admin accounts ÔÇö create, suspend, delete
- Access financial reports, payout history, and revenue analytics
- Platform settings: maintenance mode, feature flags
- API key management for broker integrations
- Database access and backup management

# __5\. Functional Requirements__

## __5\.1 Authentication & Onboarding__

### __5\.1\.1 Registration__

- Trader registers with full name, email, mobile number, and password
- Mobile OTP verification via SMS \(MSG91/Twilio\) on registration
- Email verification link sent upon registration
- Password must be minimum 8 characters with uppercase, number, and special character
- Duplicate email and phone number detection
- Age verification: Trader must confirm age 18\+ during registration

### __5\.1\.2 Login & Security__

- Email \+ password login with JWT\-based authentication
- Two\-Factor Authentication \(2FA\) via OTP on login \(optional for trader, mandatory for Admin\)
- Session expiry: 7 days for traders, 8 hours for Admin/Super Admin
- Password reset via email OTP
- Maximum 5 failed login attempts before temporary account lock \(15 minutes\)
- All login events logged with IP address and timestamp

## __5\.2 KYC Verification__

### __5\.2\.1 Aadhaar\-Based KYC \(UIDAI Integration\)__

- Trader submits 12\-digit Aadhaar number
- System sends OTP to Aadhaar\-linked mobile via UIDAI API
- Trader enters OTP to complete Aadhaar verification
- Name from Aadhaar auto\-populated and locked in profile
- PAN card number collection \(mandatory for payouts above Rs\. 50,000\)
- Bank account verification: Account number \+ IFSC \+ cancelled cheque upload
- KYC status: Pending, Verified, Rejected ÔÇö shown clearly in dashboard
- KYC must be completed before first payout request
- All KYC data encrypted at rest using AES\-256

## __5\.3 Challenge Management__

### __5\.3\.1 Challenge Purchase Flow__

1. Trader selects a plan from the pricing page
2. Trader reviews all rules and clicks 'Accept & Proceed'
3. Payment processed via Razorpay \(UPI, Net Banking, Card\)
4. On payment success: challenge account created automatically
5. Broker API connection prompt shown to trader
6. Challenge start date and expiry date displayed on dashboard
7. Welcome email with challenge details and rules sent to trader

### __5\.3\.2 Challenge Tracking__

- Real\-time P&L display updated on every trade execution
- Drawdown meter showing current drawdown vs\. maximum allowed
- Daily loss tracker resetting every trading day at 9:15 AM IST
- Progress bar showing profit target completion percentage
- Trading days counter showing days traded vs\. minimum required
- Countdown timer for challenge expiry
- Rules compliance checklist ÔÇö green/red status for each rule

### __5\.3\.3 Challenge Completion__

- System auto\-evaluates all rules daily at 3:31 PM IST \(after market close\)
- Pass condition: Profit target met \+ all rules complied \+ minimum days completed
- Fail condition: Daily loss limit breached OR max drawdown breached OR time expired
- On pass: Funded account created, congratulations email \+ certificate generated
- On fail: Account suspended, failure email with reason \+ retry discount code sent

## __5\.4 Trader Dashboard__

### __5\.4\.1 Dashboard Components__

- Account summary card: Plan name, account size, current balance, P&L
- Real\-time P&L chart: Intraday and historical performance graph
- Drawdown gauge: Visual meter showing current drawdown with danger zones
- Daily loss monitor: Today's loss vs\. daily limit ÔÇö color coded \(green/yellow/red\)
- Rules compliance panel: Live status of all trading rules
- Trading days tracker: Days traded out of minimum requirement
- Challenge progress: Profit target completion percentage
- Recent trades table: Last 20 trades with time, instrument, qty, entry, exit, P&L
- Challenge timer: Days and hours remaining until expiry

## __5\.5 Broker API Integration__

### __5\.5\.1 Supported Brokers \(Phase 1\)__

- Upstox API ÔÇö Primary integration \(free paper trading API\)
- Zerodha Kite API ÔÇö Secondary integration
- Angel One SmartAPI ÔÇö Tertiary integration

### __5\.5\.2 API Sync Behavior__

- Trader connects broker account from dashboard using API key \+ secret
- Connection verified by placing a test ping to broker API
- Trades auto\-synced in real\-time via broker webhooks or polling \(every 5 seconds\)
- All executed trades pulled: instrument, quantity, buy/sell, price, timestamp
- P&L calculated in real\-time against paper trading positions
- Risk engine evaluates every new trade against all active rules
- If daily loss limit hit: System triggers immediate account suspension via API
- If max drawdown hit: Challenge permanently closed and failure email sent

## __5\.6 Payment System__

### __5\.6\.1 Razorpay Integration__

- Supported payment methods: UPI, Net Banking, Debit Card, Credit Card, Wallets
- Payment receipt generated and emailed on successful transaction
- Failed payment handling: Retry prompt with clear error message
- Webhook\-based payment confirmation ÔÇö no manual verification
- GST invoice auto\-generated for all transactions \(18% GST\)
- Refund processing: Challenge fee refunded via Razorpay to original payment method

## __5\.7 Payout System__

- Trader submits payout request from dashboard after 14\-day funded period
- System validates: KYC complete, bank account verified, minimum amount met
- Payout request enters Admin approval queue
- Admin reviews and approves/rejects within 3 business days
- On approval: NEFT/IMPS transfer initiated to trader's verified bank account
- Payout history maintained with full audit trail
- Tax deduction: TDS applied as per applicable Indian tax regulations
- Payout notification: Email \+ SMS sent on initiation and completion

## __5\.8 Referral & Affiliate Program__

### __5\.8\.1 Referral System__

- Every trader gets a unique referral code/link on registration
- Referring trader earns 10% of referee's first challenge fee as wallet credit
- Referee gets 5% discount on first challenge
- Referral earnings accumulated in in\-platform wallet
- Wallet balance can be used to pay for future challenges
- Referral leaderboard ÔÇö top referrers displayed publicly

### __5\.8\.2 Affiliate Program__

- Trading influencers and YouTubers can apply for affiliate partnership
- Approved affiliates get dedicated tracking links with higher commission \(15%\)
- Affiliate dashboard with clicks, conversions, and earnings
- Monthly payout to affiliates via bank transfer

## __5\.9 Notifications System__

__Event__

__Email__

__SMS__

__In\-App__

Registration & OTP

Yes

Yes

No

Challenge purchased

Yes

Yes

Yes

Profit target 50% reached

Yes

No

Yes

Profit target 75% reached

Yes

Yes

Yes

Daily loss limit 75% reached

No

Yes

Yes

Daily loss limit hit

Yes

Yes

Yes

Drawdown limit 75% reached

No

Yes

Yes

Max drawdown hit ÔÇö fail

Yes

Yes

Yes

Challenge passed

Yes

Yes

Yes

Funded account activated

Yes

Yes

Yes

Payout approved

Yes

Yes

Yes

Payout transferred

Yes

Yes

Yes

KYC verified

Yes

No

Yes

## __5\.10 Leaderboard & Certificates__

- Public leaderboard: Top 50 funded traders by profit percentage
- Leaderboard refreshed daily at midnight IST
- Traders can opt\-out of leaderboard for privacy
- Digital certificate: Auto\-generated PDF on challenge pass with trader name, plan, date, and Indipips seal
- Certificate shareable on LinkedIn, Twitter/X, WhatsApp via one\-click share
- Certificate verification page: Public URL to verify certificate authenticity

## __5\.11 Admin Panel__

- Dashboard: Total traders, active challenges, funded accounts, revenue today/month
- Trader management: Search, filter, view, suspend, reinstate any trader account
- Challenge monitoring: All active challenges with real\-time P&L and rule status
- Payout queue: Pending payout requests with approve/reject actions
- Risk exposure: Total simulated capital at risk across all funded accounts
- Revenue analytics: Daily/weekly/monthly revenue charts
- KYC queue: Pending KYC verifications for manual review if needed
- Announcement system: Broadcast emails/notifications to all or filtered traders

# __6\. Non\-Functional Requirements__

## __6\.1 Performance Requirements__

__Metric__

__Requirement__

Page Load Time

< 2 seconds on 4G connection

API Response Time

< 500ms for 95% of requests

Real\-time P&L Update

< 5 seconds latency from trade execution

Concurrent Users \(MVP\)

1,000 simultaneous users

Concurrent Users \(Scaled\)

10,000\+ simultaneous users post\-investment

Database Query Time

< 100ms for standard queries

Payment Processing

< 3 seconds for Razorpay webhook confirmation

Platform Uptime

99\.9% uptime SLA

## __6\.2 Security Requirements__

- All data transmission encrypted via TLS 1\.3 \(HTTPS mandatory\)
- Passwords hashed using bcrypt \(cost factor 12\)
- JWT tokens with 7\-day expiry and refresh token mechanism
- All KYC documents encrypted at rest using AES\-256
- SQL injection prevention via parameterized queries and Prisma ORM
- XSS protection via Content Security Policy headers
- CSRF protection on all state\-changing API endpoints
- Rate limiting: 100 API requests per minute per user
- DDoS protection via Cloudflare WAF
- PCI\-DSS compliant payment handling \(delegated to Razorpay\)
- Admin panel accessible only from whitelisted IP addresses
- All admin actions logged with timestamp, IP, and user ID

## __6\.3 Scalability Requirements__

- Horizontal scaling: Backend services containerized via Docker
- Database read replicas for high\-traffic scenarios
- CDN for static assets ÔÇö global delivery via Cloudflare
- Redis caching for frequently accessed data \(leaderboard, plan details\)
- Message queue \(Bull/Redis\) for async operations \(emails, notifications\)
- Auto\-scaling rules configured on AWS/Railway for traffic spikes

## __6\.4 Availability & Reliability__

- 99\.9% uptime target ÔÇö maximum 8\.7 hours downtime per year
- Automated health checks every 60 seconds
- Automated failover for database and API servers
- Daily automated database backups retained for 30 days
- Disaster recovery plan with RTO of 4 hours and RPO of 1 hour
- Maintenance window: Sundays 1:00 AM \- 4:00 AM IST \(market closed\)

## __6\.5 Usability Requirements__

- Mobile responsive design ÔÇö fully functional on smartphones \(minimum 320px width\)
- WCAG 2\.1 Level AA accessibility compliance
- Platform language: English \(Hindi support in Phase 2\)
- Maximum 3 clicks to reach any core feature from dashboard
- Onboarding tutorial for new traders on first login
- Dark theme as default \(preferred by trading community\)

# __7\. System Architecture__

## __7\.1 Architecture Overview__

Indipips follows a three\-tier architecture with a React\.js frontend, a Node\.js/Express\.js RESTful API backend, and a PostgreSQL relational database\. Real\-time features are powered by Socket\.io\. The system is designed for horizontal scalability and is containerized using Docker for consistent deployment across environments\.

## __7\.2 Technology Stack__

__Layer__

__Technology__

__Purpose__

__Justification__

Frontend

React\.js 18 \+ Vite

User interface

Fast, component\-based, large ecosystem

Styling

Tailwind CSS

UI styling

Utility\-first, consistent design, responsive

State Management

Zustand

Global state

Lightweight, simple, performant

Backend

Node\.js \+ Express\.js

API server

Non\-blocking I/O, ideal for real\-time

Real\-time

Socket\.io

Live P&L updates

WebSocket abstraction, reliable

Database

PostgreSQL 15

Data storage

ACID compliant, ideal for financial data

ORM

Prisma

DB abstraction

Type\-safe queries, migration management

Cache

Redis

Session & cache

In\-memory speed for real\-time data

Authentication

JWT \+ bcrypt

Auth system

Industry standard, stateless

Payments

Razorpay SDK

Payment gateway

Best Indian payment gateway, UPI support

File Storage

AWS S3

KYC documents

Secure, scalable, encrypted storage

Email

SendGrid

Transactional email

Reliable delivery, template support

SMS/OTP

MSG91

OTP & SMS

India\-specific, reliable delivery

Hosting \(FE\)

Vercel

Frontend hosting

Free tier, global CDN, instant deploy

Hosting \(BE\)

Railway / AWS EC2

Backend hosting

Scalable, Docker support

DB Hosting

Supabase / AWS RDS

Managed PostgreSQL

Auto backups, scaling

Broker APIs

Upstox \+ Zerodha Kite

Trade data sync

Free paper trading APIs

Queue

Bull \+ Redis

Job processing

Async emails, notifications

Monitoring

Sentry \+ Datadog

Error tracking

Real\-time error alerts

## __7\.3 API Architecture__

The backend exposes a RESTful API with versioned endpoints \(/api/v1/\)\. All endpoints return JSON responses with standardized error codes\. Authentication is enforced via JWT middleware on all protected routes\. Rate limiting is applied globally via express\-rate\-limit\.

## __7\.4 Real\-Time Architecture__

Real\-time P&L updates and risk monitoring are implemented via Socket\.io\. When a trader's broker API reports a new trade execution, the backend risk engine evaluates the trade against all active rules within 5 seconds\. If any rule is violated, the system immediately suspends the account and emits a socket event to update the trader's dashboard in real\-time ÔÇö even if the trader is actively viewing the dashboard\.

# __8\. Database Design__

## __8\.1 Entity Relationship Overview__

The Indipips database is structured around 9 core entities\. PostgreSQL with Prisma ORM is used for all database operations\. All monetary values are stored as integers in paise \(1 rupee = 100 paise\) to avoid floating\-point precision issues in financial calculations\.

## __8\.2 Core Tables__

### __8\.2\.1 Users Table__

__Column__

__Type__

__Constraints__

__Description__

id

UUID

PRIMARY KEY

Unique user identifier

full\_name

VARCHAR\(100\)

NOT NULL

Full name from Aadhaar

email

VARCHAR\(255\)

UNIQUE, NOT NULL

Login email address

phone

VARCHAR\(15\)

UNIQUE, NOT NULL

Mobile number

password\_hash

VARCHAR\(255\)

NOT NULL

Bcrypt hashed password

role

ENUM

NOT NULL, DEFAULT trader

trader / admin / super\_admin

kyc\_status

ENUM

DEFAULT pending

pending / verified / rejected

aadhaar\_verified

BOOLEAN

DEFAULT false

UIDAI verification status

pan\_number

VARCHAR\(10\)

NULLABLE

PAN card number

bank\_account

VARCHAR\(20\)

NULLABLE

Bank account number

bank\_ifsc

VARCHAR\(11\)

NULLABLE

IFSC code

referral\_code

VARCHAR\(10\)

UNIQUE

Auto\-generated referral code

referred\_by

UUID

FK users\.id

Referring user ID

wallet\_balance

BIGINT

DEFAULT 0

Wallet in paise

is\_active

BOOLEAN

DEFAULT true

Account active status

created\_at

TIMESTAMP

DEFAULT NOW\(\)

Registration timestamp

### __8\.2\.2 Challenges Table__

__Column__

__Type__

__Constraints__

__Description__

id

UUID

PRIMARY KEY

Unique challenge ID

user\_id

UUID

FK users\.id, NOT NULL

Trader who owns this challenge

plan\_id

UUID

FK plans\.id, NOT NULL

Challenge plan selected

account\_size

BIGINT

NOT NULL

Virtual account size in paise

current\_balance

BIGINT

NOT NULL

Current simulated balance in paise

peak\_balance

BIGINT

NOT NULL

Highest balance reached \(for drawdown calc\)

total\_pnl

BIGINT

DEFAULT 0

Total P&L in paise

daily\_pnl

BIGINT

DEFAULT 0

Today's P&L in paise

days\_traded

INTEGER

DEFAULT 0

Number of days with at least 1 trade

status

ENUM

NOT NULL

active / passed / failed / expired

fail\_reason

VARCHAR\(100\)

NULLABLE

Reason for failure if applicable

start\_date

DATE

NOT NULL

Challenge start date

expiry\_date

DATE

NOT NULL

Challenge expiry date \(start \+ 45 days\)

passed\_at

TIMESTAMP

NULLABLE

Timestamp when challenge was passed

broker\_connected

BOOLEAN

DEFAULT false

Broker API connection status

created\_at

TIMESTAMP

DEFAULT NOW\(\)

Creation timestamp

### __8\.2\.3 Trades Table__

__Column__

__Type__

__Constraints__

__Description__

id

UUID

PRIMARY KEY

Unique trade ID

challenge\_id

UUID

FK challenges\.id

Associated challenge

user\_id

UUID

FK users\.id

Trader ID

instrument

VARCHAR\(50\)

NOT NULL

Trading symbol \(NIFTY, BANKNIFTY etc\.\)

trade\_type

ENUM

NOT NULL

buy / sell

quantity

INTEGER

NOT NULL

Number of lots/shares

entry\_price

BIGINT

NOT NULL

Entry price in paise

exit\_price

BIGINT

NULLABLE

Exit price in paise \(null if open\)

pnl

BIGINT

DEFAULT 0

Realized P&L in paise

trade\_date

DATE

NOT NULL

Trade date

entry\_time

TIMESTAMP

NOT NULL

Trade entry timestamp

exit\_time

TIMESTAMP

NULLABLE

Trade exit timestamp

broker\_trade\_id

VARCHAR\(50\)

UNIQUE

Broker's trade reference ID

created\_at

TIMESTAMP

DEFAULT NOW\(\)

Record creation time

### __8\.2\.4 Payments Table__

__Column__

__Type__

__Description__

id

UUID

Unique payment ID

user\_id

UUID

Trader who made payment

challenge\_id

UUID

Challenge purchased

amount

BIGINT

Amount paid in paise

razorpay\_order\_id

VARCHAR\(100\)

Razorpay order reference

razorpay\_payment\_id

VARCHAR\(100\)

Razorpay payment reference

status

ENUM

pending / success / failed / refunded

gst\_amount

BIGINT

GST component in paise \(18%\)

created\_at

TIMESTAMP

Payment timestamp

### __8\.2\.5 Payouts Table__

__Column__

__Type__

__Description__

id

UUID

Unique payout ID

user\_id

UUID

Trader requesting payout

challenge\_id

UUID

Funded challenge associated

amount\_requested

BIGINT

Amount requested in paise

amount\_after\_tds

BIGINT

Amount after TDS deduction

profit\_split

DECIMAL\(5,2\)

Trader's profit split percentage

status

ENUM

pending / approved / rejected / transferred

admin\_id

UUID

Admin who processed the request

bank\_reference

VARCHAR\(50\)

NEFT/IMPS transaction reference

requested\_at

TIMESTAMP

Request timestamp

processed\_at

TIMESTAMP

Processing timestamp

# __9\. API Specifications__

## __9\.1 API Standards__

- Base URL: https://api\.indipips\.com/api/v1
- All requests and responses in JSON format
- Authentication: Bearer token \(JWT\) in Authorization header
- HTTP Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error

## __9\.2 Authentication Endpoints__

__Method__

__Endpoint__

__Auth Required__

__Description__

POST

/auth/register

No

Register new trader account

POST

/auth/verify\-email

No

Verify email via OTP

POST

/auth/verify\-phone

No

Verify phone via OTP

POST

/auth/login

No

Login and receive JWT tokens

POST

/auth/logout

Yes

Invalidate refresh token

POST

/auth/refresh

No

Refresh access token

POST

/auth/forgot\-password

No

Send password reset OTP

POST

/auth/reset\-password

No

Reset password using OTP

## __9\.3 Trader Endpoints__

__Method__

__Endpoint__

__Auth Required__

__Description__

GET

/trader/profile

Yes \(Trader\)

Get own profile details

PUT

/trader/profile

Yes \(Trader\)

Update profile information

POST

/trader/kyc/aadhaar

Yes \(Trader\)

Initiate Aadhaar OTP verification

POST

/trader/kyc/verify\-otp

Yes \(Trader\)

Verify Aadhaar OTP

POST

/trader/kyc/bank

Yes \(Trader\)

Submit bank account details

GET

/trader/challenges

Yes \(Trader\)

List all own challenges

GET

/trader/challenges/:id

Yes \(Trader\)

Get specific challenge details

GET

/trader/challenges/:id/trades

Yes \(Trader\)

Get all trades for a challenge

POST

/trader/broker/connect

Yes \(Trader\)

Connect broker API credentials

GET

/trader/broker/status

Yes \(Trader\)

Check broker connection status

GET

/trader/payouts

Yes \(Trader\)

List all payout requests

POST

/trader/payouts

Yes \(Trader\)

Submit new payout request

GET

/trader/referrals

Yes \(Trader\)

Get referral stats and earnings

GET

/trader/certificate/:challengeId

Yes \(Trader\)

Download challenge certificate

## __9\.4 Challenge & Plans Endpoints__

__Method__

__Endpoint__

__Auth Required__

__Description__

GET

/plans

No

Get all available challenge plans

POST

/challenges/purchase

Yes \(Trader\)

Purchase a new challenge

POST

/challenges/payment/verify

Yes \(Trader\)

Verify Razorpay payment

GET

/challenges/:id/dashboard

Yes \(Trader\)

Get real\-time dashboard data

GET

/leaderboard

No

Get public trader leaderboard

GET

/certificates/verify/:code

No

Verify certificate authenticity

## __9\.5 Admin Endpoints__

__Method__

__Endpoint__

__Auth Required__

__Description__

GET

/admin/traders

Yes \(Admin\)

List all traders with filters

GET

/admin/traders/:id

Yes \(Admin\)

Get specific trader full details

PUT

/admin/traders/:id/suspend

Yes \(Admin\)

Suspend trader account

PUT

/admin/traders/:id/reinstate

Yes \(Admin\)

Reinstate suspended account

GET

/admin/payouts

Yes \(Admin\)

List all payout requests

PUT

/admin/payouts/:id/approve

Yes \(Admin\)

Approve payout request

PUT

/admin/payouts/:id/reject

Yes \(Admin\)

Reject payout request

GET

/admin/analytics/revenue

Yes \(Admin\)

Revenue analytics data

GET

/admin/analytics/risk

Yes \(Admin\)

Platform risk exposure

GET

/admin/challenges/active

Yes \(Admin\)

All active challenges

# __10\. UI/UX Requirements__

## __10\.1 Design System__

__Design Element__

__Specification__

Primary Color

\#1A3C6E \(Deep Navy Blue\)

Accent Color

\#D4A017 \(Gold\)

Background \(Dark\)

\#0D1117 \(Near Black\)

Surface Color

\#161B22 \(Dark Card\)

Success Color

\#22C55E \(Green\)

Danger Color

\#EF4444 \(Red\)

Warning Color

\#F59E0B \(Amber\)

Primary Font

Inter \(Google Fonts\)

Default Theme

Dark \(trading industry standard\)

Border Radius

8px for cards, 4px for inputs, 50px for buttons

Responsive Breakpoints

Mobile 320px, Tablet 768px, Desktop 1280px

## __10\.2 Page Specifications__

### __10\.2\.1 Landing Page__

- Hero section: Tagline, CTA button 'Start Your Challenge', animated trading chart background
- How It Works: 3\-step visual flow \(Register > Challenge > Get Funded\)
- Challenge Plans: Pricing table with all 5 plans and features comparison
- Statistics bar: Total funded traders, total payouts, success rate
- Why Indipips: 6 unique advantage cards
- Testimonials: Success stories with trader photo and quote
- FAQ section: Top 10 frequently asked questions
- Footer: Links, social media, legal, contact

### __10\.2\.2 Trader Dashboard__

- Top nav: Logo, notifications bell, profile avatar, logout
- Sidebar: Navigation links ÔÇö Dashboard, Trades, Payout, Referral, Profile, KYC
- Account summary card: Balance, P&L, status badge
- Real\-time P&L chart: TradingView\-style line chart
- Risk meters: Daily loss gauge and drawdown gauge side by side
- Rules checklist: All rules with green checkmark or red X
- Recent trades table: Sortable, filterable
- Challenge progress widget: Circular progress for profit target

### __10\.2\.3 Admin Panel__

- Overview dashboard: Key metrics cards ÔÇö traders today, revenue today, active challenges, pending payouts
- Traders table: Searchable, filterable by status, plan, date
- Payout queue: Tabbed view ÔÇö Pending, Approved, Rejected
- Risk monitor: Color\-coded table of all funded accounts with drawdown levels
- Analytics page: Revenue charts, plan distribution pie chart, trader growth line chart

# __11\. Integration Requirements__

## __11\.1 Broker API Integration ÔÇö Upstox__

- OAuth 2\.0 based authentication flow for trader account connection
- API Key \+ Secret stored encrypted in database
- Order book API: Fetch all executed orders in real\-time
- Positions API: Fetch current open positions
- Portfolio API: Fetch current P&L and holdings
- Webhook subscription for real\-time order updates
- Error handling: Token expiry detection with re\-auth prompt to trader

## __11\.2 UIDAI Aadhaar eKYC Integration__

- Integration via UIDAI authorized API provider \(e\.g\., Digio, Signzy, or NSDL\)
- OTP\-based Aadhaar verification flow
- Name and date of birth fetched from Aadhaar ÔÇö auto\-populated in profile
- No Aadhaar number stored ÔÇö only verification status and masked last 4 digits
- Compliant with UIDAI data localization and retention policies

## __11\.3 Razorpay Payment Integration__

- Razorpay Orders API: Create order before payment initiation
- Razorpay Checkout: Embedded payment modal \(not redirect\-based\)
- Webhook endpoint: /webhooks/razorpay for payment status updates
- Webhook signature verification for security
- Razorpay Refunds API: Initiate challenge fee refunds programmatically
- Razorpay Payouts API: Initiate trader payouts via NEFT/IMPS

## __11\.4 Communication Integrations__

- SendGrid: Transactional emails ÔÇö welcome, challenge updates, payout notifications
- MSG91: OTP delivery, challenge alerts, payout SMS
- Email templates: HTML branded templates for all notification types

## __11\.5 Storage Integration ÔÇö AWS S3__

- KYC documents: PAN, cancelled cheque stored in encrypted S3 buckets
- Certificates: Generated PDF certificates stored and served via S3
- Bucket policy: Private by default ÔÇö access only via signed URLs
- Retention policy: KYC documents retained for 7 years per regulatory requirements

# __12\. Security & Compliance__

## __12\.1 Data Security__

- All sensitive data \(passwords, KYC docs, bank details\) encrypted at rest using AES\-256
- Database encryption enabled at the PostgreSQL level
- API keys and secrets stored in environment variables ÔÇö never in codebase
- Secrets management via AWS Secrets Manager in production
- Regular automated security scanning using OWASP ZAP

## __12\.2 Legal & Regulatory Compliance__

- Business structure: Indipips Private Limited \(to be registered under Companies Act 2013\)
- GST Registration: Mandatory ÔÇö 18% GST on all challenge fees
- TDS compliance: TDS deducted on payouts as per applicable income tax slabs
- All challenges operate on simulated/paper trading accounts ÔÇö not real market orders
- Terms & Conditions: Clearly stating simulated nature of all trading accounts
- Privacy Policy: PDPB \(Personal Data Protection Bill\) compliant
- KYC Policy: AML/KYC compliant as per RBI and UIDAI guidelines
- Age restriction: No user below 18 years allowed ÔÇö enforced via Aadhaar DOB verification

## __12\.3 Audit & Logging__

- All API requests logged with timestamp, user ID, endpoint, response code
- All financial transactions \(payments, payouts\) have immutable audit trail
- Admin actions logged: Who did what and when
- Logs retained for minimum 1 year
- Log monitoring via Datadog with alerts for anomalous patterns

# __13\. Real\-Time Risk Management Engine__

## __13\.1 Overview__

The Risk Management Engine \(RME\) is the core technical differentiator of Indipips\. It monitors all active trader accounts in real\-time and enforces trading rules automatically without manual intervention\. The RME evaluates every incoming trade event and immediately acts if any rule is violated\.

## __13\.2 Risk Engine Flow__

1. Broker API sends trade execution event via webhook
2. RME receives event and identifies the associated challenge account
3. RME updates P&L, daily P&L, current balance, and peak balance
4. RME checks all rules against updated values
5. If no rule violated: emit Socket\.io event to update trader dashboard
6. If rule violated: suspend account, log reason, trigger notifications
7. End of day \(3:31 PM IST\): Evaluate challenge completion status

## __13\.3 Rule Evaluation Logic__

__Rule__

__Evaluation Frequency__

__Trigger Action on Breach__

Daily Loss Limit \(4%\)

Every trade event

Suspend account for rest of trading day, SMS alert

Max Overall Drawdown \(8%\)

Every trade event

Permanently close challenge, email \+ SMS failure alert

Profit Target \(8%\)

Every trade event \(positive P&L\)

Check if target met, trigger pass evaluation

Consistency Rule \(40%\)

End of day evaluation

Flag violation, notify trader with warning first

Minimum Trading Days \(5\)

End of day evaluation

Block pass even if target met until days completed

Maximum Trading Days \(45\)

Daily midnight check

Auto\-expire challenge, failure email sent

Market Hours Compliance

Every trade event

Flag out\-of\-hours trade, warn then disqualify

Overnight Position Check

3:31 PM IST daily

If open positions detected, day loss applied and warning sent

# __14\. Deployment & Scaling Strategy__

## __14\.1 MVP Deployment \(Phase 1 ÔÇö Up to 1,000 Traders\)__

__Component__

__Service__

__Estimated Cost/Month__

Frontend

Vercel \(Free tier\)

Rs\. 0

Backend API

Railway Starter

Rs\. 2,000

Database

Supabase Free / Railway PostgreSQL

Rs\. 0 \- Rs\. 1,500

Redis Cache

Railway Redis

Rs\. 1,000

File Storage

AWS S3 \(pay per use\)

Rs\. 500

Email

SendGrid Free \(100/day\)

Rs\. 0

SMS/OTP

MSG91 \(pay per use\)

Rs\. 2,000

Broker API

Upstox Paper Trade

Rs\. 0

Domain & SSL

Cloudflare \+ Namecheap

Rs\. 1,500/year

Monitoring

Sentry Free Tier

Rs\. 0

Total MVP Monthly

~Rs\. 7,000 \- Rs\. 10,000

## __14\.2 Scaled Deployment \(Phase 2 ÔÇö Post Investment, 10,000\+ Traders\)__

- Migrate backend to AWS EC2 with Auto Scaling Groups
- AWS RDS PostgreSQL with read replicas for high availability
- AWS ElastiCache for Redis cluster
- Cloudflare WAF and DDoS protection enabled
- Docker \+ Kubernetes \(EKS\) for container orchestration
- CI/CD pipeline via GitHub Actions for automated deployments
- Blue\-green deployment strategy for zero\-downtime updates

## __14\.3 Development Phases__

__Phase__

__Timeline__

__Deliverables__

Phase 1 ÔÇö Foundation

Week 1\-2

Project setup, landing page, authentication system

Phase 2 ÔÇö Core Platform

Week 3\-4

Challenge purchase flow, Razorpay integration, basic dashboard

Phase 3 ÔÇö Risk Engine

Week 5\-6

Broker API integration, real\-time P&L, risk management engine

Phase 4 ÔÇö Operations

Week 7\-8

Admin panel, payout system, KYC/Aadhaar integration

Phase 5 ÔÇö Polish

Week 9\-10

Referral program, certificates, notifications, leaderboard

Phase 6 ÔÇö Launch

Week 11\-12

QA testing, security audit, bug fixes, production deployment

# __15\. Glossary__

__Term__

__Full Form / Definition__

SRS

Software Requirements Specification

MVP

Minimum Viable Product ÔÇö first production\-ready release

API

Application Programming Interface

JWT

JSON Web Token ÔÇö used for stateless authentication

KYC

Know Your Customer ÔÇö identity verification process

UIDAI

Unique Identification Authority of India ÔÇö Aadhaar issuing body

PAN

Permanent Account Number ÔÇö Indian tax identification

NEFT

National Electronic Funds Transfer ÔÇö bank transfer method

IMPS

Immediate Payment Service ÔÇö instant bank transfer

TDS

Tax Deducted at Source ÔÇö income tax mechanism

GST

Goods and Services Tax ÔÇö 18% applicable on challenge fees

NSE

National Stock Exchange of India

BSE

Bombay Stock Exchange

F&O

Futures and Options ÔÇö derivative financial instruments

Nifty 50

NSE's flagship index of top 50 companies

BankNifty

NSE's index of top banking sector stocks

MidcapNifty

NSE's midcap index

Drawdown

Reduction in account value from peak balance to current balance

P&L

Profit and Loss ÔÇö net financial performance

RME

Risk Management Engine ÔÇö Indipips real\-time rule enforcement system

OTP

One Time Password ÔÇö used for 2FA and KYC verification

AES\-256

Advanced Encryption Standard 256\-bit ÔÇö industry standard encryption

TLS

Transport Layer Security ÔÇö protocol for secure internet communication

WCAG

Web Content Accessibility Guidelines

IST

Indian Standard Time ÔÇö UTC \+5:30

DXA

Document eXtended Attributes ÔÇö measurement unit in Word documents

OPC

One Person Company ÔÇö single founder company structure in India

SEBI

Securities and Exchange Board of India ÔÇö financial market regulator

# __16\. Document Control__

## __16\.1 Version History__

__Version__

__Date__

__Author__

__Changes__

1\.0

March 2026

Indipips Founding Team

Initial production\-level SRS document ÔÇö complete

## __16\.2 Document Approval__

__Role__

__Name__

__Signature__

__Date__

Founder / Product Owner

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Technical Lead

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Legal Advisor

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

__INDIPIPS PRIVATE LIMITED__

*This document is confidential and proprietary to Indipips Private Limited\.*

*Unauthorized reproduction or distribution is strictly prohibited\.*


