import {
  users as initialUsers,
  simulations as initialSimulations,
  drift as initialDrift,
  auditEvents as initialAudit,
} from "./mock-data";
import type {
  AuditEvent,
  DriftItem,
  Simulation,
  User,
  Impact,
} from "./types";
import { apiFetch, ENDPOINTS, API_BASE_URL } from "../lib/api-client";

// In-memory mock store (used as fallback or in standalone demo mode)
let currentUsers: User[] = [...initialUsers];
let currentSimulations: Simulation[] = [...initialSimulations];
let currentDrift: DriftItem[] = [...initialDrift];
let currentAudit: AuditEvent[] = [...initialAudit];

const delay = (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

// ── GET /api/users ────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const remote = await apiFetch<User[]>(ENDPOINTS.users);
  if (remote && Array.isArray(remote)) {
    return remote.map((u: any) => ({
      id: u.id || u.userId || u.employeeId || `usr_${Math.floor(100 + Math.random() * 900)}`,
      name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
      email: u.email || "",
      title: u.title || u.role || "Team Member",
      department: u.department || "General",
      manager: u.manager || "—",
      location: u.location || "Global",
      status: (u.status as User["status"]) || "ACTIVE",
      riskScore: typeof u.riskScore === "number" ? u.riskScore : 20,
      groups: Array.isArray(u.groups) ? u.groups : [],
      apps: Array.isArray(u.apps) ? u.apps : [],
      lastLogin: u.lastLogin || new Date().toISOString(),
      startDate: u.startDate || "2024-01-01",
    }));
  }
  await delay();
  return [...currentUsers];
}

// ── GET /api/users/{id} ───────────────────────────────────────────
export async function getUser(id: string): Promise<User | undefined> {
  const remote = await apiFetch<User>(ENDPOINTS.user(id));
  if (remote) {
    const u: any = remote;
    return {
      id: u.id || u.userId || u.employeeId || id,
      name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
      email: u.email || "",
      title: u.title || u.role || "Team Member",
      department: u.department || "General",
      manager: u.manager || "—",
      location: u.location || "Global",
      status: (u.status as User["status"]) || "ACTIVE",
      riskScore: typeof u.riskScore === "number" ? u.riskScore : 20,
      groups: Array.isArray(u.groups) ? u.groups : [],
      apps: Array.isArray(u.apps) ? u.apps : [],
      lastLogin: u.lastLogin || new Date().toISOString(),
      startDate: u.startDate || "2024-01-01",
    };
  }
  await delay();
  return currentUsers.find((u) => u.id === id);
}


// ── POST /api/lifecycle/joiner ────────────────────────────────────
export async function createJoiner(data: {
  name: string;
  email: string;
  department: string;
  title: string;
  manager: string;
  location: string;
  startDate: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}): Promise<Simulation> {
  const nameParts = data.name.trim().split(" ");
  const firstName = data.firstName || nameParts[0] || "";
  const lastName = data.lastName || nameParts.slice(1).join(" ") || firstName;
  const payload = {
    ...data,
    employeeId: data.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName,
    lastName,
    role: data.role || data.title,
  };
  const remote = await apiFetch<Simulation>(ENDPOINTS.joiner, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (remote) {
    const raw: any = remote;
    const sim: Simulation = {
      id: raw.id || raw.userId || `sim_${Math.floor(1000 + Math.random() * 9000)}`,
      kind: "JOINER",
      subject: data.name || raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
      subjectEmail: data.email || raw.email || "",
      summary: `New hire, ${data.title} (${data.department}) — starts ${data.startDate}`,
      risk: "LOW",
      riskScore: 18,
      requiresApproval: false,
      status: "APPROVED",
      createdAt: new Date().toISOString(),
      delta: {
        granted: [`okta-${data.department.toLowerCase().replace(/\s+/g, "")}-all`, "google-workspace-user"],
        revoked: [],
        unchanged: [],
      },
      impact: {
        groups: 2,
        apps: 3,
        privileged: 0,
        notes: ["Created and provisioned in Okta."],
      },
    };
    currentSimulations = [sim, ...currentSimulations];
    return sim;
  }
  await delay(100);
  const newSim: Simulation = {
    id: `sim_${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "JOINER",
    subject: data.name,
    subjectEmail: data.email,
    summary: `New hire, ${data.title} (${data.department}) — starts ${data.startDate}`,
    risk: "LOW",
    riskScore: 18,
    requiresApproval: false,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    delta: {
      granted: [`okta-${data.department.toLowerCase().replace(/\s+/g, "")}-all`, "google-workspace-user"],
      revoked: [],
      unchanged: [],
    },
    impact: {
      groups: 2,
      apps: 3,
      privileged: 0,
      notes: ["Birthright baseline matched automatically for department."],
    },
  };
  currentSimulations = [newSim, ...currentSimulations];
  return newSim;
}

// ── PUT /api/lifecycle/mover/{id} ─────────────────────────────────
export async function moveUser(
  id: string,
  data: { department: string; title: string; manager: string; role?: string }
): Promise<Simulation> {
  const payload = {
    ...data,
    role: data.role || data.title,
  };
  const remote = await apiFetch<Simulation>(ENDPOINTS.mover(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (remote) {
    currentSimulations = [remote, ...currentSimulations];
    return remote;
  }
  await delay(100);
  const user = currentUsers.find((u) => u.id === id);
  const newSim: Simulation = {
    id: `sim_${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "MOVER",
    subject: user?.name || id,
    subjectEmail: user?.email || "",
    summary: `Transfer to ${data.department} as ${data.title}`,
    risk: "HIGH",
    riskScore: 72,
    requiresApproval: true,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    delta: {
      granted: [`okta-${data.department.toLowerCase().replace(/\s+/g, "")}-all`],
      revoked: [`okta-${(user?.department || "").toLowerCase().replace(/\s+/g, "")}-all`],
      unchanged: ["okta-mfa-enforced", "zoom-standard"],
    },
    impact: {
      groups: 4,
      apps: 3,
      privileged: 1,
      notes: ["SoD review recommended for target department entitlements."],
    },
  };
  currentSimulations = [newSim, ...currentSimulations];
  return newSim;
}

// ── POST /api/lifecycle/leaver/{id} ───────────────────────────────
export async function leaveUser(
  id: string,
  data?: { reason?: string; effectiveDate?: string }
): Promise<Simulation> {
  const remote = await apiFetch<Simulation>(ENDPOINTS.leaver(id), {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
  if (remote) {
    currentSimulations = [remote, ...currentSimulations];
    return remote;
  }
  await delay(100);
  const user = currentUsers.find((u) => u.id === id);
  const newSim: Simulation = {
    id: `sim_${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "LEAVER",
    subject: user?.name || id,
    subjectEmail: user?.email || "",
    summary: `Deprovision request: ${data?.reason || "Offboarding"}`,
    risk: "CRITICAL",
    riskScore: 89,
    requiresApproval: true,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    delta: {
      granted: [],
      revoked: user?.groups || ["all-assigned-groups"],
      unchanged: [],
    },
    impact: {
      groups: user?.groups.length || 3,
      apps: user?.apps.length || 2,
      privileged: (user?.riskScore || 0) > 50 ? 1 : 0,
      notes: ["Immediate session termination across all downstream SSO federations."],
    },
  };
  currentSimulations = [newSim, ...currentSimulations];
  return newSim;
}

// ── GET /api/impact/{id} ──────────────────────────────────────────
export async function getImpact(id: string, action: string): Promise<Impact> {
  const remote = await apiFetch<Impact>(`${ENDPOINTS.impact(id)}?action=${encodeURIComponent(action)}`);
  if (remote) return remote;
  await delay();
  const user = currentUsers.find((u) => u.id === id);
  return {
    groups: user?.groups.length || 3,
    apps: user?.apps.length || 2,
    privileged: (user?.riskScore || 0) > 60 ? 1 : 0,
    notes: [`Action '${action}' affects active SSO credentials and group bindings.`],
  };
}

// ── POST /api/what-if ─────────────────────────────────────────────
export async function simulate(data: {
  userId: string;
  action: string;
  targetRole?: string;
}): Promise<Simulation> {
  let actionEnum = "DEACTIVATE";
  const a = data.action.toUpperCase();
  if (a.includes("UNSUSPEND") || a.includes("RE-ENABLE")) {
    actionEnum = "UNSUSPEND";
  } else if (a.includes("SUSPEND") || a.includes("FREEZE")) {
    actionEnum = "SUSPEND";
  } else if (a.includes("ACTIVATE") || a.includes("GRANT") || a.includes("ADD") || a.includes("ASSIGN")) {
    actionEnum = "ACTIVATE";
  } else if (a.includes("DEACTIVATE") || a.includes("REVOKE") || a.includes("OFFBOARD")) {
    actionEnum = "DEACTIVATE";
  }

  const remote = await apiFetch<any>(ENDPOINTS.whatIf, {
    method: "POST",
    body: JSON.stringify({
      userId: data.userId,
      action: actionEnum,
    }),
  });
  if (remote) {
    const raw: any = remote;
    const sim: Simulation = {
      id: raw.simulationId || `sim_${Math.floor(1000 + Math.random() * 9000)}`,
      kind: "WHATIF",
      subject: raw.userId || data.userId,
      subjectEmail: "",
      summary: `Simulation: ${data.action} on ${raw.userId || data.userId}`,
      risk: (raw.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") || "HIGH",
      riskScore: raw.riskLevel === "HIGH" ? 78 : raw.riskLevel === "MEDIUM" ? 50 : 20,
      requiresApproval: raw.riskLevel === "HIGH" || raw.riskLevel === "MEDIUM",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      delta: {
        granted: raw.accessEffect?.gains || raw.affectedGroups || [],
        revoked: raw.accessEffect?.loses || [],
        unchanged: [],
      },
      impact: {
        groups: Array.isArray(raw.affectedGroups) ? raw.affectedGroups.length : 0,
        apps: Array.isArray(raw.affectedApplications) ? raw.affectedApplications.length : 0,
        privileged: raw.riskLevel === "HIGH" ? 1 : 0,
        notes: raw.reasons || ["Impact analysis projected successfully."],
      },
    };
    currentSimulations = [sim, ...currentSimulations];
    return sim;
  }
  await delay(120);
  const user = currentUsers.find((u) => u.id === data.userId);
  const isHighRisk = (user?.riskScore || 30) > 50 || data.action.includes("admin") || data.action.includes("Super");
  const sim: Simulation = {
    id: `sim_${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "WHATIF",
    subject: user?.name || "Target Identity",
    subjectEmail: user?.email || "target@northwind.io",
    summary: `Simulation: ${data.action} on ${user?.name || data.userId}`,
    risk: isHighRisk ? "HIGH" : "LOW",
    riskScore: isHighRisk ? 78 : 24,
    requiresApproval: isHighRisk,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    delta: {
      granted: ["aws-security-audit", "jira-super-approver"],
      revoked: [],
      unchanged: user?.groups || [],
    },
    impact: {
      groups: 2,
      apps: 2,
      privileged: isHighRisk ? 1 : 0,
      notes: ["High-impact administrative capability projected."],
    },
  };
  currentSimulations = [sim, ...currentSimulations];
  return sim;
}

// ── POST /api/approval/{simulationId}/approve ─────────────────────
export async function approve(simulationId: string): Promise<Simulation | null> {
  const remote = await apiFetch<Simulation>(ENDPOINTS.approve(simulationId), {
    method: "POST",
  });
  if (remote) return remote;
  await delay(80);
  const sim = currentSimulations.find((s) => s.id === simulationId);
  if (sim) {
    sim.status = "APPROVED";
    currentAudit = [
      {
        id: `aud_${Math.floor(1000 + Math.random() * 9000)}`,
        at: new Date().toISOString(),
        actor: "admin@northwind.io",
        action: "SIMULATION_APPROVED",
        target: `${sim.id} · ${sim.subject}`,
        result: "SUCCESS",
        risk: sim.risk,
        detail: `Simulation ${sim.id} approved by security reviewer.`,
      },
      ...currentAudit,
    ];
  }
  return sim || null;
}

// ── POST /api/approval/{simulationId}/reject ──────────────────────
export async function reject(simulationId: string): Promise<Simulation | null> {
  const remote = await apiFetch<Simulation>(ENDPOINTS.reject(simulationId), {
    method: "POST",
  });
  if (remote) return remote;
  await delay(80);
  const sim = currentSimulations.find((s) => s.id === simulationId);
  if (sim) {
    sim.status = "REJECTED";
    currentAudit = [
      {
        id: `aud_${Math.floor(1000 + Math.random() * 9000)}`,
        at: new Date().toISOString(),
        actor: "admin@northwind.io",
        action: "SIMULATION_REJECTED",
        target: `${sim.id} · ${sim.subject}`,
        result: "FAILED",
        risk: sim.risk,
        detail: `Simulation ${sim.id} rejected due to policy constraint.`,
      },
      ...currentAudit,
    ];
  }
  return sim || null;
}

// ── POST /api/execution/{simulationId} ────────────────────────────
export async function execute(simulationId: string): Promise<Simulation | null> {
  const remote = await apiFetch<any>(ENDPOINTS.execute(simulationId), {
    method: "POST",
  });
  const sim = currentSimulations.find((s) => s.id === simulationId);
  if (sim) {
    sim.status = "EXECUTED";
  }
  if (remote) {
    if (sim) return sim;
    return {
      id: simulationId,
      kind: "WHATIF",
      subject: remote.userId || "Identity",
      subjectEmail: "",
      summary: remote.message || "Executed",
      risk: "LOW",
      riskScore: 20,
      requiresApproval: false,
      status: "EXECUTED",
      createdAt: new Date().toISOString(),
      delta: { granted: [], revoked: [], unchanged: [] },
      impact: { groups: 0, apps: 0, privileged: 0, notes: [] },
    };
  }
  await delay(100);
  return sim || null;
}

// ── GET /api/drift ────────────────────────────────────────────────
export async function getDrift(): Promise<DriftItem[]> {
  const remote = await apiFetch<DriftItem[]>(ENDPOINTS.drift);
  if (remote) return remote;
  await delay();
  return [...currentDrift];
}

// ── POST /api/drift/{id}/remediate ────────────────────────────────
export async function remediateDrift(id: string): Promise<DriftItem | null> {
  const remote = await apiFetch<DriftItem>(ENDPOINTS.remediateDrift(id), {
    method: "POST",
  });
  if (remote) return remote;
  await delay(100);
  const item = currentDrift.find((d) => d.id === id);
  if (item) {
    item.status = "REMEDIATED";
  }
  return item || null;
}

// ── GET /api/audit ────────────────────────────────────────────────
export async function getAudit(): Promise<AuditEvent[]> {
  const remote = await apiFetch<AuditEvent[]>(ENDPOINTS.audit);
  if (remote) return remote;
  await delay();
  return [...currentAudit];
}

// ── GET /api/users/export ─────────────────────────────────────────
export async function exportUsers(): Promise<string> {
  try {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.usersExport}`);
      if (res.ok) return await res.text();
    }
  } catch {}
  await delay();
  const header = "ID,Name,Email,Department,Title,Status,RiskScore\n";
  const rows = currentUsers
    .map(
      (u) =>
        `"${u.id}","${u.name}","${u.email}","${u.department}","${u.title}","${u.status}",${u.riskScore}`
    )
    .join("\n");
  return header + rows;
}
