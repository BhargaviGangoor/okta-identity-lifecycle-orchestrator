import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { getDrift, remediateDrift } from "../services/api";
import type { DriftItem, RiskLevel } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";
import { useToast } from "../components/Toast";
import { GlitchGridBackground } from "../components/backgrounds/GlitchGridBackground";

export const Route = createFileRoute("/drift")({
  component: DriftReconciliationPage,
});

export function DriftReconciliationPage() {
  const { success, info } = useToast();
  const [driftList, setDriftList] = useState<DriftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [batchRemediating, setBatchRemediating] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<"ALL" | RiskLevel>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "OPEN" | "REMEDIATED">("ALL");
  const [lastScanTime, setLastScanTime] = useState<string>("Just now");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDrift();
      setDriftList(data);
      setLastScanTime(new Date().toLocaleTimeString());
      info("Drift Scan Complete", "Synchronized state with live Okta tenant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemediate = async (id: string) => {
    setRemediatingId(id);
    try {
      const updated = await remediateDrift(id);
      if (updated) {
        setDriftList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "REMEDIATED" } : item))
        );
        success("Drift Remediated", `Reconciled ${id} back to authoritative baseline.`);
      }
    } finally {
      setRemediatingId(null);
    }
  };

  const handleRemediateAll = async () => {
    const openItems = driftList.filter((d) => d.status === "OPEN");
    if (openItems.length === 0) return;

    setBatchRemediating(true);
    try {
      for (const item of openItems) {
        await remediateDrift(item.id);
      }
      setDriftList((prev) =>
        prev.map((item) => ({ ...item, status: "REMEDIATED" }))
      );
      success("Batch Remediation Complete", `Reconciled ${openItems.length} out-of-band Okta entitlements.`);
    } finally {
      setBatchRemediating(false);
    }
  };

  const openCount = driftList.filter((d) => d.status === "OPEN").length;
  const criticalCount = driftList.filter((d) => d.status === "OPEN" && d.risk === "CRITICAL").length;

  const filteredDrift = useMemo(() => {
    return driftList.filter((item) => {
      const matchesRisk = selectedRisk === "ALL" || item.risk === selectedRisk;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      return matchesRisk && matchesStatus;
    });
  }, [driftList, selectedRisk, selectedStatus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      <GlitchGridBackground />
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-orange relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E8703A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-[#E8703A] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A] animate-pulse"></span>
            <span>05 / DRIFT RECONCILIATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Authoritative Drift Scanner
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Detects unauthorized out-of-band Okta group assignments and continuously re-synchronizes with authoritative RBAC policy baselines.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#E8703A] hover:bg-[#d6602c] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg btn-interactive disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>SCAN OKTA NOW</span>
          </button>
        </div>
      </section>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] p-5 rounded-[24px] border border-white/10 flex items-center justify-between shadow-lg card-interactive hover-glow-orange">
          <div>
            <span className="text-[10px] font-mono text-[#8E8E86] uppercase block">Total Open Drift</span>
            <span className="text-2xl font-semibold text-white mt-1 block">{openCount} Discrepancies</span>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-[#E8703A]/20 text-[#E8703A] flex items-center justify-center font-bold hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-[24px] border border-white/10 flex items-center justify-between shadow-lg card-interactive hover-glow-orange">
          <div>
            <span className="text-[10px] font-mono text-[#8E8E86] uppercase block">Critical SoD Collisions</span>
            <span className="text-2xl font-semibold text-[#E8703A] mt-1 block">{criticalCount} High Risk</span>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-red-500/20 text-red-400 flex items-center justify-center font-bold hover:scale-110 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141414] p-5 rounded-[24px] border border-white/10 flex items-center justify-between shadow-lg card-interactive hover-glow-lime">
          <div>
            <span className="text-[10px] font-mono text-[#8E8E86] uppercase block">Last Okta Sync</span>
            <span className="text-2xl font-semibold text-[#D4E84A] mt-1 block">{lastScanTime}</span>
          </div>
          <div className="w-10 h-10 rounded-[14px] bg-[#D4E84A]/20 text-[#D4E84A] flex items-center justify-center font-bold hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Drift Comparison Grid */}
      <section className="bg-[#141414] rounded-[32px] p-6 border border-white/10 space-y-4 shadow-xl card-interactive">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1b1b1b] p-3.5 rounded-[22px] border border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-[#8E8E86] uppercase px-1">Filter:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((rk) => (
              <button
                key={rk}
                onClick={() => setSelectedRisk(rk as any)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all btn-interactive ${
                  selectedRisk === rk
                    ? "bg-[#D4E84A] text-[#141414] shadow-md"
                    : "bg-[#141414] text-[#8E8E86] hover:text-white"
                }`}
              >
                {rk}
              </button>
            ))}
          </div>

          {openCount > 0 && (
            <button
              onClick={handleRemediateAll}
              disabled={batchRemediating}
              className="px-5 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50 btn-interactive shrink-0"
            >
              {batchRemediating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>{batchRemediating ? "REMEDIATING ALL..." : `REMEDIATE ALL (${openCount})`}</span>
            </button>
          )}
        </div>

        {/* Drift Items */}
        <div className="space-y-3">
          {filteredDrift.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-2 font-mono text-xs">
              <ShieldCheck className="w-10 h-10 text-[#D4E84A] mx-auto" />
              <p className="text-white font-bold text-sm">Zero Drift Detected</p>
              <p className="text-[#8E8E86]">All Okta assignments are 100% synchronized with Authoritative Policy.</p>
            </div>
          ) : (
            filteredDrift.map((item) => (
              <div
                key={item.id}
                className="bg-[#1b1b1b] p-5 rounded-[22px] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group card-interactive hover-glow-lime shadow-md"
              >
                {/* Identity & Entitlement */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8A8A82] font-bold">{item.id}</span>
                    <RiskBadge level={item.risk} score={item.riskScore} />
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        item.status === "OPEN"
                          ? "bg-[#E8703A] text-white"
                          : "bg-[#D4E84A] text-[#141414]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white group-hover:text-[#D4E84A] transition-colors">{item.user}</div>
                  <div className="text-xs text-[#8A8A82] font-mono flex items-center gap-1.5">
                    Entitlement: <span className="text-[#D4E84A] font-bold">{item.entitlement}</span>
                  </div>
                </div>

                {/* State Comparison Grid */}
                <div className="grid grid-cols-2 gap-3 flex-1 max-w-lg bg-[#141414] p-3.5 rounded-[16px] border border-white/10 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#8A8A82] uppercase font-bold">Authoritative Policy</div>
                    <div className="text-neutral-200 font-bold mt-1 truncate">{item.policyState}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A8A82] uppercase font-bold">Live Okta State</div>
                    <div className="text-[#E8703A] font-bold mt-1 truncate">{item.oktaState}</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 flex items-center justify-end">
                  {item.status === "OPEN" ? (
                    <button
                      onClick={() => handleRemediate(item.id)}
                      disabled={remediatingId === item.id}
                      className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-semibold shadow-md flex items-center gap-1.5 btn-interactive"
                    >
                      {remediatingId === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{remediatingId === item.id ? "REMEDIATING..." : "REMEDIATE OKTA"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-[#D4E84A] flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141414] border border-[#D4E84A]/30">
                      <CheckCircle2 className="w-4 h-4" /> Remediated
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
