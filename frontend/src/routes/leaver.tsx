import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserMinus, AlertOctagon, CheckSquare, Square, CheckCircle2 } from "lucide-react";
import { getUsers, leaveUser } from "../services/api";
import type { User, Simulation } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";

export const Route = createFileRoute("/leaver")({
  component: LeaverDeprovisionPage,
});

export function LeaverDeprovisionPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("Voluntary resignation");
  const [checklist, setChecklist] = useState({
    sessions: true,
    groups: true,
    mfa: true,
    tickets: false,
  });
  const [createdSim, setCreatedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      if (data.length > 0 && data[0]?.id) setSelectedUserId(data[0].id);
    });
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleExecuteLeaver = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const sim = await leaveUser(selectedUser.id, { reason });
      setCreatedSim(sim);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            03 / LIFECYCLE OFFBOARDING
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Leaver Offboarding
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Immediate Okta session suspension, group revocation, and downstream federated credential deactivation across SAML/OIDC.
          </p>
        </div>
        <div className="w-12 h-12 rounded-[16px] bg-[#E8703A] text-white hidden sm:flex items-center justify-center font-bold shadow-md">
          <UserMinus className="w-6 h-6" />
        </div>
      </section>

      {createdSim ? (
        <section className="bg-[#141414] rounded-[32px] p-8 border border-white/10 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#E8703A] text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#D4E84A]">{createdSim.id}</span>
            <h2 className="text-xl font-extrabold text-white">Leaver Deprovision Queued</h2>
            <p className="text-xs text-[#8E8E86] max-w-sm mx-auto leading-relaxed">
              Deprovision sequence initiated for <span className="text-white font-bold">{selectedUser?.name}</span>.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => setCreatedSim(null)}
              className="px-4 py-2 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold"
            >
              OFFBOARD ANOTHER IDENTITY
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="px-5 py-2 rounded-full bg-[#D4E84A] text-[#0E0E0E] font-mono text-xs font-black"
            >
              DASHBOARD
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Identity Selection */}
          <section className="bg-[#141414] rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-[#E8703A] font-mono">01.</span> Select Identity to Deprovision
              </h2>
              {selectedUser && <RiskBadge level="CRITICAL" score={89} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Target Identity</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#E8703A]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Offboarding Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#E8703A]"
                >
                  <option value="Voluntary resignation">Voluntary resignation</option>
                  <option value="Contract expiration">Contract expiration</option>
                  <option value="Involuntary termination (Immediate)">Involuntary termination (Immediate)</option>
                  <option value="Leave of absence">Leave of absence</option>
                </select>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="bg-[#141414] rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#E8703A] font-mono">02.</span> Enforcement Checklist
            </h2>

            <div className="space-y-2.5">
              {[
                {
                  id: "sessions",
                  label: "Force terminate all active Okta and downstream SAML/OIDC sessions",
                  checked: checklist.sessions,
                },
                {
                  id: "groups",
                  label: `Revoke all (${selectedUser?.groups.length || 0}) Okta group memberships immediately`,
                  checked: checklist.groups,
                },
                {
                  id: "mfa",
                  label: "Reset WebAuthn, FIDO2 and Okta Verify MFA enrollments",
                  checked: checklist.mfa,
                },
                {
                  id: "tickets",
                  label: "Reassign open Jira tickets and GitHub pull request reviews to manager",
                  checked: checklist.tickets,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setChecklist({
                      ...checklist,
                      [item.id]: !checklist[item.id as keyof typeof checklist],
                    })
                  }
                  className="bg-[#1b1b1b] p-3.5 rounded-[16px] border border-white/10 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <div className="text-[#E8703A]">
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-[#D4E84A]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8A8A82]" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-200 font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Individual Assigned Entitlements Preview */}
            {selectedUser && selectedUser.groups && selectedUser.groups.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-mono uppercase text-[#8A8A82] mb-2">
                  Active Group Entitlements Target for Immediate Revocation ({selectedUser.groups.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.groups.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#E8703A]/10 text-[#E8703A] border border-[#E8703A]/25"
                    >
                      &times; {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                onClick={handleExecuteLeaver}
                disabled={loading || !selectedUser}
                className="px-6 py-2.5 rounded-full bg-[#E8703A] hover:bg-[#d4602d] text-white font-mono text-xs font-black flex items-center gap-2 shadow-sm"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{loading ? "EXECUTING..." : "CONFIRM & EXECUTE DEPROVISION"}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
