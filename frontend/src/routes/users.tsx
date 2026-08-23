import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, UserPlus } from "lucide-react";
import { getUsers, exportUsers } from "../services/api";
import type { User } from "../services/types";
import { UserTable } from "../components/UserTable";
import { useToast } from "../components/Toast";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

export function UsersPage() {
  const { success } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then((data) => {
        setUsers(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      getUsers().then(setUsers);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    const csv = await exportUsers();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `okta-identities-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    success("Identities Exported", `Generated complete directory CSV (${users.length} records).`);
  };

  const activeCount = users.filter((u) => u.status === "ACTIVE" || (u.status as string) === "PROVISIONED").length;
  const highRiskCount = users.filter((u) => (u.riskLevel || u.risk) === "HIGH" || (u.riskLevel || u.risk) === "CRITICAL").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/50 via-[#181920]/40 to-[#121316]/50 backdrop-blur-md rounded-[32px] p-6 sm:p-8 border border-white/10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] card-interactive relative overflow-hidden">
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-semibold tracking-[0.2em] text-[#D4E84A] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D4E84A]"></span>
            <span>01 / DIRECTORY REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 leading-tight">
            Authoritative Identity Directory
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
            Live Okta-synced worker directory with automated group entitlement catalogs, application tiles, and continuous behavioral risk scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            to="/joiner"
            className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-md btn-interactive"
          >
            <UserPlus className="w-4 h-4 stroke-[2]" />
            <span>ONBOARD NEW HIRE</span>
          </Link>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-full bg-[#1b1b1b]/60 hover:bg-neutral-800/80 border border-white/10 text-slate-200 text-xs font-mono font-medium flex items-center gap-2 transition-colors shrink-0 shadow-xs btn-interactive"
          >
            <Download className="w-4 h-4 text-[#D4E84A]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </section>

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14151B]/40 backdrop-blur-md p-4 rounded-[20px] border border-white/10 shadow-xs card-interactive">
          <span className="text-[11px] font-mono text-neutral-400 uppercase block font-medium">Total Managed</span>
          <span className="text-xl font-bold text-slate-100 mt-1 block">{users.length} Identities</span>
        </div>
        <div className="bg-[#14151B]/40 backdrop-blur-md p-4 rounded-[20px] border border-white/10 shadow-xs card-interactive">
          <span className="text-[11px] font-mono text-neutral-400 uppercase block font-medium">Active Okta State</span>
          <span className="text-xl font-bold text-[#D4E84A] mt-1 block">{activeCount} Active</span>
        </div>
        <div className="bg-[#14151B]/40 backdrop-blur-md p-4 rounded-[20px] border border-white/10 shadow-xs card-interactive">
          <span className="text-[11px] font-mono text-neutral-400 uppercase block font-medium">Elevated Risk</span>
          <span className="text-xl font-bold text-[#E8703A] mt-1 block">{highRiskCount} Flagged</span>
        </div>
        <div className="bg-[#14151B]/40 backdrop-blur-md p-4 rounded-[20px] border border-white/10 shadow-xs card-interactive">
          <span className="text-[11px] font-mono text-neutral-400 uppercase block font-medium">Directory Health</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">99.8% Sync</span>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-[#141414]/50 backdrop-blur-md p-4 sm:p-6 rounded-[32px] border border-white/10 shadow-md card-interactive">
        <UserTable users={users} />
      </section>
    </div>
  );
}
