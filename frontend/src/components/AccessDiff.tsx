import { Plus, Minus, Check } from "lucide-react";
import type { AccessDelta } from "../services/types";

interface AccessDiffProps {
  delta: AccessDelta;
}

export function AccessDiff({ delta }: AccessDiffProps) {
  const { granted = [], revoked = [], unchanged = [] } = delta;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Granted */}
      <div className="bg-[#141414] p-4 rounded-[18px] border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-[10px] bg-[#D4E84A] text-[#141414] flex items-center justify-center font-black text-xs">
            <Plus className="w-3 h-3 stroke-[3]" />
          </span>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4E84A]">
            Granted ({granted.length})
          </h4>
        </div>
        {granted.length === 0 ? (
          <p className="text-xs text-[#8A8A82] italic">No new entitlements added</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {granted.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#D4E84A]/15 text-[#D4E84A] border border-[#D4E84A]/30 font-medium"
              >
                + {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Revoked */}
      <div className="bg-[#141414] p-4 rounded-[18px] border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-[10px] bg-[#E8703A] text-white flex items-center justify-center font-black text-xs">
            <Minus className="w-3 h-3 stroke-[3]" />
          </span>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E8703A]">
            Revoked ({revoked.length})
          </h4>
        </div>
        {revoked.length === 0 ? (
          <p className="text-xs text-[#8A8A82] italic">No entitlements revoked</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {revoked.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#E8703A]/15 text-[#E8703A] border border-[#E8703A]/30 line-through opacity-80"
              >
                − {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Retained / Unchanged */}
      {unchanged.length > 0 && (
        <div className="col-span-1 md:col-span-2 bg-[#1b1b1b] p-3 rounded-[16px] border border-white/5 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-[#8A8A82] font-bold flex items-center gap-1">
            <Check className="w-3 h-3 text-[#D4E84A]" /> Retained Baseline:
          </span>
          {unchanged.map((item) => (
            <span
              key={item}
              className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#141414] text-[#8A8A82] border border-white/10"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
