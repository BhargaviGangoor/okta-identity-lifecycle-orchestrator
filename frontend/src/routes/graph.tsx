import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Network, RefreshCw, Layers } from "lucide-react";
import { getGraphData } from "../services/api";
import type { GraphData } from "../services/types";
import { IdentityGraphCanvas } from "../components/IdentityGraphCanvas";

export const Route = createFileRoute("/graph")({
  component: IdentityGraphPage,
});

export function IdentityGraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await getGraphData();
      setGraphData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            02 / TOPOLOGICAL ACCESS MATRIX
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Identity Access Graph
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-xl">
            Interactive multi-tier graph topology tracing real-time Okta memberships, entitlement chains, and blast radius impact across all downstream SaaS applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadGraph}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#0E0E0E] hover:bg-[#222] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "REFRESHING..." : "RELOAD GRAPH"}</span>
          </button>
        </div>
      </section>

      {/* Main Graph Viewport */}
      {graphData ? (
        <IdentityGraphCanvas data={graphData} loading={loading} />
      ) : (
        <div className="bg-[#141414] rounded-[32px] p-16 border border-white/10 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#D4E84A] animate-spin" />
          <h3 className="text-white font-bold text-base">Building Identity Graph Topology...</h3>
          <p className="text-xs text-[#8A8A82]">
            Traversing Okta users, group bindings, and application access matrices.
          </p>
        </div>
      )}
    </div>
  );
}
