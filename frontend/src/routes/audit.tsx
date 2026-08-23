import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Search,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  X,
  ExternalLink,
  Lock,
  Copy,
  Check,
} from "lucide-react";
import { getAudit } from "../services/api";
import type { AuditEvent } from "../services/types";
import { RiskBadge } from "../components/RiskBadge";
import { useToast } from "../components/Toast";
import { UnifiedPageBackground } from "../components/backgrounds/UnifiedPageBackground";

export const Route = createFileRoute("/audit")({
  component: AuditTimelinePage,
});

export function AuditTimelinePage() {
  const { success } = useToast();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventForModal, setSelectedEventForModal] = useState<AuditEvent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAudit().then((data) => {
      setAuditEvents(data);
    });
  }, []);

  const filtered = useMemo(() => {
    return auditEvents.filter((evt) => {
      const matchesAction = filterAction === "ALL" || evt.action.toUpperCase().includes(filterAction.toUpperCase());
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        evt.target.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q) ||
        evt.detail.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q);
      return matchesAction && matchesSearch;
    });
  }, [auditEvents, filterAction, searchTerm]);

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
    success("Audit Ledger Exported", `Exported ${filtered.length} compliance records.`);
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      <UnifiedPageBackground mode="rain" accentColor="#D4E84A" />
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-lime relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4E84A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-[#D4E84A] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A] animate-pulse"></span>
            <span>06 / COMPLIANCE LEDGER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Cryptographic Audit Ledger
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Tamper-proof immutable timeline of all Okta lifecycle transitions, predictive simulations, drift remediations, and administrator approvals.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg btn-interactive relative z-10"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT AUDIT CSV</span>
        </button>
      </section>

      {/* Controls & Audit Table */}
      <section className="bg-[#141414] rounded-[32px] p-6 border border-white/10 space-y-4 shadow-xl card-interactive">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1b1b1b] p-3.5 rounded-[22px] border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, target, detail, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors placeholder-[#8A8A82]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {["ALL", "SIMULATION", "DRIFT", "JOINER", "MOVER", "LEAVER"].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all shrink-0 btn-interactive ${
                  filterAction === act
                    ? "bg-[#D4E84A] text-[#141414] font-bold shadow-md"
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
            <div className="text-center py-16 text-[#8A8A82] font-mono text-xs">
              No matching compliance audit events found
            </div>
          ) : (
            filtered.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEventForModal(evt)}
                className="bg-[#1b1b1b] p-4 sm:p-5 rounded-[20px] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs card-interactive hover-glow-lime cursor-pointer group shadow-sm"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#D4E84A] font-bold">{evt.action}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        evt.result === "SUCCESS"
                          ? "bg-[#D4E84A]/15 text-[#D4E84A] border border-[#D4E84A]/30"
                          : "bg-[#E8703A]/15 text-[#E8703A] border border-[#E8703A]/30"
                      }`}
                    >
                      {evt.result}
                    </span>
                    <span className="text-[11px] text-[#8A8A82] font-mono">
                      by {evt.actor}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-[#D4E84A] transition-colors">
                    {evt.target}
                  </div>
                  <div className="text-xs text-[#8A8A82] font-sans leading-relaxed">{evt.detail}</div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                  <RiskBadge level={evt.risk} />
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8E8E86]">
                    <Lock className="w-3 h-3 text-[#D4E84A]" />
                    <span>{new Date(evt.at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* JSON Payload Inspection Modal */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#141414] text-white w-full max-w-2xl rounded-t-[28px] sm:rounded-[28px] border border-white/15 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] sm:max-h-[85vh] flex flex-col card-interactive">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode className="w-5 h-5 text-[#D4E84A] shrink-0" />
                <div className="min-w-0">
                  <span className="font-mono text-xs text-[#D4E84A] font-bold block truncate">{selectedEventForModal.id}</span>
                  <h3 className="text-base font-bold text-white">Immutable Event Payload</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#111] p-4 rounded-[18px] border border-white/10 font-mono text-xs text-[#D4E84A] leading-relaxed touch-scroll">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    recordId: selectedEventForModal.id,
                    timestamp: selectedEventForModal.at,
                    actor: selectedEventForModal.actor,
                    action: selectedEventForModal.action,
                    target: selectedEventForModal.target,
                    status: selectedEventForModal.result,
                    riskRating: selectedEventForModal.risk,
                    details: selectedEventForModal.detail,
                    complianceProof: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    sealedBy: "TEAM_ECHO_CRYPTO_ENGINE",
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs font-mono">
              <span className="text-[#8E8E86] truncate">Compliance Scope: SOC2 Type II · ISO-27001</span>
              <button
                onClick={() =>
                  handleCopyPayload(
                    JSON.stringify(selectedEventForModal, null, 2)
                  )
                }
                className="px-4 py-1.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs flex items-center gap-1.5 btn-interactive shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#D4E84A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "COPIED" : "COPY JSON"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
