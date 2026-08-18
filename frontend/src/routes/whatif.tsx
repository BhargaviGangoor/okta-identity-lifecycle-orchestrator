import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Play, CheckCircle2 } from "lucide-react";
import { getUsers, simulate, approve, reject } from "../services/api";
import type { User, Simulation } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";
import { ImpactCard } from "../components/ImpactCard";
import { AccessDiff } from "../components/AccessDiff";
import { ApprovalDialog } from "../components/ApprovalDialog";

export const Route = createFileRoute("/whatif")({
  component: WhatIfSimulationPage,
});

export function WhatIfSimulationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [action, setAction] = useState<string>("Grant AWS Production Administrator");
  const [simResult, setSimResult] = useState<Simulation | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const actions = [
    "Grant AWS Production Administrator",
    "Grant Okta Super Admin Exception",
    "Add to Jamf IT Device Admins",
    "Assign NetSuite Accounts Payable Approver",
    "Revoke all Github Org Owner Privileges",
  ];

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      if (data.length > 0 && data[0]?.id) setSelectedUserId(data[0].id);
    });
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleRunSimulation = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const res = await simulate({
        userId: selectedUserId,
        action,
      });
      setSimResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approve(id);
    if (simResult && simResult.id === id) {
      setSimResult({ ...simResult, status: "APPROVED" });
    }
    setIsApprovalOpen(false);
  };

  const handleReject = async (id: string) => {
    await reject(id);
    if (simResult && simResult.id === id) {
      setSimResult({ ...simResult, status: "REJECTED" });
    }
    setIsApprovalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            04 / PREDICTIVE MODELING
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            What-If Simulation
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Dry-run entitlement modifications against policy graphs and calculate blast radius risk scores before committing mutations to Okta.
          </p>
        </div>
        <div className="w-12 h-12 rounded-[16px] bg-[#0E0E0E] text-[#D4E84A] hidden sm:flex items-center justify-center font-bold shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
      </section>

      {/* Builder Form */}
      <section className="bg-[#141414] rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-[#D4E84A] font-mono">01.</span> Configure Simulation Target
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
                  {u.name} ({u.department} — {u.title})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Proposed Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
            >
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={loading || !selectedUser}
            className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black flex items-center gap-2 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? "SIMULATING..." : "RUN DRY-RUN SIMULATION"}</span>
          </button>
        </div>
      </section>

      {/* Simulation Result */}
      {simResult && (
        <section className="bg-[#141414] rounded-[24px] p-6 sm:p-8 border border-white/10 space-y-6 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#D4E84A]">{simResult.id}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    simResult.status === "APPROVED"
                      ? "bg-[#D4E84A] text-[#141414]"
                      : simResult.status === "REJECTED"
                      ? "bg-[#E8703A] text-white"
                      : "bg-[#1b1b1b] text-[#8A8A82]"
                  }`}
                >
                  {simResult.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">{simResult.summary}</h3>
            </div>
            <RiskBadge level={simResult.risk} score={simResult.riskScore} />
          </div>

          <div className="space-y-4">
            <AccessDiff delta={simResult.delta} />
            <ImpactCard impact={simResult.impact} />
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            {simResult.status === "PENDING" ? (
              <button
                onClick={() => setIsApprovalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black shadow-xs"
              >
                REQUEST SECURITY APPROVAL
              </button>
            ) : (
              <span className="text-xs font-mono text-[#8A8A82] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4E84A]" /> Decision recorded in authoritative audit trail
              </span>
            )}
          </div>
        </section>
      )}

      {/* Approval Dialog */}
      {simResult && (
        <ApprovalDialog
          simulation={simResult}
          isOpen={isApprovalOpen}
          onClose={() => setIsApprovalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
