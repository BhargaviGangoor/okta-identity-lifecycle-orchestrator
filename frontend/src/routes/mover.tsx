import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { getUsers, moveUser } from "../services/api";
import { DEPARTMENTS, GROUP_CATALOG } from "../services/mock-data";
import type { User, Simulation } from "../services/types";
import { AccessDiff } from "../components/AccessDiff";
import { RiskBadge } from "../components/RiskBadge";

export const Route = createFileRoute("/mover")({
  component: MoverTransitionPage,
});

export function MoverTransitionPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newDept, setNewDept] = useState<string>("Finance");
  const [newTitle, setNewTitle] = useState<string>("Financial Analyst II");
  const [newManager, setNewManager] = useState<string>("Grace Lindqvist");
  const [createdSim, setCreatedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (selectedUser) {
      const currentGroups = selectedUser.groups || [];
      const targetGroups = GROUP_CATALOG[newDept] || [];
      setCustomGranted(targetGroups.filter((g) => !currentGroups.includes(g)));
      setCustomRevoked(currentGroups.filter((g) => !targetGroups.includes(g)));
    }
  }, [selectedUserId, newDept]);

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
    try {
      const sim = await moveUser(selectedUser.id, {
        department: newDept,
        title: newTitle,
        manager: newManager,
      });
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
            02 / LIFECYCLE TRANSITIONS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Mover Role Transfer
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Cross-department entitlement delta computation, obsolete role revocation, and segregation of duties validation.
          </p>
        </div>
        <div className="w-12 h-12 rounded-[16px] bg-[#0E0E0E] text-[#D4E84A] hidden sm:flex items-center justify-center font-bold shadow-md">
          <UserCheck className="w-6 h-6" />
        </div>
      </section>

      {createdSim ? (
        <section className="bg-[#141414] rounded-[32px] p-8 border border-white/10 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#D4E84A] text-[#0E0E0E] flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#D4E84A]">{createdSim.id}</span>
            <h2 className="text-xl font-extrabold text-white">Mover Transition Staged</h2>
            <p className="text-xs text-[#8E8E86] max-w-sm mx-auto leading-relaxed">
              Transfer simulation for <span className="text-white font-bold">{selectedUser?.name}</span> submitted for review.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => setCreatedSim(null)}
              className="px-4 py-2 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold"
            >
              TRANSFER ANOTHER USER
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
          {/* Transfer Form */}
          <section className="bg-[#141414] rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#D4E84A] font-mono">01.</span> Select Identity & Target Role
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Target Identity</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department} ({u.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Target Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">New Job Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">New Manager</label>
                <input
                  type="text"
                  value={newManager}
                  onChange={(e) => setNewManager(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
            </div>
          </section>

          {/* Customizable Entitlement Delta Section */}
          <section className="bg-[#141414] rounded-[24px] p-6 sm:p-8 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-[#D4E84A] font-mono">02.</span> Tailor Transition Entitlements
              </h2>
              <RiskBadge level={customRevoked.length > 2 ? "HIGH" : "MEDIUM"} score={72} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* To Grant */}
              <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#D4E84A]">
                  <span>NEW ENTITLEMENTS TO GRANT ({customGranted.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {customGranted.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/25"
                    >
                      <span>+ {g}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGrant(g)}
                        className="text-[#D4E84A]/60 hover:text-white font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    value={newGrantInput}
                    onChange={(e) => setNewGrantInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGrant())}
                    placeholder="Add grant group..."
                    className="flex-1 bg-[#141414] text-white px-3 py-1 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddGrant}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* To Revoke */}
              <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#E8703A]">
                  <span>OBSOLETE ENTITLEMENTS TO REVOKE ({customRevoked.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {customRevoked.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[#E8703A]/10 text-[#E8703A] border border-[#E8703A]/25"
                    >
                      <span>- {g}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRevoke(g)}
                        className="text-[#E8703A]/60 hover:text-white font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    value={newRevokeInput}
                    onChange={(e) => setNewRevokeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRevoke())}
                    placeholder="Add revoke group..."
                    className="flex-1 bg-[#141414] text-white px-3 py-1 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#E8703A] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddRevoke}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleExecuteMove}
                disabled={loading || !selectedUser}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black flex items-center gap-2 shadow-sm"
              >
                <span>{loading ? "CALCULATING..." : "REQUEST TRANSFER & SIMULATE"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
