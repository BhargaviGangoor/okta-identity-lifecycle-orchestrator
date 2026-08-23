import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Play,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { getUsers, simulate, approve, reject, execute } from "../services/api";
import type { User, SimulationResult } from "../services/types";
import { AccessDiff } from "../components/AccessDiff";
import { ImpactCard } from "../components/ImpactCard";
import { ApprovalDialog } from "../components/ApprovalDialog";
import { RiskBadge } from "../components/RiskBadge";
import { BlastRadiusRadar } from "../components/BlastRadiusRadar";
import { useToast } from "../components/Toast";
import { cyberSound } from "../utils/cyberSound";
import { ElectricLightningBackground } from "../components/backgrounds/ElectricLightningBackground";

export const Route = createFileRoute("/whatif")({
  component: WhatIfSimulatorPage,
});

const MUTATION_ACTIONS = [
  { id: "ROLE_PROMOTION", label: "ROLE TRANSITION: Promote to Senior DevOps Lead" },
  { id: "DEPT_TRANSFER", label: "TRANSFER: Engineering → Finance & Compliance" },
  { id: "EMERGENCY_ACCESS", label: "JIT REQUEST: Temporary AWS-Prod-Admin (2 Hours)" },
  { id: "OFFBOARD", label: "DEPROVISION: Immediate Emergency Termination" },
  { id: "CONTRACTOR_CONVERT", label: "CONVERSION: Contractor → Full-Time Employee" },
];

export function WhatIfSimulatorPage() {
  const { success, warning, info } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>(MUTATION_ACTIONS[0]!.label);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      if (data.length > 0) {
        setSelectedUserId(data[0]!.id);
      }
    });
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleRunSimulation = async () => {
    if (!selectedUserId) return;
    cyberSound.playScan();
    setLoading(true);
    try {
      const res = await simulate({
        userId: selectedUserId,
        action: selectedAction,
      });
      setSimResult(res);
      if (res.risk === "CRITICAL" || res.risk === "HIGH") {
        cyberSound.playAlert();
      } else {
        cyberSound.playSuccess();
      }
      success("Blast Radius Computed", `Evaluated impact for ${res.subject}: Risk score ${res.riskScore}/100.`);
    } catch (err: any) {
      warning("Simulation Error", err?.message || "Failed to compute what-if simulation.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    cyberSound.playSuccess();
    await approve(id);
    if (simResult && simResult.id === id) {
      setSimResult({ ...simResult, status: "APPROVED" });
    }
    setIsApprovalOpen(false);
    success("Operation Authorized", "Approval logged in audit ledger. Ready for Okta REST execution.");
  };

  const handleReject = async (id: string) => {
    cyberSound.playAlert();
    await reject(id);
    if (simResult && simResult.id === id) {
      setSimResult({ ...simResult, status: "REJECTED" });
    }
    setIsApprovalOpen(false);
    warning("Operation Rejected", "Mutation cancelled by security administrator.");
  };

  const handleExecute = async (id: string) => {
    cyberSound.playLaser();
    setExecuting(true);
    try {
      await execute(id);
      if (simResult && simResult.id === id) {
        setSimResult({ ...simResult, status: "EXECUTED" });
      }
      cyberSound.playSuccess();
      success("Mutation Committed to Okta", "Okta user updated with zero-drift state seal.");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 relative">
      <ElectricLightningBackground />
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-cyan relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>04 / PREDICTIVE MODELING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            What-If Blast Radius Simulator
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Dry-run access mutations in memory without making any changes to Okta. Simulates group delta, evaluates toxic SoD risk, and gates high-impact actions.
          </p>
        </div>
        <div className="w-14 h-14 rounded-[20px] bg-[#141416] text-cyan-400 border border-white/15 hidden sm:flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform relative z-10">
          <Sparkles className="w-7 h-7" />
        </div>
      </section>

      {/* Simulator Controls */}
      <div className="bg-[#141414] rounded-[28px] p-6 border border-white/10 space-y-5 shadow-xl card-interactive hover-glow-cyan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
              Target Identity
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                cyberSound.playClick();
              }}
              className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-cyan-400 hover:border-white/30 transition-colors font-sans cursor-pointer"
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
              Simulated Mutation Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                cyberSound.playClick();
              }}
              className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 text-xs focus:outline-none focus:border-cyan-400 hover:border-white/30 transition-colors font-sans cursor-pointer"
            >
              {MUTATION_ACTIONS.map((a) => (
                <option key={a.id} value={a.label}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] font-mono text-[#8E8E86]">
            Memory dry-run · 0 Okta mutations will occur during simulation
          </span>
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            onMouseEnter={() => cyberSound.playHover()}
            className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#0E0E0E] font-mono text-xs font-semibold flex items-center gap-2 shadow-md btn-interactive disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{loading ? "SIMULATING IMPACT..." : "DRY-RUN SIMULATION"}</span>
          </button>
        </div>
      </div>

      {/* Simulation Result Canvas */}
      {simResult && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Animated Graphical Blast Radius Radar */}
          <BlastRadiusRadar
            subjectName={simResult.subject}
            impact={simResult.impact}
            risk={simResult.risk}
            riskScore={simResult.riskScore}
            delta={simResult.delta}
          />

          <div className="bg-[#141414] rounded-[32px] p-6 sm:p-7 border border-white/10 space-y-6 shadow-2xl card-interactive">
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{simResult.id}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      simResult.status === "EXECUTED"
                        ? "bg-[#D4E84A] text-[#141414]"
                        : "bg-cyan-400 text-[#141414]"
                    }`}
                  >
                    {simResult.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{simResult.summary}</h3>
                <p className="text-xs text-[#8E8E86] font-mono">
                  Target: {simResult.subject} ({simResult.subjectEmail})
                </p>
              </div>
              <RiskBadge level={simResult.risk} score={simResult.riskScore} />
            </div>

            {/* Access Delta Diff Component */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase font-bold text-[#8E8E86]">
                Calculated Entitlement Delta
              </div>
              <AccessDiff delta={simResult.delta} />
            </div>

            {/* Impact Matrix */}
            <ImpactCard impact={simResult.impact} />

            {/* State Gating & Actions */}
            <div className="bg-[#181818] p-5 rounded-[22px] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 card-interactive">
              <div>
                <div className="text-xs font-bold text-white">Execution Authorization Gate</div>
                <div className="text-[11px] text-[#8E8E86] font-mono mt-0.5">
                  {simResult.status === "PENDING"
                    ? "Requires Security Administrator approval before committing to Okta."
                    : simResult.status === "APPROVED"
                    ? "Approved by security officer. Ready for REST execution."
                    : simResult.status === "EXECUTED"
                    ? "Okta mutation executed. Immutable audit record sealed."
                    : "Rejected by security policy."}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {simResult.status === "PENDING" && (
                  <button
                    onClick={() => {
                      setIsApprovalOpen(true);
                      cyberSound.playClick();
                    }}
                    onMouseEnter={() => cyberSound.playHover()}
                    className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-semibold shadow-md btn-interactive"
                  >
                    REVIEW & APPROVE
                  </button>
                )}

                {simResult.status === "APPROVED" && (
                  <button
                    onClick={() => handleExecute(simResult.id)}
                    disabled={executing}
                    onMouseEnter={() => cyberSound.playHover()}
                    className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-semibold shadow-md btn-interactive flex items-center gap-1.5"
                  >
                    {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{executing ? "EXECUTING..." : "EXECUTE IN OKTA"}</span>
                  </button>
                )}

                {simResult.status === "EXECUTED" && (
                  <span className="text-xs font-mono text-[#D4E84A] flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141414] border border-[#D4E84A]/30">
                    <CheckCircle2 className="w-4 h-4" /> Executed in Okta
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog Modal */}
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
