import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { getUsers, exportUsers } from "../services/api";
import type { User } from "../services/types";
import { UserTable } from "../components/UserTable";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
    });
  }, []);

  const handleExport = async () => {
    const csv = await exportUsers();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `identities-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            01 / DIRECTORY REPOSITORY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Authoritative Identities
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Live Okta-synced worker directory with automated group entitlement catalogs, application tiles, and continuous behavioral risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/5 text-[#0E0E0E] text-xs font-mono font-bold border border-black/10">
            <span>{users.length || 15} IDENTITIES</span>
          </div>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-full bg-[#0E0E0E] hover:bg-[#222] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-[#141414] p-4 sm:p-6 rounded-[32px] border border-white/10 shadow-xl">
        <UserTable users={users} />
      </section>
    </div>
  );
}
