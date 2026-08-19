import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { getAudit } from "../services/api";
import type { AuditEvent } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";

export const Route = createFileRoute("/audit")({
  component: AuditTimelinePage,
});

export function AuditTimelinePage() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAudit().then((data) => {
      setAuditEvents(data);
    });
  }, []);

  const filtered = auditEvents.filter((evt) => {
    const matchesAction = filterAction === "ALL" || evt.action.includes(filterAction);
    const matchesSearch =
      evt.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.detail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExport = () => {
    const header = "ID,Timestamp,Actor,Action,Target,Result,Risk,Detail\n";
    const rows = filtered
      .map(
        (e) =>
          `"${e.id}","${e.at}","${e.actor}","${e.action}","${e.target}","${e.result}","${e.risk}","${e.detail}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            06 / COMPLIANCE LEDGER
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Security Audit Trail
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Cryptographically sealed timeline of all lifecycle mutations, drift reconciliations, and privileged executions.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-5 py-2.5 rounded-full bg-[#0E0E0E] hover:bg-[#222] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT LOGS</span>
        </button>
      </section>

      {/* Controls & Audit Table */}
      <section className="bg-[#141414] rounded-[32px] p-4 sm:p-6 border border-white/10 space-y-4 shadow-xl">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1b1b1b] p-3 rounded-[20px] border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, target, detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] placeholder-[#8A8A82]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "SIMULATION", "DRIFT", "JOINER", "LEAVER"].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-colors shrink-0 ${
                  filterAction === act
                    ? "bg-[#D4E84A] text-[#141414] font-bold"
                    : "bg-[#141414] text-[#8A8A82] hover:text-white border border-white/10"
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Rows */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[#8A8A82] font-mono text-xs">
              No matching audit events found
            </div>
          ) : (
            filtered.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D4E84A] font-bold">{evt.action}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        evt.result === "SUCCESS"
                          ? "bg-[#D4E84A] text-[#141414]"
                          : "bg-[#E8703A] text-white"
                      }`}
                    >
                      {evt.result}
                    </span>
                    <span className="text-[11px] text-[#8A8A82] font-mono">
                      by {evt.actor}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{evt.target}</div>
                  <div className="text-xs text-[#8A8A82] font-sans leading-relaxed">{evt.detail}</div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                  <RiskBadge level={evt.risk} />
                  <span className="text-[11px] font-mono text-[#8A8A82]">
                    {new Date(evt.at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
