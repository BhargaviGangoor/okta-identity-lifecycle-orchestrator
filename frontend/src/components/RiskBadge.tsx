import type { RiskLevel } from "../services/types";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number | undefined;
}

export function RiskBadge({ level, score }: RiskBadgeProps) {
  const norm = (
    level ||
    (typeof score === "number"
      ? score >= 75
        ? "CRITICAL"
        : score >= 50
        ? "HIGH"
        : score >= 30
        ? "MEDIUM"
        : "LOW"
      : "LOW")
  ).toUpperCase();

  if (norm === "LOW") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#D4E84A] text-[#141414] tracking-wider shadow-xs">
        <span>LOW</span>
        {typeof score === "number" && (
          <span className="pl-1 border-l border-[#141414]/30 font-extrabold">{score}</span>
        )}
      </span>
    );
  }

  if (norm === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F7F4EE] text-[#141414] border border-[#141414]/20 tracking-wider">
        <span>MEDIUM</span>
        {typeof score === "number" && (
          <span className="pl-1 border-l border-[#141414]/30 font-extrabold text-[#E8703A]">{score}</span>
        )}
      </span>
    );
  }

  // HIGH or CRITICAL
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E8703A] text-white tracking-wider shadow-xs">
      <span>{norm}</span>
      {typeof score === "number" && (
        <span className="pl-1 border-l border-white/30 font-extrabold">{score}</span>
      )}
    </span>
  );
}
