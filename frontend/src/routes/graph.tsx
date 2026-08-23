import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Network, RefreshCw, Layers, AppWindow, Users, ShieldAlert } from "lucide-react";
import { getGraphData } from "../services/api";
import type { GraphData } from "../services/types";
import { IdentityGraphCanvas } from "../components/IdentityGraphCanvas";
import { useToast } from "../components/Toast";
import { StarFieldBackground } from "../components/backgrounds/StarFieldBackground";
import { UnifiedPageBackground } from "../components/backgrounds/UnifiedPageBackground";

export const Route = createFileRoute("/graph")({
  component: IdentityGraphPage,
});

export function IdentityGraphPage() {
  const { info } = useToast();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await getGraphData();
      setGraphData(data);
      info("Topology Refreshed", `Loaded ${data.nodes.length} nodes and ${data.edges.length} access edges.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      <UnifiedPageBackground mode="starfield" accentColor="#D4E84A" />
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-cyan relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>02 / TOPOLOGICAL ACCESS MATRIX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Identity Access Graph Topology
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Interactive multi-tier graph topology tracing real-time Okta memberships, entitlement chains, and blast radius impact across all downstream SaaS applications.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadGraph}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#0E0E0E] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg btn-interactive disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "RECALCULATING..." : "RELOAD TOPOLOGY"}</span>
          </button>
        </div>
      </section>

      {/* Main Graph Viewport */}
      {graphData ? (
        <IdentityGraphCanvas data={graphData} loading={loading} />
      ) : (
        <div className="bg-[#141414] rounded-[32px] p-20 border border-white/10 text-center flex flex-col items-center justify-center space-y-4 shadow-xl card-interactive">
          <div className="w-16 h-16 rounded-full bg-[#D4E84A]/10 text-[#D4E84A] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-bold text-lg">Building Identity Access Topology...</h3>
            <p className="text-xs text-[#8A8A82] font-mono">
              Traversing Okta users, group bindings, and SaaS permission edges.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
