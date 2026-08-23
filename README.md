# 🛡️ Okta Identity Lifecycle Orchestrator

> **Enterprise-Grade Identity Governance, Blast Radius Simulation, and JML Automation for Okta**

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Live_on_Vercel-black?style=for-the-badge&logo=vercel)](https://okta-identity-lifecycle-orchestrator-ixa14lyhd.vercel.app/)
[![Deploy Backend](https://img.shields.io/badge/Backend-Live_on_Render-46E3B7?style=for-the-badge&logo=render)](https://okta-identity-lifecycle-orchestrator.onrender.com/api)
[![Java 17](https://img.shields.io/badge/Java-17_LTS-ED8B00?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Deployments & Endpoints

| Service | Environment | URL |
| :--- | :--- | :--- |
| **🎨 Web Application (Console)** | Vercel Production | [https://okta-identity-lifecycle-orchestrator-ixa14lyhd.vercel.app/]https://okta-identity-lifecycle-orchestrator-ixa14lyhd.vercel.app/) |
| **⚙️ REST API Root** | Render Web Service | [https://okta-identity-lifecycle-orchestrator.onrender.com/api](https://okta-identity-lifecycle-orchestrator.onrender.com/api) |
| **🩺 Health Check API** | Render Web Service | [https://okta-identity-lifecycle-orchestrator.onrender.com/api/health](https://okta-identity-lifecycle-orchestrator.onrender.com/api/health) |
| **👥 Users Directory API** | Render Web Service | [https://okta-identity-lifecycle-orchestrator.onrender.com/api/users](https://okta-identity-lifecycle-orchestrator.onrender.com/api/users) |


---

## 💡 Overview

**Okta Identity Lifecycle Orchestrator** is an authoritative Identity Governance and Administration (IGA) platform designed to bridge the gap between HR systems, security policies, and Okta cloud identity directories.

It solves core enterprise identity challenges:
1. **Pre-Execution Validation**: Simulate and inspect the blast radius of role changes, group assignments, and access grants before committing to Okta.
2. **Zero Standing Privilege (ZSP)**: JIT temporary elevation with automatic time-based revocation.
3. **Out-of-Band Drift Detection**: Continuously monitor Okta logs for manual out-of-band assignments and provide 1-click remediation.
4. **Authoritative JML Workflows**: Automated Joiner (onboarding), Mover (department transfers), and Leaver (instant kill-switch deprovisioning) pipelines with complete audit trails.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT VITE FRONTEND                             │
│       (Living Canvas Mesh + Translucent Frosted Glass Console)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTPS / REST / CORS (*)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    SPRING BOOT BACKEND ENGINE                          │
│                                                                        │
│  ┌────────────────────────┐         ┌──────────────────────────────┐   │
│  │ Workstream 1: JML      │         │ Workstream 2: Graph & Impact │   │
│  │ - Joiner Lifecycle     │         │ - Identity Graph Engine      │   │
│  │ - Mover Department Sync│         │ - Blast Radius Calculator    │   │
│  │ - Leaver Killswitch    │         │ - Entitlement Delta Matrix   │   │
│  └────────────────────────┘         └──────────────────────────────┘   │
│                                                                        │
│  ┌────────────────────────┐         ┌──────────────────────────────┐   │
│  │ Workstream 3: Sim/Risk │         │ Workstream 4: Governance/Ops │   │
│  │ - What-If Sandbox      │         │ - Live Directory Controllers │   │
│  │ - Risk Scoring Engine  │         │ - Out-of-Band Drift Monitor  │   │
│  │ - SOD Policy Validator │         │ - Immutable Audit Trail      │   │
│  └────────────────────────┘         └──────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             OktaClient (Authorized Management API v1)            │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                         HTTPS / SSWS Bearer Auth
                                      │
┌─────────────────────────────────────▼──────────────────────────────────┐
│                           OKTA TENANT                                  │
│         (Users, Groups, Application Tiles, Entitlements)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 👥 Authoritative Directory & Instant Search
- Real-time synchronization with Okta users (`ACTIVE`, `PROVISIONED`, `STAGED`, `SUSPENDED`, `DEPROVISIONED`).
- Multi-dimensional filtering by Department, Risk Tier, and Status.
- Identity detail drawer displaying direct group memberships, assigned application tiles, and security posture.
- 1-click CSV export for compliance reporting.

### 2. ⚡ What-If Blast Radius Simulator
- **Safe Sandbox**: Compute entitlement diffs (`+groups`, `-groups`, `orphaned apps`) prior to execution.
- **Segregation of Duties (SOD)**: Automatic violation detection (e.g., preventing simultaneous `AWS-Production-Admin` and `Financial-Ledger-Auditor` assignments).
- **Risk Score Impact**: Calculates risk percentage shifts before applying changes.

### 3. 🔄 JML Lifecycle Pipelines
- **Joiner (Onboard)**: Automated birthright group assignment based on role and department policies.
- **Mover (Transfer)**: Seamless cross-department role transitions with automatic pruning of obsolete permissions.
- **Leaver (Offboard)**: Emergency 1-click kill switch that revokes all active Okta sessions, strips group access, and deactivates accounts.

### 4. 🔍 Out-of-Band Drift Detection & Auto-Remediation
- Detects unauthorized manual modifications made directly in the Okta admin portal.
- Highlights unmanaged privilege escalation and baseline divergences.
- **1-Click Remediation**: Reverts unauthorized access back to the authoritative governance baseline.

### 5. 🕸️ Interactive Identity Access Graph
- Visual force-directed node graph mapping relationships between Identities, Groups, and Connected SaaS Applications.
- Interactive privilege inspection and dependency tracking.

---

## 🛠️ Technology Stack

### Frontend:
- **Framework**: React 18 + Vite
- **Routing**: TanStack Router (SSR / File-based)
- **Styling**: Tailwind CSS + Custom Living Identity Mesh (Canvas API)
- **Animation**: GSAP + Lucide React Icons
- **HTTP Client**: Axios with automatic Production/Local base URL fallback
- **State & Data Fetching**: TanStack React Query

### Backend:
- **Runtime**: Java 17 LTS
- **Framework**: Spring Boot 3.x (Spring Web, Spring Security, Spring Data JPA)
- **Database**: In-Memory H2 (MySQL Mode) + Spring Data JPA
- **API Integration**: Okta Management REST API (SSWS Token Authentication)
- **Data Seed**: Bundled classpath JSON identity catalogs for instant zero-config bootstrap
- **Containerization**: Docker multi-stage build

---

## 💻 Local Development Setup

### Prerequisites:
- **Java 17+** and **Maven 3.8+**
- **Node.js 18+** and **npm**

### 1. Clone the Repository
```bash
git clone https://github.com/BhargaviGangoor/okta-identity-lifecycle-orchestrator.git
cd okta-identity-lifecycle-orchestrator
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
# Backend Configuration
SERVER_PORT=8081
API_CONTEXT_PATH=/api

# Database
DB_URL=jdbc:h2:mem:identity_orchestrator;DB_CLOSE_DELAY=-1;MODE=MySQL
DB_USERNAME=sa
DB_PASSWORD=

# Okta Management API
OKTA_DOMAIN=https://your-domain.okta.com
OKTA_API_TOKEN=your-okta-ssws-api-token
OKTA_CLIENT_ID=replace-me
OKTA_CLIENT_SECRET=replace-me

# CORS
FRONTEND_ORIGIN=http://localhost:5173

# Frontend API URL
VITE_API_BASE_URL=http://localhost:8081/api
```

### 3. Run the Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
*Backend will start on `http://localhost:8081/api`.*

### 4. Run the Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend will start on `http://localhost:5173`.*

---

## 📊 REST API Endpoints

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/` | Root service overview & status |
| `GET` | `/api/health` | Service health and uptime check |
| `GET` | `/api/users` | Fetch all managed Okta identities |
| `GET` | `/api/users/export` | Export identities as CSV |
| `POST` | `/api/lifecycle/joiner` | Provision new worker identity |
| `POST` | `/api/lifecycle/mover` | Execute department transfer |
| `POST` | `/api/lifecycle/leaver/{id}` | Emergency deprovision identity |
| `POST` | `/api/simulation/what-if` | Run blast radius impact simulation |
| `GET` | `/api/governance/drift` | Check out-of-band drift detections |
| `POST` | `/api/governance/drift/remediate` | Auto-remediate identified drift |
| `GET` | `/api/graph` | Fetch identity access graph topology |
| `GET` | `/api/audit/logs` | Fetch governance audit log trail |

---

## 👥 Team & Ownership

| Workstream | Area | Scope |
| :--- | :--- | :--- |
| **Workstream 1** | Okta & Lifecycle | Okta Client, Joiner/Mover/Leaver, Birthright Policies |
| **Workstream 2** | Identity Graph & Impact | Access Graph, Blast Radius Matrix, Entitlement Diffs |
| **Workstream 3** | Simulation & Security | What-If Engine, SOD Enforcement, Risk Scoring |
| **Workstream 4** | Console & Governance | Dashboard, Drift Remediation, Audit Logging, CI/CD |

---

## 📄 License
This project was developed for the Cognizant Hackathon (Activity 5). Distributed under the MIT License.
