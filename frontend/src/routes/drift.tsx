import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, RefreshCw } from "lucide-react";
import { getDrift, remediateDrift } from "../services/api";
import type { DriftItem } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";

export const Route = createFileRoute("/drift")({
  component: DriftReconciliationPage,
});

export function DriftReconciliationPage() {
  const [driftList, setDriftList] = useState<DriftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDrift();
      setDriftList(data);
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
      }
    } finally {
      setRemediatingId(null);
    }
  };

  const openCount = driftList.filter((d) => d.status === "OPEN").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            05 / DRIFT RECONCILIATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Authoritative Drift Scanner
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Detects unauthorized out-of-band Okta assignments and re-synchronizes with authoritative RBAC policy baselines.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-full bg-[#0E0E0E] hover:bg-[#222] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>SCAN OKTA NOW</span>
        </button>
      </section>

      {/* Drift Comparison Grid */}
      <section className="bg-[#141414] rounded-[32px] p-4 sm:p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase">Detected Discrepancies</span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#E8703A] text-white font-bold">
              {openCount} Open
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8E8E86]">RECON ENGINE ACTIVE</span>
        </div>

        <div className="space-y-3">
          {driftList.map((item) => (
            <div
              key={item.id}
              className="bg-[#1b1b1b] p-4 sm:p-5 rounded-[18px] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
            >
              {/* Identity & Entitlement */}
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#8A8A82] font-bold">{item.id}</span>
                  <RiskBadge level={item.risk} score={item.riskScore} />
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      item.status === "OPEN"
                        ? "bg-[#E8703A] text-white"
                        : "bg-[#D4E84A] text-[#141414]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white">{item.user}</div>
                <div className="text-xs text-[#8A8A82] font-mono">
                  Entitlement: <span className="text-[#D4E84A] font-bold">{item.entitlement}</span>
                </div>
              </div>

              {/* State Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 flex-1 max-w-lg bg-[#141414] p-3 rounded-[14px] border border-white/10 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#8A8A82] uppercase">Authoritative Policy</div>
                  <div className="text-neutral-200 font-bold mt-0.5 truncate">{item.policyState}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A8A82] uppercase">Live Okta State</div>
                  <div className="text-[#E8703A] font-bold mt-0.5 truncate">{item.oktaState}</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center justify-end">
                {item.status === "OPEN" ? (
                  <button
                    onClick={() => handleRemediate(item.id)}
                    disabled={remediatingId === item.id}
                    className="px-4 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{remediatingId === item.id ? "REMEDIATING..." : "REMEDIATE"}</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-[#D4E84A] flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#D4E84A]/30">
                    <CheckCircle className="w-3.5 h-3.5" /> Remediated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
