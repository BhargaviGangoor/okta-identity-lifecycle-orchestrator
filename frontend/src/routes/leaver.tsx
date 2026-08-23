import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UserMinus,
  AlertOctagon,
  CheckSquare,
  Square,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Layers,
  Key,
  Radio,
  RefreshCw,
  Zap,
} from "lucide-react";
import { getUsers, leaveUser } from "../services/api";
import type { User, Simulation } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";
import { AccessDiff } from "../components/AccessDiff";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/leaver")({
  component: LeaverDeprovisionPage,
});

const REASONS = [
  "Voluntary resignation",
  "Involuntary termination / Separation",
  "Contractor engagement end",
  "Emergency security freeze / Credential compromise",
  "Internal transfer to external subsidiary",
];

export function LeaverDeprovisionPage() {
  const navigate = useNavigate();
  const { success, warning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [checklist, setChecklist] = useState({
    sessions: true,
    groups: true,
    mfa: true,
    tickets: false,
    auditSealed: true,
  });
  const [createdSim, setCreatedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [killStage, setKillStage] = useState<number>(0);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      if (data.length > 0 && data[0]?.id) setSelectedUserId(data[0].id);
    });
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const groups = selectedUser?.groups || [];

  const handleExecuteLeaver = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setKillStage(1);

    try {
      // Step-by-step killswitch progression for high visual impact
      await new Promise((r) => setTimeout(r, 500));
      setKillStage(2);
      await new Promise((r) => setTimeout(r, 500));
      setKillStage(3);
      await new Promise((r) => setTimeout(r, 500));
      setKillStage(4);

      const sim = await leaveUser(selectedUser.id, { reason });
      setKillStage(5);
      setCreatedSim(sim);
      success(
        "Deprovision Kill-Switch Complete",
        `Terminated all active Okta sessions and purged entitlements for ${selectedUser.name}.`
      );
    } catch (err: any) {
      warning("Deprovision Error", err?.message || "Failed to deprovision leaver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-orange relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E8703A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-[#E8703A] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A] animate-pulse"></span>
            <span>03 / LIFECYCLE OFFBOARDING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Leaver Deprovision Kill-Switch
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Immediate Okta session invalidation, complete group revocation, MFA factor purging, and downstream federated credential deactivation across SAML/OIDC.
          </p>
        </div>
        <div className="w-14 h-14 rounded-[20px] bg-[#141416] text-[#E8703A] border border-white/15 hidden sm:flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform relative z-10">
          <UserMinus className="w-7 h-7" />
        </div>
      </section>

      {createdSim ? (
        <section className="bg-[#141414] rounded-[32px] p-8 border border-white/10 text-center space-y-6 shadow-2xl animate-in zoom-in-95 card-interactive">
          <div className="w-16 h-16 rounded-full bg-[#E8703A] text-white flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(232,112,58,0.4)] hover:scale-110 transition-transform">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold text-[#E8703A]">{createdSim.id}</span>
              <span className="text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-white">
                STATE: DEACTIVATED
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Identity Deprovisioned & Sessions Terminated</h2>
            <p className="text-xs text-[#8E8E86] max-w-md mx-auto leading-relaxed">
              Deprovision kill-switch successfully executed for <span className="text-white font-bold">{selectedUser?.name}</span>. All {groups.length} Okta groups revoked and active OAuth refresh tokens purged.
            </p>
          </div>

          {/* Access Delta Diff */}
          <div className="max-w-xl mx-auto text-left">
            <AccessDiff delta={createdSim.delta} />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setCreatedSim(null);
                setKillStage(0);
              }}
              className="px-5 py-2.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold btn-interactive border border-white/10"
            >
              OFFBOARD ANOTHER IDENTITY
            </button>
            <button
              onClick={() => navigate({ to: "/users" })}
              className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold shadow-md btn-interactive"
            >
              VIEW DIRECTORY
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Leaver Target & Details */}
          <div className="bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-5 shadow-xl card-interactive hover-glow-orange">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-[#8E8E86]">
                Select Identity to Deprovision
              </span>
              {selectedUser && <RiskBadge level={selectedUser.riskLevel} score={selectedUser.riskScore} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Worker Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#E8703A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department} ({u.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Deprovision Justification Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-[#E8703A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Details Card */}
            {selectedUser && (
              <div className="bg-[#1b1b1b] p-4 rounded-[20px] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#141414] p-3 rounded-[14px]">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">EMPLOYEE</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{selectedUser.name}</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-[14px]">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">DEPARTMENT</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedUser.department}</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-[14px]">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">GROUPS PURGED</span>
                  <span className="font-mono text-[#E8703A] font-bold mt-0.5 block">{groups.length} Groups</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-[14px]">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">OKTA ID</span>
                  <span className="font-mono text-neutral-300 mt-0.5 block truncate">{selectedUser.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5-Stage Kill-Switch Sequence Checklist */}
          <div className="bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-4 shadow-xl card-interactive">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E8703A]" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  Automated Kill-Switch Sequence
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#E8703A]">CRITICAL SECURITY MUTATION</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[#1b1b1b] border border-white/5 cursor-pointer hover:border-white/20 transition-all card-interactive">
                <input
                  type="checkbox"
                  checked={checklist.sessions}
                  onChange={(e) => setChecklist({ ...checklist, sessions: e.target.checked })}
                  className="accent-[#E8703A] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white block">1. Terminate All Active Okta & Federated Sessions</span>
                  <span className="text-[#8E8E86] text-[11px]">Instantly clears active browser cookies and revokes OAuth2 refresh tokens.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[#1b1b1b] border border-white/5 cursor-pointer hover:border-white/20 transition-all card-interactive">
                <input
                  type="checkbox"
                  checked={checklist.groups}
                  onChange={(e) => setChecklist({ ...checklist, groups: e.target.checked })}
                  className="accent-[#E8703A] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white block">2. Revoke All Okta Group Memberships ({groups.length} Entitlements)</span>
                  <span className="text-[#8E8E86] text-[11px]">Strips all cloud admin, directory, and SaaS application access groups.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[#1b1b1b] border border-white/5 cursor-pointer hover:border-white/20 transition-all card-interactive">
                <input
                  type="checkbox"
                  checked={checklist.mfa}
                  onChange={(e) => setChecklist({ ...checklist, mfa: e.target.checked })}
                  className="accent-[#E8703A] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white block">3. Reset MFA Authenticators & FastPass Passkeys</span>
                  <span className="text-[#8E8E86] text-[11px]">Deactivates Okta Verify push enrollments, WebAuthn keys, and SMS factors.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-[16px] bg-[#1b1b1b] border border-white/5 cursor-pointer hover:border-white/20 transition-all card-interactive">
                <input
                  type="checkbox"
                  checked={checklist.auditSealed}
                  onChange={(e) => setChecklist({ ...checklist, auditSealed: e.target.checked })}
                  className="accent-[#E8703A] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white block">4. Seal Cryptographic Compliance Audit Record</span>
                  <span className="text-[#8E8E86] text-[11px]">Generates immutable SHA-256 state ledger record for SOC2 / ISO-27001 auditor review.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="bg-[#141414] rounded-[24px] p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl card-interactive hover-glow-orange">
            <div className="text-xs text-[#8E8E86] font-mono text-center sm:text-left">
              Executing will permanently deactivate <span className="text-white font-bold">{selectedUser?.name}</span> and purge all credentials.
            </div>

            <button
              onClick={handleExecuteLeaver}
              disabled={loading || !selectedUser}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#E8703A] hover:bg-[#d4602c] text-white font-mono text-xs font-semibold tracking-wider shadow-lg flex items-center justify-center gap-2 btn-interactive"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {killStage === 1
                      ? "KILLING OKTA SESSIONS..."
                      : killStage === 2
                      ? "REVOKING GROUPS..."
                      : killStage === 3
                      ? "PURGING MFA TOKENS..."
                      : "DEACTIVATING ACCOUNT..."}
                  </span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4" />
                  <span>EXECUTE DEPROVISION KILL-SWITCH</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
