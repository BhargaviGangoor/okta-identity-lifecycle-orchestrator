import type { AuditEvent, DriftItem, Simulation, User } from "./types";

export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Finance",
  "IT",
  "People Ops",
  "Legal",
];

const RAW_GROUP_CATALOG = {
  Engineering: ["okta-eng-all", "gh-engineers", "aws-dev-readonly", "jira-contributors"],
  Sales: ["okta-sales-all", "salesforce-standard", "gong-users", "outreach-seats"],
  Finance: ["okta-fin-all", "netsuite-ap", "expensify-approvers", "bill-pay-review"],
  IT: ["okta-it-all", "okta-super-admin", "aws-prod-admin", "jamf-admins"],
  "People Ops": ["okta-hr-all", "workday-hr-partner", "greenhouse-recruiters"],
  Legal: ["okta-legal-all", "ironclad-editors", "docusign-senders"],
};

const RAW_APP_CATALOG = {
  Engineering: ["GitHub", "AWS", "Jira", "Datadog"],
  Sales: ["Salesforce", "Gong", "Outreach", "Zoom"],
  Finance: ["NetSuite", "Expensify", "Bill.com", "Zoom"],
  IT: ["Okta Admin", "AWS", "Jamf", "PagerDuty"],
  "People Ops": ["Workday", "Greenhouse", "Zoom"],
  Legal: ["Ironclad", "DocuSign", "Zoom"],
};

export const GROUP_CATALOG: Record<string, string[]> = RAW_GROUP_CATALOG;
export const APP_CATALOG: Record<string, string[]> = RAW_APP_CATALOG;

export const users: User[] = [
  {
    id: "00u16lw8ivzYAdNw9698",
    name: "Chethana R",
    email: "chethanar23cy@tnsit.ac.in",
    title: "Financial Analyst II",
    department: "People Ops",
    manager: "Sarah Connor",
    location: "San Francisco, CA",
    status: "ACTIVE",
    risk: "LOW",
    riskScore: 24,
    groups: ["okta-hr-all", "workday-hr-partner"],
    apps: ["Workday", "Zoom", "Slack"],
    lastLogin: "2026-08-23T04:15:00Z",
    startDate: "2024-03-15",
  },
  {
    id: "00u16mlqbxsvAjbdy698",
    name: "Sanjay N",
    email: "sanjayn23cy@rnsit.ac.in",
    title: "Legal Adviser",
    department: "Legal",
    manager: "Elena Rostova",
    location: "New York, NY",
    status: "ACTIVE",
    risk: "MEDIUM",
    riskScore: 42,
    groups: ["okta-legal-all", "ironclad-editors"],
    apps: ["Ironclad", "DocuSign", "Zoom"],
    lastLogin: "2026-08-23T03:50:00Z",
    startDate: "2023-11-01",
  },
  {
    id: "00u16mokebiz2K8xL698",
    name: "Peter Parker",
    email: "spiderman@gmail.com",
    title: "Software Engineer",
    department: "Engineering",
    manager: "Alex Chen",
    location: "Remote - US",
    status: "ACTIVE",
    risk: "LOW",
    riskScore: 18,
    groups: ["okta-eng-all", "gh-engineers", "aws-dev-readonly"],
    apps: ["GitHub", "AWS", "Jira", "Slack"],
    lastLogin: "2026-08-23T04:00:00Z",
    startDate: "2024-01-10",
  },
  {
    id: "00u16mpy19gNK8wyV698",
    name: "Tom Cruise",
    email: "tom@gmail.com",
    title: "Financial Analyst",
    department: "Finance",
    manager: "Marcus Vance",
    location: "Chicago, IL",
    status: "ACTIVE",
    risk: "HIGH",
    riskScore: 68,
    groups: ["okta-fin-all", "netsuite-ap", "expensify-approvers"],
    apps: ["NetSuite", "Expensify", "Bill.com"],
    lastLogin: "2026-08-23T02:30:00Z",
    startDate: "2023-08-20",
  },
  {
    id: "00u16hhotik04SGZE698",
    name: "Rithika Shetty",
    email: "rithikashetty23cy@rnsit.ac.in",
    title: "Security Engineer",
    department: "IT",
    manager: "Jordan Hayes",
    location: "Seattle, WA",
    status: "ACTIVE",
    risk: "CRITICAL",
    riskScore: 82,
    groups: ["okta-it-all", "okta-super-admin", "aws-prod-admin"],
    apps: ["Okta Admin", "AWS", "Jamf", "PagerDuty"],
    lastLogin: "2026-08-23T04:10:00Z",
    startDate: "2022-05-14",
  },
  {
    id: "00u16lvf9jg1ss2tR698",
    name: "Ananya Sharma",
    email: "ananya.sharma.test2026@gmail.com",
    title: "Software Engineer",
    department: "Engineering",
    manager: "Alex Chen",
    location: "Austin, TX",
    status: "SUSPENDED",
    risk: "MEDIUM",
    riskScore: 48,
    groups: ["okta-eng-all"],
    apps: ["GitHub", "Jira"],
    lastLogin: "2026-08-20T11:00:00Z",
    startDate: "2023-02-01",
  }
];

export const simulations: Simulation[] = [
  {
    id: "sim_001",
    timestamp: "2026-08-23T04:10:00Z",
    type: "MOVER",
    targetUser: "Tom Cruise",
    targetUserId: "00u16mpy19gNK8wyV698",
    sourceDept: "Finance",
    targetDept: "Engineering",
    riskScore: 78,
    riskLevel: "HIGH",
    approved: true,
    groupsToAdd: ["okta-eng-all", "gh-engineers", "aws-dev-readonly"],
    groupsToRemove: ["netsuite-ap", "expensify-approvers"],
  },
  {
    id: "sim_002",
    timestamp: "2026-08-23T03:30:00Z",
    type: "JOINER",
    targetUser: "Chethana R",
    targetUserId: "00u16lw8ivzYAdNw9698",
    sourceDept: "External",
    targetDept: "People Ops",
    riskScore: 24,
    riskLevel: "LOW",
    approved: true,
    groupsToAdd: ["okta-hr-all", "workday-hr-partner"],
    groupsToRemove: [],
  }
];

export const drift: DriftItem[] = [
  {
    id: "drift_001",
    userId: "00u16hhotik04SGZE698",
    userName: "Rithika Shetty",
    userEmail: "rithikashetty23cy@rnsit.ac.in",
    department: "IT",
    driftType: "EXTRA_ASSIGNMENT",
    severity: "CRITICAL",
    unauthorizedGroup: "aws-prod-admin",
    detectedAt: "2026-08-23T03:45:00Z",
    reconciled: false,
    reason: "Direct assignment in Okta bypassed Northwind IAM approval pipeline",
  }
];

export const auditEvents: AuditEvent[] = [
  {
    id: "aud_001",
    timestamp: "2026-08-23T04:12:00Z",
    action: "LIFECYCLE_SIMULATION",
    actor: "system-orchestrator",
    target: "Tom Cruise (00u16mpy19gNK8wyV698)",
    status: "SUCCESS",
    details: "What-If risk evaluation completed: 78% blast radius score calculated",
  },
  {
    id: "aud_002",
    timestamp: "2026-08-23T04:05:00Z",
    action: "OKTA_DIRECTORY_SYNC",
    actor: "okta-webhook",
    target: "Okta Org Tenant",
    status: "SUCCESS",
    details: "Synchronized 6 authoritative identities across 6 organizational units",
  },
  {
    id: "aud_003",
    timestamp: "2026-08-23T03:50:00Z",
    action: "DRIFT_SCAN_EXECUTION",
    actor: "drift-daemon",
    target: "Active Directory & Okta",
    status: "WARNING",
    details: "Detected 1 unauthorized privileged group assignment (aws-prod-admin)",
  }
];


