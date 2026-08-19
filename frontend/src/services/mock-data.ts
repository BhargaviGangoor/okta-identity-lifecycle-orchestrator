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

export const users: User[] = [];

export const simulations: Simulation[] = [];

export const drift: DriftItem[] = [];

export const auditEvents: AuditEvent[] = [];

