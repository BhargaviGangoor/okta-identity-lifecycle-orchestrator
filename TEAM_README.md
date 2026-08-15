# TEAM READ ME — Function & Ownership Contract

This file is the contract between all 8 members.

## Git ownership

```text
main
|
+-- feature/workstream1-okta-lifecycle
|   +-- Member 1
|   +-- Member 2
|
+-- feature/workstream2-identity-impact
|   +-- Member 3
|   +-- Member 4
|
+-- feature/workstream3-simulation-security
|   +-- Member 5
|   +-- Member 6
|
+-- feature/workstream4-dashboard-integration
    +-- Member 7
    +-- Member 8
```

---

# MEMBER 1 — Okta Integration Developer

## Own

```text
backend/src/main/java/com/company/identity/
└── workstream1-okta-lifecycle/
    └── okta/
```

Files:

```text
OktaClient.java
OktaUserClient.java
OktaGroupClient.java
OktaSessionClient.java
```

## Public functions

```java
getUsers()
getUser(String userId)
createUser(User user)
updateUser(String userId, User user)
activateUser(String userId)
deactivateUser(String userId)
getGroups()
getUserGroups(String userId)
getGroupMembers(String groupId)
addUserToGroup(String userId, String groupId)
removeUserFromGroup(String userId, String groupId)
revokeSessions(String userId)
```

## Used by

- Member 2 — JML
- Member 3/4 — identity data
- Member 8 — reconciliation

Do not put lifecycle policy here.

---

# MEMBER 2 — IAM Lifecycle Developer

## Own

```text
workstream1-okta-lifecycle/
├── lifecycle/
└── policy/
```

## Public functions

```java
joiner(JoinerRequest request)
mover(MoverRequest request)
leaver(String userId)

calculateRequiredGroups(String department, String role)

validateLifecycleTransition(...)
checkDuplicateIdentity(...)
```

## Uses

```text
Member 1 -> OktaClient
common -> DTO/model/audit
```

## Joiner

```text
request
 -> validate
 -> duplicate check
 -> policy
 -> create
 -> groups
 -> activate
 -> audit
```

## Mover

```text
current access
 -> calculate required access
 -> remove obsolete access
 -> add required access
 -> audit
```

## Leaver

```text
deactivate
 -> revoke sessions where supported
 -> remove groups
 -> audit
```

---

# MEMBER 3 — Identity Graph Developer

## Own

```text
workstream2-identity-impact/graph/
└── IdentityGraphService.java
```

## Public functions

```java
buildIdentityGraph()
getUserAccess(String userId)
getUserGroups(String userId)
getGroupApplications(String groupId)
getUserApplications(String userId)
```

## Input

User, group and application data from Workstream 1.

## Output

Relationships for Workstream 2 impact calculation.

```text
User -> Group -> Application
```

---

# MEMBER 4 — Impact / Blast Radius Developer

## Own

```text
workstream2-identity-impact/impact/
├── ImpactService.java
└── BlastRadiusService.java
```

## Public functions

```java
calculateImpact(String userId, String action)
calculateBlastRadius(String userId, String action)
calculateRiskScore(ImpactResult impact)
```

## Output

```json
{
  "userId": "00u123",
  "action": "DEACTIVATE",
  "affectedGroups": ["Developers"],
  "affectedApplications": ["AWS", "GitHub", "Jira"],
  "riskLevel": "HIGH",
  "riskScore": 85
}
```

Do not execute Okta mutations.

---

# MEMBER 5 — What-if / Simulation Developer

## Own

```text
workstream3-simulation-security/simulation/
└── WhatIfService.java
```

## Public functions

```java
simulateAction(WhatIfRequest request)
getSimulation(String simulationId)
compareCurrentAndExpected(...)
```

## Critical rule

`simulateAction()` MUST NOT modify Okta.

Flow:

```text
request
 -> current state
 -> expected state
 -> impact
 -> risk
 -> SimulationResult
```

---

# MEMBER 6 — Security Workflow Developer

## Own

```text
workstream3-simulation-security/
├── risk/
├── approval/
└── execution/
```

## Public functions

```java
evaluateRisk(ImpactResult impact)
requiresApproval(RiskResult risk)

approve(String simulationId)
reject(String simulationId)

executeApprovedAction(String simulationId)
```

## Execution rule

```text
What-if
 -> Risk
 -> Approval
 -> Execution
 -> JML Service
 -> OktaClient
 -> Okta
```

Never duplicate Okta API code.

---

# MEMBER 7 — React Frontend Developer

## Own

```text
frontend/src/workstream4-dashboard-integration/
├── pages/
├── components/
└── theme/
```

## Pages

```text
Dashboard
Users
Joiner
Mover
Leaver
WhatIf
Drift
Audit
```

## Components

```text
Navbar
UserTable
StatusBadge
AccessDiff
ImpactCard
RiskBadge
ApprovalDialog
```

Use:

- React
- React Router
- Material UI

Do not call Okta directly.

---

# MEMBER 8 — API Integration + Drift + QA

## Own

```text
frontend/src/workstream4-dashboard-integration/
├── services/
├── hooks/
└── utils/

backend/src/main/java/com/company/identity/
└── workstream4-dashboard-integration/
    ├── controller/
    ├── reconciliation/
    └── integration/

backend/src/test/
```

## Frontend API functions

```javascript
getUsers()
getUser(id)

createJoiner(data)
moveUser(id, data)
leaveUser(id, data)

getImpact(id, action)
simulate(data)

approve(simulationId)
reject(simulationId)
execute(simulationId)

getDrift()
remediateDrift(id)

getAudit()
exportUsers()
```

## REST endpoints

```text
GET    /api/users
GET    /api/users/{id}

POST   /api/lifecycle/joiner
PUT    /api/lifecycle/mover/{id}
POST   /api/lifecycle/leaver/{id}

GET    /api/impact/{id}

POST   /api/what-if

POST   /api/approval/{simulationId}/approve
POST   /api/approval/{simulationId}/reject

POST   /api/execution/{simulationId}

GET    /api/drift
POST   /api/drift/{id}/remediate

GET    /api/audit

POST   /api/bulk
GET    /api/users/export
```

## Drift

```text
Expected state
      |
      v
Identity Twin
      |
   Compare
      ^
      |
Actual Okta state
```

Public functions:

```java
reconcile()
remediate(String driftId)
```

---

# SHARED CONTRACT

Shared folders:

```text
common/model/
common/dto/
common/exception/
common/audit/
```

Do not make breaking changes without notifying all teams.

---

# FUNCTION DEPENDENCY

```text
React
  |
  v
Workstream 4 Controllers
  |
  v
Workstream 3
WhatIf / Risk / Approval
  |
  v
Workstream 2
Graph / Impact
  |
  v
Workstream 1
JML / Policy
  |
  v
OktaClient
  |
  v
Okta
```

Only approved execution can mutate Okta.
