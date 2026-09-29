# 🌸 SakuraAPI System Architecture & Design

## 1. Executive Summary
**SakuraAPI** is an enterprise-grade game top-up reseller platform. Downstream resellers connect to SakuraAPI via public REST APIs using Bearer API keys (`sk_live_...`) or through the web dashboard. SakuraAPI validates balances, handles price markups, ensures idempotency, and securely dispatches automated top-up orders to the upstream stock provider:

```
[ Downstream Resellers ]
         │ (Bearer sk_live_... or JWT)
         ▼
[ SakuraAPI Gateway ]
 ├── Auth & API Key Validation (SHA-256)
 ├── Rate Limiting (100 req/min sliding-window)
 ├── Atomic Balance Ledger (Decimal 14, 4)
 ├── Idempotency Check (resellerOrderId)
 ├── Pricing & Dynamic Markup Engine
 └── Zero-Loss Auto-Refund Engine
         │ (Internal Provider API Key)
         ▼
[ SoraTopup Upstream API ] (soratopup.com/api/v1)
         │
         ▼
[ Game Top-up Delivery ]
```

---

## 2. Directory Structure

```
SakuraAPI/
├── backend/                  # NestJS TypeScript REST API Backend (Port 4000)
│   ├── prisma/
│   │   ├── schema.prisma     # Production PostgreSQL schema (9 core models)
│   │   ├── migrations/       # Version-controlled SQL migrations
│   │   └── seed.ts           # Demo accounts (Admin & Reseller) & initial catalog
│   ├── src/
│   │   ├── admin/            # Admin control center, reseller & balance management
│   │   ├── api-keys/         # Key generation, revocation & SHA-256 hashing
│   │   ├── auth/             # JWT auth, bcrypt, Dual ResellerApiGuard
│   │   ├── balance/          # Atomic deductions, refunds, and adjustments
│   │   ├── catalog/          # Games and products with markup computation
│   │   ├── common/           # Filters, interceptors, rate-limiting
│   │   ├── orders/           # Automated order placement, status sync
│   │   ├── provider/         # SoraTopup API integration with sandbox mode
│   │   ├── reseller/         # Reseller dashboard analytics & metrics
│   │   └── transactions/     # Immutable funding history ledger
│   ├── vitest.config.ts      # Automated unit testing suite
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js 16 (App Router) TypeScript Dashboard (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/        # Admin portal (/admin, /resellers, /balance, /logs)
│   │   │   ├── api-access/   # API key generation & revocation
│   │   │   ├── categories/   # Game categories & product rates
│   │   │   ├── dashboard/    # Reseller KPI metrics & quick top-up modal
│   │   │   ├── docs/         # Interactive OpenAPI documentation
│   │   │   ├── funding/      # Financial ledger & transaction history
│   │   │   ├── login/        # Sign in page
│   │   │   ├── orders/       # Order tracking, filters, search & detail modal
│   │   │   ├── register/     # Reseller registration
│   │   │   └── page.tsx      # Landing page, architecture overview & health monitor
│   │   ├── components/       # Shared Navigation with mobile drawer & balance
│   │   └── context/          # AuthContext for session management
│   ├── .env.example
│   ├── .env.local
│   ├── package.json
│   └── tailwind.config.ts
│
├── docs/                     # Specifications and phase progress
│   └── ARCHITECTURE.md
│
├── .env.example              # Unified environment variable template
├── package.json              # Root workspace runner scripts
└── README.md                 # Complete getting started guide
```

---

## 3. Database Models (PostgreSQL & Prisma)

| Model | Purpose | Key Attributes |
|---|---|---|
| `User` | User identity & authentication | `id`, `email`, `passwordHash`, `role` (`ADMIN`, `RESELLER`), `status` |
| `Reseller` | Reseller account profile | `userId`, `balance` (`DECIMAL 14, 4`), `markupPercentage`, `fixedMarkup` |
| `ApiKey` | API credentials for resellers | `keyPrefix`, `keyHash` (SHA-256), `rateLimitPerMinute`, `status` |
| `Game` | Game catalog categories | `code`, `name`, `requiresServerId`, `status`, `lastSyncedAt` |
| `Product` | Denominations & top-up items | `gameId`, `code`, `providerPrice`, `resellerPrice`, `status` |
| `Order` | Top-up orders | `orderNumber`, `resellerOrderId`, `playerId`, `serverId`, `amount`, `status` |
| `BalanceTransaction` | Immutable balance audit ledger | `transactionNumber`, `amount`, `previousBalance`, `newBalance`, `type` |
| `ApiRequestLog` | Reseller API usage audit log | `requestId`, `endpoint`, `httpMethod`, `statusCode`, `responseTimeMs` |
| `AdminAction` | Admin auditing records | `adminId`, `action`, `targetEntity`, `details`, `ipAddress` |

---

## 4. Security & Governance Architecture

1. **API Key Security:** Raw keys are only displayed once upon generation. Only the SHA-256 hash and prefix (`sk_live_...`) are persisted.
2. **Atomic Ledger:** Balance updates run within database transactions with row-level locks. Floating-point errors are eliminated with `DECIMAL(14, 4)`.
3. **Zero-Loss Auto Refund:** If SoraTopup returns `FAILED` or connection times out, SakuraAPI instantly credits the reseller's balance and records an `ORDER_REFUND` audit transaction.
4. **Rate Limiting:** Sliding-window counter limits each IP or API key to 100 requests/minute (customizable per reseller), emitting HTTP 429 when exceeded.
5. **API Request Auditing:** All incoming API calls log response time, IP, reseller ID, and status code to `ApiRequestLog`. Sensitive tokens and authorization headers are scrubbed.

---

## 5. Phased Roadmap Status

- **Phase 1 (Completed):** Core architecture, independent project setup, NestJS backend, Next.js frontend, Prisma schema, Swagger docs, environment configuration.
- **Phase 2 (Completed):** Authentication, Reseller & Admin accounts, Password hashing, Role-based access control, Database seeders & Auth UI.
- **Phase 3 (Completed):** Reseller dashboard, Game categories, Product pricing markup, Orders, Funding history, API key generation, Developer API docs.
- **Phase 4 (Completed):** SoraTopup API upstream integration, secure provider service, automated order flow, zero-loss balance refund, and order status sync.
- **Phase 5 (Completed):** Admin panel, reseller management, manual balance credit/debit with audit logs, request monitoring.
- **Phase 6 (Completed):** Security hardening, API rate limiting, validation, error handling, logging, automated Vitest unit testing (26/26 tests passing).
- **Phase 7 (Completed):** UI polish, responsive mobile/desktop audit, documentation, local run instructions.
