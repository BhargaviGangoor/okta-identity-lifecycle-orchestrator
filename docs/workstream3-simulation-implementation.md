# Workstream 3 — What-If Simulation Module

**Branch:** `feature/workstream3-simulation-security`  
**Owner:** Member 5 — What-If Simulation (Nandita)  
**Status:** ✅ Implemented (standalone, read-only, mock-ready)

---

## What Was Built

The complete **What-If Simulation** sub-module for Workstream 3. It lets a caller ask _"what would happen if I applied this lifecycle action to this user?"_ and receive a deterministic, read-only projection — **nothing is written to Okta**.

---

## New Files

### `common/model/Action.java`
Frozen lifecycle action enum shared across all workstreams.

```java
public enum Action { ACTIVATE, SUSPEND, UNSUSPEND, DEACTIVATE }
```

- Exactly four values — no synonyms (`enable`, `disable`, `activate_user`, etc.).
- Used as the type for `action` fields in all DTOs so invalid strings are rejected at JSON deserialization time (HTTP 400).

---

### `common/dto/ImpactOutput.java`
Frozen **WS2 → WS3** contract DTO (Workstream 2 output / Workstream 3 input).

| Field | Type | Notes |
|---|---|---|
| `userId` | `String` | Okta user ID |
| `action` | `Action` | Proposed lifecycle action |
| `affectedGroups` | `List<String>` | Groups affected |
| `affectedApplications` | `List<String>` | Applications affected |
| `riskLevel` | `String` | `LOW` \| `MEDIUM` \| `HIGH` — passthrough, never recomputed |
| `reasons` | `List<String>` | Risk rationale — passthrough |
| `accessEffect` | `Object` | String or small object describing access delta — passthrough |

> ⚠️ **No `riskScore` field.** The frozen contract uses `riskLevel` (categorical) only. WS3 never calculates a numeric score.

---

### `common/dto/WhatIfResult.java`
Simulation result — shaped for **WS4 (React dashboard) direct consumption**.

| Field | Type | Source |
|---|---|---|
| `userId` | `String` | From request |
| `proposedAction` | `Action` | From request |
| `currentStatus` | `String` | Inferred from action (display-only, no Okta call) |
| `expectedStatus` | `String` | Inferred from action (display-only, no Okta call) |
| `affectedGroups` | `List<String>` | Passthrough from `ImpactOutput` |
| `affectedApplications` | `List<String>` | Passthrough from `ImpactOutput` |
| `riskLevel` | `String` | Passthrough from `ImpactOutput` |
| `reasons` | `List<String>` | Passthrough from `ImpactOutput` |
| `accessEffect` | `Object` | Passthrough from `ImpactOutput` |

State transitions derived:

| Action | `currentStatus` | `expectedStatus` |
|---|---|---|
| `ACTIVATE` | `STAGED_OR_SUSPENDED` | `ACTIVE` |
| `SUSPEND` | `ACTIVE` | `SUSPENDED` |
| `UNSUSPEND` | `SUSPENDED` | `ACTIVE` |
| `DEACTIVATE` | `ACTIVE` | `DEPROVISIONED` |

---

### `workstream3_simulation_security/simulation/ImpactOutputFixtures.java`
Static mock fixtures for **standalone development and testing** — no dependency on a live WS2 `ImpactService`.

Covers **all 4 actions × all 3 risk levels** (10 fixtures):

| Fixture method | Action | Risk |
|---|---|---|
| `activateLow()` | ACTIVATE | LOW |
| `activateMedium()` | ACTIVATE | MEDIUM |
| `activateHigh()` | ACTIVATE | HIGH |
| `suspendLow()` | SUSPEND | LOW |
| `suspendMedium()` | SUSPEND | MEDIUM |
| `suspendHigh()` | SUSPEND | HIGH |
| `unsuspendMedium()` | UNSUSPEND | MEDIUM |
| `deactivateMedium()` | DEACTIVATE | MEDIUM |
| `deactivateHigh()` | DEACTIVATE | HIGH |
| `defaultFor(userId, action)` | any | MEDIUM (convenience) |

---

## Modified Files

### `common/dto/WhatIfRequest.java`
Replaced the bare POJO with a validated DTO:

- `userId` → `@NotBlank` — blank/missing → **HTTP 400**
- `action` → typed `Action` enum — invalid string (e.g. `"ENABLE"`) → **HTTP 400** at deserialization

### `workstream3_simulation_security/simulation/WhatIfService.java`
Full implementation replacing the null-returning stub.

**Hard constraints enforced:**
- `@Service` — Spring-managed, constructor takes **zero arguments** (no Okta/Approval/Execution deps)
- Imports only `common/dto` and `common/model` — no WS1, no WS3 risk/approval/execution packages
- Deterministic: same `WhatIfRequest` + same `ImpactOutput` → identical `WhatIfResult` every call
- `riskLevel`, `reasons`, `accessEffect` are `assertSame`-level passthroughs — no copy, no recalc

### `workstream4_dashboard_integration/controller/WhatIfController.java`
Full implementation of `POST /api/whatif`:

```
POST /api/whatif
Content-Type: application/json

{
  "userId": "00u123abc",
  "action": "ACTIVATE"
}
```

- Accepts `@Valid @RequestBody WhatIfRequest`
- Returns `ResponseEntity<WhatIfResult>` (HTTP 200)
- Mock `ImpactOutput` wired from `ImpactOutputFixtures.defaultFor(...)` with a clear `TODO` comment to swap for real `ImpactService` when WS2 is ready
- **Never calls** `ApprovalService`, `ExecutionService`, or any Okta mutation

### `common/exception/GlobalExceptionHandler.java`
Added two 400 handlers:

| Exception | Cause | Response |
|---|---|---|
| `MethodArgumentNotValidException` | `@NotBlank` / `@NotNull` failure | `400` + `{ fieldErrors: { userId: "..." } }` |
| `HttpMessageNotReadableException` | Invalid enum string for `action` | `400` + message listing the 4 valid values |

---

## Tests

### `WhatIfServiceTest.java` — 11 unit tests (plain JUnit, no Spring context)

| Test | Verifies |
|---|---|
| `simulate_isDeterministic` | Same input → same output on repeated calls |
| `simulate_activate_stateTransition` | ACTIVATE: STAGED_OR_SUSPENDED → ACTIVE |
| `simulate_suspend_stateTransition` | SUSPEND: ACTIVE → SUSPENDED |
| `simulate_unsuspend_stateTransition` | UNSUSPEND: SUSPENDED → ACTIVE |
| `simulate_deactivate_stateTransition` | DEACTIVATE: ACTIVE → DEPROVISIONED |
| `simulate_riskLevel_isPassthrough` | `riskLevel` equals `ImpactOutput.riskLevel` |
| `simulate_reasons_arePassthrough` | `reasons` is the same reference (not a copy) |
| `simulate_accessEffect_isPassthrough` | `accessEffect` is the same reference |
| `simulate_affectedCollections_arePassthrough` | groups + apps are the same references |
| `structural_noOktaOrApprovalDependency` | `new WhatIfService()` succeeds with zero args |
| `structural_noForbiddenImports` | Reflection confirms no Okta/Approval/Execution fields |
| `structural_noRiskScoreField` | `WhatIfResult` has no `riskScore` field |
| `simulate_userId_isPreserved` | `userId` from request appears in result |

### `WhatIfControllerTest.java` — 13 MockMvc tests (`@WebMvcTest`)

| Test | Expected |
|---|---|
| ACTIVATE request | 200 + correct `currentStatus`/`expectedStatus` + no `riskScore` |
| SUSPEND request | 200 + correct state transition |
| UNSUSPEND request | 200 + correct state transition |
| DEACTIVATE request | 200 + correct state transition |
| `action: "ENABLE"` | 400 |
| `action: "disable"` | 400 |
| `action: "activate_user"` | 400 |
| `action: 42` (numeric) | 400 |
| Missing `userId` | 400 + `fieldErrors.userId` present |
| Blank `userId` (`"   "`) | 400 + `fieldErrors.userId` present |
| Empty `userId` (`""`) | 400 + `fieldErrors.userId` present |
| All 4 actions (loop) | 200, no `riskScore` field in any response |

---

## Constraints Respected

| Constraint | How enforced |
|---|---|
| No numeric `riskScore` | Not present in any DTO, fixture, or test; structural test asserts absence |
| Only 4 exact action strings | `Action` enum — any other string is a 400 at deserialization |
| No Okta mutation | `WhatIfService` imports contain no WS1/okta package; structural test uses reflection |
| No `ApprovalService` / `ExecutionService` | Same import restriction + structural test |
| `riskLevel` / `reasons` / `accessEffect` are passthroughs | `assertSame` tests prove no copy or recompute |
| Deterministic | Same-input-same-output test |
| WS4-ready response shape | Field names frozen in `WhatIfResult`; no further transformation needed by frontend |

---

## Integration Handoff Notes

### For Workstream 2 (ImpactService)
When your real `ImpactService` is ready, swap the single mock line in `WhatIfController`:

```java
// Replace this:
ImpactOutput impact = ImpactOutputFixtures.defaultFor(request.userId, request.action);

// With this:
ImpactOutput impact = impactService.calculateImpact(request.userId, request.action.name());
```

Inject `ImpactService` via the controller's constructor.

### For Workstream 4 (React Dashboard)
Call `POST /api/whatif` with:
```json
{ "userId": "<okta-user-id>", "action": "ACTIVATE | SUSPEND | UNSUSPEND | DEACTIVATE" }
```
Response is `WhatIfResult` — field names are frozen, no transformation needed.

### ⚠️ Flag for Workstream 2
`BlastRadiusService.calculateRiskScore()` returns `int` — this conflicts with the frozen contract (categorical `riskLevel` only, no numeric score). Please align before integration.
