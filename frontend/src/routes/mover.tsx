import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UserCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  ShieldAlert,
  ArrowRightLeft,
  Lock,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { getUsers, moveUser } from "../services/api";
import { DEPARTMENTS, GROUP_CATALOG } from "../services/mock-data";
import type { User, Simulation } from "../services/types";
import { AccessDiff } from "../components/AccessDiff";
import { RiskBadge } from "../components/RiskBadge";
import { ImpactCard } from "../components/ImpactCard";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/mover")({
  component: MoverTransitionPage,
});

const DEPARTMENT_ROLES: Record<string, string[]> = {
  Finance: ["Financial Analyst II", "Senior FinOps Engineer", "Controller", "Billing Specialist"],
  Engineering: ["Software Engineer II", "Senior DevOps Engineer", "Staff Backend Engineer", "QA Automation Lead"],
  Sales: ["Enterprise Account Executive", "Sales Engineer", "Solutions Architect", "BDR Specialist"],
  IT: ["IT Systems Administrator", "Endpoint Support Lead", "Identity & Access Analyst"],
  "People Ops": ["HR Business Partner", "Technical Recruiter", "People Operations Specialist"],
  Legal: ["Compliance Counsel", "Corporate Legal Associate", "Regulatory Governance Officer"],
};

export function MoverTransitionPage() {
  const navigate = useNavigate();
  const { success, warning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newDept, setNewDept] = useState<string>("Finance");
  const [newTitle, setNewTitle] = useState<string>("Financial Analyst II");
  const [newManager, setNewManager] = useState<string>("Grace Lindqvist");
  const [createdSim, setCreatedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      if (data.length > 0 && data[0]?.id) setSelectedUserId(data[0].id);
    });
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const [customGranted, setCustomGranted] = useState<string[]>([]);
  const [customRevoked, setCustomRevoked] = useState<string[]>([]);
  const [newGrantInput, setNewGrantInput] = useState("");
  const [newRevokeInput, setNewRevokeInput] = useState("");

  // Recalculate delta whenever department or selected user changes
  useEffect(() => {
    if (selectedUser) {
      const currentGroups = selectedUser.groups || [];
      const targetGroups = GROUP_CATALOG[newDept] || [];
      setCustomGranted(targetGroups.filter((g) => !currentGroups.includes(g)));
      setCustomRevoked(currentGroups.filter((g) => !targetGroups.includes(g)));

      // Auto update title suggestion for new department
      const defaultRoles = DEPARTMENT_ROLES[newDept] || ["Senior Specialist"];
      if (!defaultRoles.includes(newTitle)) {
        setNewTitle(defaultRoles[0]);
      }
    }
  }, [selectedUserId, newDept, selectedUser]);

  // Toxic Segregation of Duties detection
  const sodViolations = useMemo(() => {
    const issues: string[] = [];
    if (selectedUser) {
      const current = selectedUser.department;
      if (current === "Engineering" && newDept === "Finance") {
        issues.push("High-risk transfer: Developer source code commit access must be purged before granting NetSuite Financial Ledger access.");
      }
      if (selectedUser.groups?.includes("AWS-Production-Admins") && newDept !== "Engineering") {
        issues.push("Privileged AWS Administrator access will be automatically stripped upon transfer.");
      }
    }
    return issues;
  }, [selectedUser, newDept]);

  const handleAddGrant = () => {
    if (newGrantInput.trim() && !customGranted.includes(newGrantInput.trim())) {
      setCustomGranted([...customGranted, newGrantInput.trim()]);
      setNewGrantInput("");
    }
  };

  const handleRemoveGrant = (g: string) => {
    setCustomGranted(customGranted.filter((item) => item !== g));
  };

  const handleAddRevoke = () => {
    if (newRevokeInput.trim() && !customRevoked.includes(newRevokeInput.trim())) {
      setCustomRevoked([...customRevoked, newRevokeInput.trim()]);
      setNewRevokeInput("");
    }
  };

  const handleRemoveRevoke = (g: string) => {
    setCustomRevoked(customRevoked.filter((item) => item !== g));
  };

  const handleExecuteMove = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setExecutionStep(1);

    try {
      // Step simulation delay for rich feedback
      await new Promise((r) => setTimeout(r, 600));
      setExecutionStep(2);
      await new Promise((r) => setTimeout(r, 600));
      setExecutionStep(3);

      const sim = await moveUser(selectedUser.id, {
        department: newDept,
        title: newTitle,
        manager: newManager,
      });

      setExecutionStep(4);
      setCreatedSim(sim);
      success(
        "Mover Transition Executed",
        `Successfully transferred ${selectedUser.name} to ${newDept} (${newTitle}) in Okta.`
      );
    } catch (err: any) {
      warning("Transfer Error", err?.message || "Failed to execute mover transition.");
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation for diff object
  const currentGroups = selectedUser?.groups || [];
  const calculatedUnchanged = currentGroups.filter((g) => !customRevoked.includes(g));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-lime relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4E84A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-[#D4E84A] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A] animate-pulse"></span>
            <span>02 / LIFECYCLE TRANSITIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Mover Role Transfer Cockpit
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Cross-department entitlement delta computation, obsolete standing role revocation, and real-time Segregation-of-Duties (SoD) boundary enforcement.
          </p>
        </div>
        <div className="w-14 h-14 rounded-[20px] bg-[#141416] text-[#D4E84A] border border-white/15 hidden sm:flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform relative z-10">
          <UserCheck className="w-7 h-7" />
        </div>
      </section>

      {/* Main Execution Cockpit */}
      {createdSim ? (
        <section className="bg-[#141414] rounded-[32px] p-8 border border-white/10 text-center space-y-6 shadow-2xl animate-in zoom-in-95 card-interactive">
          <div className="w-16 h-16 rounded-full bg-[#D4E84A] text-[#141414] flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(212,232,74,0.4)] hover:scale-110 transition-transform">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold text-[#D4E84A]">{createdSim.id}</span>
              <span className="text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-white">
                OKTA PROD-US
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Role Transition Completed & Sealed</h2>
            <p className="text-xs text-[#8E8E86] max-w-md mx-auto leading-relaxed">
              Transferred <span className="text-white font-bold">{selectedUser?.name}</span> to{" "}
              <span className="text-[#D4E84A] font-bold">{newDept}</span> as{" "}
              <span className="text-white font-bold">{newTitle}</span>. All obsolete Okta groups purged and tokens refreshed.
            </p>
          </div>

          {/* Delta Diff Box */}
          <div className="max-w-2xl mx-auto text-left">
            <AccessDiff delta={createdSim.delta} />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setCreatedSim(null);
                setExecutionStep(0);
              }}
              className="px-5 py-2.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold btn-interactive border border-white/10 hover:border-white/30"
            >
              TRANSFER ANOTHER IDENTITY
            </button>
            <button
              onClick={() => navigate({ to: "/users" })}
              className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold shadow-md btn-interactive"
            >
              VIEW IDENTITIES DIRECTORY
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Identity & Transfer Parameters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Source User Select */}
            <div className="lg:col-span-5 bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-4 shadow-xl card-interactive hover-glow-lime">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-[#8E8E86]">
                  Source Identity (Current)
                </span>
                {selectedUser && <RiskBadge level={selectedUser.riskLevel} score={selectedUser.riskScore} />}
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Select Employee
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department} ({u.title})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="bg-[#1b1b1b] p-4 rounded-[20px] border border-white/5 space-y-2.5 text-xs hover:border-white/20 transition-all">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E86]">Department:</span>
                    <span className="font-bold text-white">{selectedUser.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E86]">Current Role:</span>
                    <span className="font-bold text-white">{selectedUser.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E86]">Reports To:</span>
                    <span className="text-neutral-300">{selectedUser.manager || "Executive Staff"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E86]">Active Entitlements:</span>
                    <span className="font-mono text-[#D4E84A] font-bold">
                      {(selectedUser.groups || []).length} Groups
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Target Role & Department */}
            <div className="lg:col-span-7 bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-4 shadow-xl card-interactive hover-glow-lime">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-[#8E8E86]">
                  Target Configuration (New Role)
                </span>
                <span className="text-[10px] font-mono bg-[#D4E84A]/20 text-[#D4E84A] px-2.5 py-0.5 rounded-full font-bold">
                  AUTONOMOUS RECALCULATION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                    Target Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                    Target Job Title
                  </label>
                  <select
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                  >
                    {(DEPARTMENT_ROLES[newDept] || ["Senior Specialist", "Team Lead", "Director"]).map(
                      (role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  New Reporting Manager
                </label>
                <input
                  type="text"
                  value={newManager}
                  onChange={(e) => setNewManager(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. Grace Lindqvist"
                />
              </div>
            </div>
          </div>

          {/* SoD Violations Warning Alert */}
          {sodViolations.length > 0 && (
            <div className="bg-[#E8703A]/10 border border-[#E8703A]/30 rounded-[24px] p-4 sm:p-5 flex items-start gap-3.5 text-xs text-neutral-200 animate-in fade-in card-interactive hover-glow-orange">
              <ShieldAlert className="w-5 h-5 text-[#E8703A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-[#E8703A] uppercase tracking-wider font-mono text-[11px]">
                  Segregation of Duties (SoD) Conflict Warning
                </div>
                {sodViolations.map((v, idx) => (
                  <p key={idx} className="leading-relaxed text-neutral-300">
                    {v}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Entitlement Diff Editor */}
          <div className="bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-5 shadow-xl card-interactive">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4E84A]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Entitlement Delta Preview
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8E8E86]">
                Automatic Zero-Standing Privileges Enforcement
              </span>
            </div>

            {/* Access Diff Component */}
            <AccessDiff
              delta={{
                granted: customGranted,
                revoked: customRevoked,
                unchanged: calculatedUnchanged,
              }}
            />

            {/* Custom Entitlement Add Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#D4E84A] font-bold block">
                  + Add Custom Target Group
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGrantInput}
                    onChange={(e) => setNewGrantInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGrant()}
                    placeholder="e.g. AWS-Production-Read"
                    className="flex-1 bg-[#1b1b1b] text-white px-3.5 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-mono"
                  />
                  <button
                    onClick={handleAddGrant}
                    className="px-4 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] text-xs font-mono font-bold shrink-0 btn-interactive"
                  >
                    ADD
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-[#E8703A] font-bold block">
                  − Force Revoke Group
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRevokeInput}
                    onChange={(e) => setNewRevokeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRevoke()}
                    placeholder="e.g. Engineering-Legacy"
                    className="flex-1 bg-[#1b1b1b] text-white px-3.5 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#E8703A] hover:border-white/30 transition-colors font-mono"
                  />
                  <button
                    onClick={handleAddRevoke}
                    className="px-4 py-2 rounded-full bg-[#E8703A] hover:bg-[#d4602c] text-white text-xs font-mono font-bold shrink-0 btn-interactive"
                  >
                    REVOKE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div className="bg-[#141414] rounded-[24px] p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl card-interactive hover-glow-lime">
            <div className="text-xs text-[#8E8E86] font-mono text-center sm:text-left">
              Changes will be committed directly to <span className="text-white font-bold">Okta Production</span> with an immutable cryptographic audit record.
            </div>

            <button
              onClick={handleExecuteMove}
              disabled={loading || !selectedUser}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold tracking-wider shadow-lg flex items-center justify-center gap-2 btn-interactive"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {executionStep === 1
                      ? "VALIDATING POLICY..."
                      : executionStep === 2
                      ? "PURGING OBSOLETE GROUPS..."
                      : "MUTATING OKTA USER..."}
                  </span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>EXECUTE MOVER TRANSITION</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
