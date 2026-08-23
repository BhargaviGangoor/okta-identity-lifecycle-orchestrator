import { Plus, Minus, Check, ShieldAlert } from "lucide-react";
import type { AccessDelta } from "../services/types";

interface AccessDiffProps {
  delta: AccessDelta;
  compact?: boolean;
}

export function AccessDiff({ delta, compact = false }: AccessDiffProps) {
  const { granted = [], revoked = [], unchanged = [] } = delta;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* Granted */}
      <div className="bg-[#181818] p-4 rounded-[20px] border border-white/10 relative overflow-hidden group card-interactive hover-glow-lime shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4E84A]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#D4E84A]/10 transition-all"></div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[8px] bg-[#D4E84A] text-[#141414] flex items-center justify-center font-black text-xs shadow-xs">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4E84A]">
              Granted Groups ({granted.length})
            </h4>
          </div>
          <span className="text-[9px] font-mono text-[#D4E84A]/80 uppercase">ADD TO OKTA</span>
        </div>

        {granted.length === 0 ? (
          <p className="text-xs text-[#8A8A82] italic py-1 font-sans">No new entitlements added</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {granted.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs font-mono bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/30 font-semibold shadow-2xs hover:bg-[#D4E84A]/25 hover:scale-105 transition-all cursor-default"
              >
                + {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Revoked */}
      <div className="bg-[#181818] p-4 rounded-[20px] border border-white/10 relative overflow-hidden group card-interactive hover-glow-orange shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8703A]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#E8703A]/10 transition-all"></div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[8px] bg-[#E8703A] text-white flex items-center justify-center font-black text-xs shadow-xs">
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E8703A]">
              Revoked Groups ({revoked.length})
            </h4>
          </div>
          <span className="text-[9px] font-mono text-[#E8703A]/80 uppercase">DEPROVISION</span>
        </div>

        {revoked.length === 0 ? (
          <p className="text-xs text-[#8A8A82] italic py-1 font-sans">No entitlements revoked</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {revoked.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs font-mono bg-[#E8703A]/10 text-[#E8703A] border border-[#E8703A]/30 font-semibold line-through opacity-85 shadow-2xs hover:opacity-100 hover:scale-105 transition-all cursor-default"
              >
                − {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Retained / Unchanged Baseline */}
      {unchanged.length > 0 && !compact && (
        <div className="col-span-1 md:col-span-2 bg-[#161616] p-3.5 rounded-[18px] border border-white/5 flex items-center gap-2 flex-wrap text-xs card-interactive">
          <span className="text-[10px] font-mono uppercase text-[#8A8A82] font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4E84A]" /> Retained Baseline ({unchanged.length}):
          </span>
          {unchanged.map((item) => (
            <span
              key={item}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#111] text-[#999] border border-white/10 hover:border-white/25 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
