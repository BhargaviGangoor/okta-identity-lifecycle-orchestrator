import { X, CheckCircle, ShieldCheck } from "lucide-react";
import type { Simulation } from "../services/types";
import { RiskBadge } from "./RiskBadge";
import { ImpactCard } from "./ImpactCard";
import { AccessDiff } from "./AccessDiff";

interface ApprovalDialogProps {
  simulation: Simulation;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalDialog({
  simulation,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApprovalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#141414] text-white w-full max-w-2xl rounded-[32px] border border-white/10 shadow-2xl p-6 space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#D4E84A] text-[#141414] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#D4E84A]">{simulation.id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b1b1b] text-[#8A8A82] font-mono">
                  {simulation.kind}
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">{simulation.summary}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 flex items-center justify-center text-[#8A8A82] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Identity context */}
          <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Subject Identity</div>
              <div className="text-sm font-bold text-white mt-0.5">{simulation.subject}</div>
              <div className="text-xs text-[#8A8A82] font-mono">{simulation.subjectEmail}</div>
            </div>
            <RiskBadge level={simulation.risk} score={simulation.riskScore} />
          </div>

          {/* Entitlement Delta */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A82] font-bold">
              Proposed Entitlement Delta
            </div>
            <AccessDiff delta={simulation.delta} />
          </div>

          {/* Impact Card */}
          <ImpactCard impact={simulation.impact} />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <button
            onClick={() => onReject(simulation.id)}
            className="px-4 py-2 rounded-full border border-white/20 hover:border-[#E8703A] hover:bg-[#E8703A]/10 text-neutral-300 hover:text-[#E8703A] text-xs font-mono font-bold tracking-wider transition-colors"
          >
            REJECT
          </button>
          <button
            onClick={() => onApprove(simulation.id)}
            className="px-5 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] text-xs font-mono font-black tracking-wider transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            APPROVE & EXECUTE
          </button>
        </div>
      </div>
    </div>
  );
}
