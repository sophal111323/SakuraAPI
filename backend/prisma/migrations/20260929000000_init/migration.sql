-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESELLER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "ResellerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ApiKeyEnvironment" AS ENUM ('LIVE', 'TEST');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'DISABLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ADMIN_CREDIT', 'ADMIN_DEBIT', 'ORDER_PAYMENT', 'ORDER_REFUND', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RESELLER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resellers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "balance" DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "ResellerStatus" NOT NULL DEFAULT 'ACTIVE',
    "pricingTier" TEXT NOT NULL DEFAULT 'DEFAULT',
    "markupPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "fixedMarkup" DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "resellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Key',
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "environment" "ApiKeyEnvironment" NOT NULL DEFAULT 'LIVE',
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 100,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "iconUrl" TEXT,
    "requiresServerId" BOOLEAN NOT NULL DEFAULT false,
    "serverIdLabel" TEXT DEFAULT 'Server ID',
    "playerIdLabel" TEXT DEFAULT 'Player ID',
    "status" "GameStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerPrice" DECIMAL(12,4) NOT NULL,
    "resellerPrice" DECIMAL(12,4) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "providerProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "resellerId" TEXT NOT NULL,
    "resellerOrderId" TEXT,
    "gameId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "serverId" TEXT,
    "amount" DECIMAL(12,4) NOT NULL,
    "providerPrice" DECIMAL(12,4) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "providerOrderId" TEXT,
    "providerResponse" JSONB,
    "failureReason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_transactions" (
    "id" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "resellerId" TEXT NOT NULL,
    "amount" DECIMAL(14,4) NOT NULL,
    "previousBalance" DECIMAL(14,4) NOT NULL,
    "newBalance" DECIMAL(14,4) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "orderId" TEXT,
    "adminId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_request_logs" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "resellerId" TEXT,
    "apiKeyId" TEXT,
    "endpoint" TEXT NOT NULL,
    "httpMethod" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "targetId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "resellers_userId_key" ON "resellers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_resellerId_idx" ON "api_keys"("resellerId");

-- CreateIndex
CREATE INDEX "api_keys_keyPrefix_idx" ON "api_keys"("keyPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "games_code_key" ON "games"("code");

-- CreateIndex
CREATE INDEX "games_code_idx" ON "games"("code");

-- CreateIndex
CREATE INDEX "products_gameId_idx" ON "products"("gameId");

-- CreateIndex
CREATE INDEX "products_code_idx" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_gameId_code_key" ON "products"("gameId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_resellerId_idx" ON "orders"("resellerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_resellerId_resellerOrderId_key" ON "orders"("resellerId", "resellerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "balance_transactions_transactionNumber_key" ON "balance_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "balance_transactions_resellerId_idx" ON "balance_transactions"("resellerId");

-- CreateIndex
CREATE INDEX "balance_transactions_transactionNumber_idx" ON "balance_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "balance_transactions_type_idx" ON "balance_transactions"("type");

-- CreateIndex
CREATE INDEX "balance_transactions_createdAt_idx" ON "balance_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_request_logs_requestId_key" ON "api_request_logs"("requestId");

-- CreateIndex
CREATE INDEX "api_request_logs_resellerId_idx" ON "api_request_logs"("resellerId");

-- CreateIndex
CREATE INDEX "api_request_logs_apiKeyId_idx" ON "api_request_logs"("apiKeyId");

-- CreateIndex
CREATE INDEX "api_request_logs_endpoint_idx" ON "api_request_logs"("endpoint");

-- CreateIndex
CREATE INDEX "api_request_logs_statusCode_idx" ON "api_request_logs"("statusCode");

-- CreateIndex
CREATE INDEX "api_request_logs_createdAt_idx" ON "api_request_logs"("createdAt");

-- CreateIndex
CREATE INDEX "admin_actions_adminId_idx" ON "admin_actions"("adminId");

-- CreateIndex
CREATE INDEX "admin_actions_action_idx" ON "admin_actions"("action");

-- CreateIndex
CREATE INDEX "admin_actions_createdAt_idx" ON "admin_actions"("createdAt");

-- AddForeignKey
ALTER TABLE "resellers" ADD CONSTRAINT "resellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "resellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "resellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "resellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "resellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
