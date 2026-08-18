# TEAM ECHO — Identity Governance for Okta

Production-grade React & TanStack Start frontend for the Okta Identity Lifecycle Orchestrator (TEAM ECHO IAM).

## Architecture & Integration Contract

The frontend connects directly to the Spring Boot REST API layer (Workstream 4) and provides a standalone in-memory fallback for local development:

```text
React (TanStack Start) 
   │
   ▼
Spring Boot REST Controllers (/api)
   │
   ▼
Lifecycle Services (Joiner / Mover / Leaver / What-If / Drift / Audit)
   │
   ▼
Okta Management REST Client
   │
   ▼
Okta Production Tenant
```

## Available Governance Consoles & Routes

| Route | Module | Purpose |
|---|---|---|
| `/` | **Overview** | Interactive editorial homepage & system visualizer |
| `/users` | **Identities** | Searchable identity directory & CSV export |
| `/joiner` | **Joiner** | Birthright entitlement assignment & duplicate prevention |
| `/mover` | **Mover** | Cross-department role recalculation & access diff |
| `/leaver` | **Leaver** | Revocation workflow & immediate token invalidation |
| `/whatif` | **What-If** | Read-only blast radius calculation & risk scoring |
| `/drift` | **Drift** | Digital twin reconciliation vs Okta tenant state |
| `/audit` | **Audit** | Immutable cryptographic event audit ledger |

## Development & Build

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

## Backend API Configuration

Set the backend base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```
