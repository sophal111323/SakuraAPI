# 🌸 SakuraAPI - Automated Game Top-up Reseller Platform

SakuraAPI is a game top-up reseller platform that connects downstream resellers to upstream stock via the **SoraTopup API** (`https://soratopup.com/api/v1`).

---

## 🌟 Architecture Flow

```
Reseller (sk_live_...) ➔ SakuraAPI Gateway ➔ SoraTopup API ➔ Instant Game Top-up
```

- **Reseller API Access:** Secure Bearer API Keys (`sk_live_...`) with SHA-256 storage.
- **Atomic Balance Ledger:** `DECIMAL(14, 4)` precision with immutable transaction history.
- **Provider Abstraction:** Modular provider adapter designed for upstream stock syncing with sandbox testing fallback.
- **Rate Limiting:** Sliding-window rate limiter (100 req/min default, configurable per reseller tier).
- **Automated Refunds:** Zero-loss balance refund if upstream provider fulfillment fails.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** NestJS, TypeScript, REST API, Swagger/OpenAPI.
- **Database & ORM:** PostgreSQL, Prisma ORM with financial Decimal handling.
- **Testing:** Vitest (unit test suites for auth, balance, orders, and rate limiting).
- **Security:** Helmet, CORS, Class-Validator, JWT, bcrypt, SHA-256 API key hashing.

---

## 📁 Project Structure

```
SakuraAPI/
├── backend/                  # NestJS TypeScript REST API Backend (Port 4000)
│   ├── prisma/
│   │   ├── schema.prisma     # Production PostgreSQL schema (9 core models)
│   │   ├── migrations/       # Version-controlled SQL migrations
│   │   └── seed.ts           # Demo accounts & seed catalog
│   ├── src/                  # NestJS Modules (Auth, Balance, Orders, Provider, Admin, etc.)
│   └── vitest.config.ts      # Unit test configuration
├── frontend/                 # Next.js 16 Responsive Dashboard (Port 3000)
│   ├── src/app/              # Next.js App Router (Dashboard, Catalog, Orders, Admin, etc.)
│   ├── src/components/       # Unified Navigation & UI components
│   └── src/context/          # AuthContext for session management
├── docs/                     # Architecture & Phase documentation
├── .env.example              # Environment variables template
├── package.json              # Root workspace runner scripts
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js:** v18+ (tested on v25)
- **PostgreSQL:** Running locally or a cloud PostgreSQL instance (Neon, Supabase, Docker, etc.)

---

### 2. Configure Environment Variables

Create `.env` in `backend/` and `.env.local` in `frontend/`:

**Backend (`backend/.env`):**
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sakuraapi?schema=public"
JWT_SECRET="sakura-super-secret-jwt-key-2026-production"
JWT_EXPIRES_IN="7d"

# Upstream Provider (SoraTopup)
SORATOPUP_BASE_URL="https://soratopup.com/api/v1"
SORATOPUP_API_KEY="your_upstream_api_key_here"
SORATOPUP_SECRET="your_upstream_secret_here"

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

### 3. Database Migration & Seed

Run database migrations and seed default Admin, Reseller, and Games:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

#### Default Seed Accounts:
| Role | Email | Password | Initial Balance |
|---|---|---|---|
| **Admin** | `admin@sakuraapi.com` | `Admin@Sakura123!` | N/A (Full access) |
| **Reseller** | `reseller@sakuraapi.com` | `Reseller@Sakura123!` | **$100.00 USD** |

---

### 4. Start Development Servers

You can start both frontend and backend concurrently from the root directory:

```bash
# Start both Backend and Frontend together
npm run dev
```

Or start them individually in separate terminals:

```bash
# Terminal 1: Backend (NestJS on Port 4000)
npm run dev:backend

# Terminal 2: Frontend (Next.js on Port 3000)
npm run dev:frontend
```

- **Frontend Portal:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000/api/v1`
- **Swagger Documentation:** `http://localhost:4000/api/docs`
- **Health Check:** `http://localhost:4000/api/v1/health`

---

### 5. Running Automated Tests

Run unit tests across backend services:

```bash
npm run test:backend
# or: cd backend && npm test
```

All 26 automated unit test suites covering:
* `RateLimitService` (sliding-window calculations & 429 rejections)
* `AuthService` (login, registration, password hashing)
* `BalanceService` (atomic deductions, auto-refunds, admin adjustments)
* `OrdersService` (idempotency, provider dispatch, auto-refunds)

---

## ⚡ API Quick Start for Resellers

### 1. Check Available Games & Pricing
```bash
curl -X GET http://localhost:4000/api/v1/games
```

### 2. Check Wallet Balance
```bash
curl -X GET http://localhost:4000/api/v1/balance \
  -H "Authorization: Bearer sk_live_YOUR_API_KEY"
```

### 3. Validate Game Player ID (In-game Name Check via Bay2Game)
```bash
curl -X POST http://localhost:4000/api/v1/games/check-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \
  -d '{
    "game": "mobile-legends",
    "userid": "12345678",
    "serverid": "1234"
  }'
```

Response:
```json
{
  "valid": true,
  "username": "SakuraPro99",
  "region": "Asia",
  "gameTitle": "Mobile Legends",
  "gameCode": "mlbb",
  "userId": "12345678",
  "serverId": "1234",
  "message": "Player ID verified successfully"
}
```

### 4. Place Automated Top-up Order
```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \
  -d '{
    "game": "mobile-legends",
    "product": "mlbb-86",
    "player_id": "12345678",
    "server_id": "1234",
    "reseller_order_id": "ORD-MY-STORE-001"
  }'
```

### 4. Response Format
```json
{
  "success": true,
  "data": {
    "order_id": "SK-20260929-781923",
    "reseller_order_id": "ORD-MY-STORE-001",
    "status": "SUCCESS",
    "game": "Mobile Legends: Bang Bang",
    "product": "86 Diamonds",
    "player_id": "12345678",
    "server_id": "1234",
    "amount": "1.45",
    "currency": "USD",
    "provider_order_id": "SORA-1727600000",
    "created_at": "2026-09-29T14:30:00.000Z"
  }
}
```

---

## 📋 Phased Progress Status

- [x] **PHASE 1:** Independent project scaffold, NestJS backend, Next.js frontend, Prisma ORM schema, Swagger docs, environment configuration.
- [x] **PHASE 2:** Authentication, Reseller & Admin accounts, Password hashing, Role-based access control, Database seeders & Auth UI.
- [x] **PHASE 3:** Reseller dashboard, Game categories, Product pricing markup, Orders, Funding history, API key generation, Developer API docs.
- [x] **PHASE 4:** SoraTopup API upstream integration, stock sync, auto-order flow, error/refund safety.
- [x] **PHASE 5:** Admin management console, reseller controls, manual balance adjustments with audit logs.
- [x] **PHASE 6:** Rate limiting (100 req/min), security hardening, input sanitization, automated unit tests (26/26 passing).
- [x] **PHASE 7:** UI polish, mobile responsiveness, end-to-end testing, local run instructions.
