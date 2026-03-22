# Supplio - B2B Vertical SaaS Platform

## Overview

Supplio is a production-ready Vertical SaaS meant for distributors to manage credit-based sales with their dealers. Designed to be scalable, clean, secure, multi-tenant, and modular.

## Architecture & Tech Stack

- **Backend:** NestJS, Prisma ORM, PostgreSQL.
- **Dashboard:** React.js, TailwindCSS.
- **Landing:** Next.js (SEO Optimized), TailwindCSS.
- **Bot Layer:** Telegraf (Multi-bot architecture).
- **Deployment:** Dockerized Services with Nginx Reverse Proxy on a VDS.

## Multi-tenant Design & Data Security

Every table isolating data holds `companyId`. Queries are strictly scoped per company, meaning no global queries allowed. Incoming requests parse through JWT auth middleware validating user identity, immediately trailed by tenant isolation logic to guarantee data leak prevention.

## Infrastructure

The system operates over Nginx reverse proxy mapping directly to respective docker containers:

- `supplio.uz` -> Landing container (Port 3001 mapped to 3000 NextJS)
- `app.supplio.uz` -> Dashboard container (React, Port 8080)
- `/api` & `/webhook/*` -> Backend container

## Directory Structure

```
supplio/
├── backend/                  # NestJS API, PostgreSQL Schema, TeleBot Integrations
│   ├── prisma/               # Prisma Schema & Migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/             # JWT & Password Hash logic
│   │   ├── companies/        # Tenant configuration
│   │   ├── branches/         # Branch-level scopes
│   │   ├── users/            # Multi-level user hierarchy
│   │   ├── dealers/          # Reseller context
│   │   ├── products/         # Inventory per company
│   │   ├── orders/           # Complex Accounting
│   │   ├── debts/            # Debt Transaction Ledger
│   │   ├── payments/         # Payment gateways or manual ingestion
│   │   ├── subscription/     # SaaS Subscriptions limits
│   │   ├── telegram/         # Dynamic Multi-bot logic
│   │   └── common/           # Middleware, Guards, Decorators, and Interceptors
│   │       └── middleware/   # e.g., TenantGuard, RolesGuard
│   ├── Dockerfile
│   └── package.json
│
├── dashboard/                # React.js Management Dashboard (app.supplio.uz)
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── landing/                  # Next.js Landing Site (supplio.uz)
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                    # Nginx Configuration Proxy setup
│   └── nginx.conf
│
└── docker-compose.yml        # Orchestration layer
```

## Setup & Running Locally

1. Setup environment properties via `.env` inside the `backend` folder matching db variables.
2. Initialize containers via native docker commands:
   ```bash
   docker-compose up --build -d
   ```
3. Database migrations run automatically through Docker container startup. Check backend logs to verify dynamic Telegraf bot initializations.

## RBAC Structure Config

- **OWNER**: Unrestricted. Access all branches.
- **MANAGER**: Strictly scoped to configured `branchId`.
- **SALES**: Restricted to creating orders and dealer assignments on limited branches.

## Clean Code Compliance

This architecture follows SOLID guidelines maintaining isolated DTOs, independent Service layer logic away from Controllers, and strictly enforced environment-based parameters globally to scale securely.
