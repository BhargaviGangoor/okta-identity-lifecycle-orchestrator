import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Users, ShieldCheck, RefreshCw, Sparkles, UserPlus } from "lucide-react";
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

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const highRiskCount = users.filter((u) => u.riskLevel === "HIGH" || u.riskLevel === "CRITICAL").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/95 via-[#181920]/95 to-[#121316]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/20 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] card-interactive hover-glow-lime relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4E84A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold tracking-[0.2em] text-[#D4E84A] uppercase shadow-sm text-glow-lime">
            <span className="w-2 h-2 rounded-full bg-[#D4E84A] animate-pulse"></span>
            <span>01 / DIRECTORY REPOSITORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight text-glow-white">
            Authoritative Identity Directory
          </h1>
          <p className="text-sm text-white leading-relaxed max-w-xl font-medium text-contrast-crisp">
            Live Okta-synced worker directory with automated group entitlement catalogs, application tiles, and continuous behavioral risk scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            to="/joiner"
            className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] text-xs font-mono font-black flex items-center gap-2 transition-colors shrink-0 shadow-lg btn-interactive"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>ONBOARD NEW HIRE</span>
          </Link>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm btn-interactive"
          >
            <Download className="w-4 h-4 text-[#D4E84A]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </section>

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14151B] p-4 rounded-[20px] border border-white/15 shadow-md card-interactive hover-glow-lime">
          <span className="text-[11px] font-mono text-white uppercase block font-bold">Total Managed</span>
          <span className="text-xl font-black text-white mt-1 block text-glow-white">{users.length} Identities</span>
        </div>
        <div className="bg-[#14151B] p-4 rounded-[20px] border border-white/15 shadow-md card-interactive hover-glow-lime">
          <span className="text-[11px] font-mono text-white uppercase block font-bold">Active Okta State</span>
          <span className="text-xl font-black text-[#D4E84A] mt-1 block text-glow-lime">{activeCount} Active</span>
        </div>
        <div className="bg-[#14151B] p-4 rounded-[20px] border border-white/15 shadow-md card-interactive hover-glow-orange">
          <span className="text-[11px] font-mono text-white uppercase block font-bold">Elevated Risk</span>
          <span className="text-xl font-black text-[#E8703A] mt-1 block">{highRiskCount} Flagged</span>
        </div>
        <div className="bg-[#14151B] p-4 rounded-[20px] border border-white/15 shadow-md card-interactive hover-glow-lime">
          <span className="text-[11px] font-mono text-white uppercase block font-bold">Directory Health</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">99.8% Sync</span>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-[#141414] p-4 sm:p-6 rounded-[32px] border border-white/10 shadow-xl card-interactive">
        <UserTable users={users} />
      </section>
    </div>
  );
}
