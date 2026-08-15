# Okta Identity Lifecycle Orchestrator

Cognizant Hackathon — Activity 5

## Final 2-Day Team Repository

### Stack

- Frontend: React + Vite + React Router + Axios + Material UI
- Backend: Java 17 + Spring Boot + Maven
- Database: MySQL + Spring Data JPA
- Identity: Okta Management REST API
- Testing: JUnit + Mockito + Postman
- DevOps: Git + GitHub Actions + Docker

## Team ownership

| Workstream | Members | Responsibility |
|---|---|---|
| 1. Okta & Lifecycle | Member 1 + Member 2 | Okta API + Joiner/Mover/Leaver + Policy |
| 2. Identity Graph & Impact | Member 3 + Member 4 | Identity Graph + Blast Radius |
| 3. Simulation & Security Workflow | Member 5 + Member 6 | What-if + Risk + Approval + Execution |
| 4. Dashboard & Integration | Member 7 + Member 8 | React Dashboard + API Integration + Drift + Testing |

## Architecture

```text
React / MUI
     |
     | Axios / REST
     v
Spring Boot
     |
     +--> Workstream 4 Controllers
     |
     +--> Workstream 3 Simulation / Security
     |
     +--> Workstream 2 Graph / Impact
     |
     +--> Workstream 1 JML / Policy
     |
     v
  OktaClient
     |
     v
 Okta REST API
     |
     v
 Okta Tenant

Spring Data JPA --> MySQL
```

## Important rules

1. React never calls Okta directly.
2. Only `OktaClient` performs Okta operations.
3. What-if simulation is read-only.
4. Impact calculation never mutates Okta.
5. High-risk operations require approval before execution.
6. Shared models and DTOs are contracts; tell all teams before changing them.
7. Never commit `.env` or real Okta credentials.
8. Do not add microservices, Kafka, Redis, Neo4j, Python or Streamlit for this 2-day build.

See `TEAM_README.md` for every member's files and public function contracts.
