export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "DEPROVISIONED";

export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  manager: string;
  location: string;
  status: UserStatus;
  riskScore: number;
  risk?: RiskLevel;
  riskLevel?: RiskLevel;
  groups: string[];
  apps: string[];
  lastLogin: string;
  startDate: string;
}

export interface AccessDelta {
  granted: string[];
  revoked: string[];
  unchanged: string[];
}

export interface Impact {
  groups: number;
  apps: number;
  privileged: number;
  notes: string[];
}

export type SimulationKind = "JOINER" | "MOVER" | "LEAVER" | "WHATIF";
export type SimulationStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";

export interface Simulation {
  id: string;
  kind: SimulationKind;
  subject: string;
  subjectEmail: string;
  summary: string;
  risk: RiskLevel;
  riskScore: number;
  requiresApproval: boolean;
  status: SimulationStatus;
  createdAt: string;
  delta: AccessDelta;
  impact: Impact;
}

export type DriftStatus = "OPEN" | "REMEDIATED" | "IGNORED";

export interface DriftItem {
  id: string;
  user: string;
  userEmail: string;
  entitlement: string;
  oktaState: string;
  policyState: string;
  detectedAt: string;
  risk: RiskLevel;
  riskScore: number;
  status: DriftStatus;
}

export type AuditResult = "SUCCESS" | "FAILED" | "BLOCKED";

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  result: AuditResult;
  risk: RiskLevel;
  detail: string;
}

export interface DashboardMetrics {
  identities: number;
  pendingApprovals: number;
  openDrift: number;
  automationRate: number;
  privilegedAccounts: number;
  avgProvisionMinutes: number;
}

export type GraphNodeType = "USER" | "GROUP" | "APPLICATION";

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  department?: string;
  role?: string;
  status?: string;
  riskScore?: number;
  criticality?: "HIGH" | "MEDIUM" | "LOW" | "NONE";
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: "MEMBER_OF" | "GRANTS_ACCESS" | "DIRECT_ACCESS";
}

export interface GraphMetrics {
  totalUsers: number;
  totalGroups: number;
  totalApplications: number;
  totalNodes: number;
  totalEdges: number;
  highCriticalityApps: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: GraphMetrics;
}

