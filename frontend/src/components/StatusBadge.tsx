import type { UserStatus } from "../services/types";

interface StatusBadgeProps {
  status: UserStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const norm = (status || "ACTIVE").toUpperCase();

  if (norm === "ACTIVE" || norm === "PROVISIONED" || norm === "STAGED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#D4E84A] text-[#141414]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#141414]"></span>
        {norm}
      </span>
    );
  }

  if (norm === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F7F4EE] text-[#141414] border border-[#141414]/15">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A]"></span>
        PENDING
      </span>
    );
  }

  if (norm === "SUSPENDED" || norm === "DEPROVISIONED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#141414] text-[#8A8A82] border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8703A]"></span>
        {norm}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F7F4EE] text-[#8A8A82] border border-black/10">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8A8A82]"></span>
      {norm}
    </span>
  );
}
