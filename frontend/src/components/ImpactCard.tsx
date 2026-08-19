import { ShieldAlert, AlertCircle } from "lucide-react";
import type { Impact, RiskLevel } from "../services/types";
import { RiskBadge } from "./RiskBadge";

interface ImpactCardProps {
  impact: Impact;
  risk?: RiskLevel;
  riskScore?: number;
}

export function ImpactCard({ impact, risk, riskScore }: ImpactCardProps) {
  return (
    <div className="bg-[#1b1b1b] text-white p-5 rounded-[20px] border border-white/10 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[6px] bg-[#D4E84A] text-[#141414] flex items-center justify-center font-bold text-xs">
            <ShieldAlert className="w-3 h-3 stroke-[2.5]" />
          </div>
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
            Impact Analysis
          </h3>
        </div>
        {risk && <RiskBadge level={risk} score={riskScore} />}
      </div>

      {/* Numerical Impact Matrix */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#141414] p-3 rounded-[16px] border border-white/10 text-center">
          <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Groups</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{impact.groups}</div>
        </div>
        <div className="bg-[#141414] p-3 rounded-[16px] border border-white/10 text-center">
          <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Apps</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{impact.apps}</div>
        </div>
        <div className="bg-[#141414] p-3 rounded-[16px] border border-white/10 text-center">
          <div className="text-[10px] font-mono uppercase text-[#8A8A82]">Privileged</div>
          <div className={`text-xl font-extrabold mt-0.5 ${impact.privileged > 0 ? "text-[#E8703A]" : "text-[#D4E84A]"}`}>
            {impact.privileged}
          </div>
        </div>
      </div>

      {/* Security Notes */}
      {impact.notes && impact.notes.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono uppercase text-[#8A8A82] tracking-wider">Policy Checks</div>
          <div className="space-y-1">
            {impact.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8A8A82] bg-[#141414] p-2.5 rounded-[12px] border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A] shrink-0 mt-1.5"></span>
                <span className="leading-relaxed text-neutral-300">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
