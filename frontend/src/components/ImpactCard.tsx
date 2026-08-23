import { ShieldAlert, AlertCircle, Sparkles, Lock, Layers } from "lucide-react";
import type { Impact, RiskLevel } from "../services/types";
import { RiskBadge } from "./RiskBadge";

interface ImpactCardProps {
  impact: Impact;
  risk?: RiskLevel;
  riskScore?: number;
}

export function ImpactCard({ impact, risk, riskScore }: ImpactCardProps) {
  return (
    <div className="bg-[#181818] text-white p-5 rounded-[22px] border border-white/10 space-y-4 shadow-lg card-interactive hover-glow-lime">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[8px] bg-[#D4E84A] text-[#141414] flex items-center justify-center font-bold text-xs shadow-xs hover:scale-110 transition-transform">
            <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Blast Radius & Impact
            </h3>
            <span className="text-[10px] font-mono text-[#8E8E86]">Security simulation engine</span>
          </div>
        </div>
        {risk && <RiskBadge level={risk} score={riskScore} />}
      </div>

      {/* Numerical Impact Matrix */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#141414] p-3.5 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-lime">
          <div className="text-[10px] font-mono uppercase text-[#8E8E86]">Group Delta</div>
          <div className="text-2xl font-black text-white mt-1">{impact.groups}</div>
        </div>
        <div className="bg-[#141414] p-3.5 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-cyan">
          <div className="text-[10px] font-mono uppercase text-[#8E8E86]">App Tiles</div>
          <div className="text-2xl font-black text-white mt-1">{impact.apps}</div>
        </div>
        <div className="bg-[#141414] p-3.5 rounded-[16px] border border-white/10 text-center card-interactive hover-glow-orange">
          <div className="text-[10px] font-mono uppercase text-[#8E8E86]">Privileged</div>
          <div
            className={`text-2xl font-black mt-1 ${
              impact.privileged > 0 ? "text-[#E8703A]" : "text-[#D4E84A]"
            }`}
          >
            {impact.privileged}
          </div>
        </div>
      </div>

      {/* Security Check Notes */}
      {impact.notes && impact.notes.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-mono uppercase text-[#8E8E86] tracking-wider font-bold">
            Policy & Compliance Observations
          </div>
          <div className="space-y-1.5">
            {impact.notes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs text-[#8A8A82] bg-[#141414] p-3 rounded-[14px] border border-white/5 card-interactive"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A] shrink-0 mt-1.5"></span>
                <span className="leading-relaxed text-neutral-200">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
