import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  ArrowRight,
  X,
  SlidersHorizontal,
  UserCheck,
  UserMinus,
  Sparkles,
  Network,
  Download,
  Eye,
  CheckSquare,
  Square,
  ShieldAlert,
  Layers,
  AppWindow,
} from "lucide-react";
import type { User, RiskLevel, UserStatus } from "../services/types";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { useToast } from "./Toast";

interface UserTableProps {
  users: User[];
  onSelectUser?: (user: User) => void;
}

export function UserTable({ users, onSelectUser }: UserTableProps) {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | UserStatus>("ALL");
  const [selectedRisk, setSelectedRisk] = useState<"ALL" | RiskLevel>("ALL");
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const departments = ["ALL", "Engineering", "Sales", "Finance", "IT", "People Ops", "Legal"];
  const statuses: ("ALL" | UserStatus)[] = ["ALL", "ACTIVE", "SUSPENDED", "DEPROVISIONED"];
  const riskLevels: ("ALL" | RiskLevel)[] = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchesDept = selectedDept === "ALL" || (u.department && u.department.toLowerCase() === selectedDept.toLowerCase());
      const matchesStatus =
        selectedStatus === "ALL" ||
        u.status === selectedStatus ||
        (selectedStatus === "ACTIVE" && (u.status === "ACTIVE" || (u.status as string) === "PROVISIONED" || (u.status as string) === "STAGED"));
      const matchesRisk = selectedRisk === "ALL" || (u.riskLevel || (u as any).risk) === selectedRisk;

      return matchesSearch && matchesDept && matchesStatus && matchesRisk;
    });
  }, [users, searchTerm, selectedDept, selectedStatus, selectedRisk]);

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    const selected = users.filter((u) => selectedUserIds.includes(u.id));
    const toExport = selected.length > 0 ? selected : filteredUsers;
    const header = "ID,Name,Email,Department,Title,Status,RiskLevel,RiskScore,GroupsCount\n";
    const rows = toExport
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.department}","${u.title}","${u.status}","${u.riskLevel}",${u.riskScore},${(u.groups || []).length}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `okta-identities-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    success("Export Successful", `Exported ${toExport.length} identities to CSV`);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 bg-[#15161C] p-4 rounded-[24px] border border-white/15 card-interactive shadow-xl">
        {/* Search & Dept Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search identities by name, email, title, or Okta ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D0E12] text-white pl-10 pr-8 py-2.5 rounded-full text-xs border border-white/20 focus:outline-none focus:border-[#D4E84A] hover:border-white/40 transition-colors placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-[#D4E84A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all shrink-0 btn-interactive ${
                  selectedDept === dept
                    ? "bg-[#D4E84A] text-[#141414] font-black shadow-md"
                    : "bg-[#0D0E12] text-white hover:text-white border border-white/15 hover:border-white/40 font-medium"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row (Status, Risk, Bulk Actions) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-white uppercase font-bold">Status:</span>
              <div className="flex items-center gap-1">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all btn-interactive ${
                      selectedStatus === st
                        ? "bg-white text-[#141414] font-black shadow-sm"
                        : "bg-[#0D0E12] text-white hover:text-white hover:bg-white/15 border border-white/10 font-bold"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-white uppercase font-bold">Risk:</span>
              <div className="flex items-center gap-1">
                {riskLevels.map((rk) => (
                  <button
                    key={rk}
                    onClick={() => setSelectedRisk(rk)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all btn-interactive ${
                      selectedRisk === rk
                        ? "bg-[#D4E84A] text-[#141414] font-black shadow-sm"
                        : "bg-[#0D0E12] text-white hover:text-white hover:bg-white/15 border border-white/10 font-bold"
                    }`}
                  >
                    {rk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Selection Actions */}
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2 bg-[#0D0E12] px-3.5 py-1.5 rounded-full border border-[#D4E84A]/40 shadow-md animate-in fade-in">
              <span className="text-xs font-mono text-[#D4E84A] font-black">
                {selectedUserIds.length} Selected
              </span>
              <button
                onClick={handleBulkExport}
                className="text-xs font-mono text-white hover:text-[#D4E84A] flex items-center gap-1 btn-interactive font-bold"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-xs font-mono text-slate-300 hover:text-white ml-1 font-semibold"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#15161C] rounded-[24px] border border-white/15 overflow-hidden shadow-2xl card-interactive">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0E12] text-white font-mono text-[11px] uppercase tracking-wider border-b border-white/15 font-bold">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-white hover:text-[#D4E84A] transition-colors"
                  >
                    {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#D4E84A]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 text-white font-bold">Identity & Okta ID</th>
                <th className="py-3.5 px-4 text-white font-bold">Department & Role</th>
                <th className="py-3.5 px-4 text-white font-bold">Status</th>
                <th className="py-3.5 px-4 text-white font-bold">Risk Profile</th>
                <th className="py-3.5 px-4 text-white font-bold">Entitlements</th>
                <th className="py-3.5 px-5 text-right text-white font-bold">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-sans text-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8A8A82] font-mono space-y-2">
                    <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p>No matching authoritative identities found</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedDept("ALL");
                        setSelectedStatus("ALL");
                        setSelectedRisk("ALL");
                      }}
                      className="text-xs text-[#D4E84A] hover:underline font-mono"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const groups = user.groups || [];
                  return (
                    <tr
                      key={user.id}
                      onClick={() => {
                        setSelectedUserForDrawer(user);
                        if (onSelectUser) onSelectUser(user);
                      }}
                      className={`transition-all duration-150 cursor-pointer group hover:bg-white/[0.07] hover:shadow-inner ${
                        isSelected ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => toggleSelectUser(user.id, e)}>
                        <button className="text-neutral-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4E84A]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Identity & Okta ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[10px] bg-[#141414] border border-white/10 text-[#D4E84A] font-mono font-bold flex items-center justify-center text-xs group-hover:scale-110 group-hover:border-[#D4E84A]/50 transition-all shrink-0 shadow-xs">
                            {(user.name || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-[#D4E84A] transition-colors flex items-center gap-1.5 truncate">
                              <span>{user.name}</span>
                            </div>
                            <div className="text-[11px] text-[#8A8A82] font-mono truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-200 group-hover:text-white transition-colors">{user.title}</div>
                        <div className="text-[11px] text-[#8A8A82] font-mono">
                          {user.department} {user.location ? `· ${user.location.split(",")[0]}` : ""}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4">
                        <RiskBadge level={user.riskLevel || (user as any).risk || "LOW"} score={user.riskScore} />
                      </td>

                      {/* Entitlements */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#141414] text-neutral-300 border border-white/10 font-medium group-hover:border-white/30 transition-colors">
                            {groups.length} Groups
                          </span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserForDrawer(user)}
                            className="p-2 rounded-full bg-[#141414] hover:bg-white hover:text-black text-neutral-300 border border-white/10 hover:border-white transition-all btn-interactive shadow-xs"
                            title="Inspect Okta Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate({ to: "/mover" })}
                            className="p-2 rounded-full bg-[#141414] hover:bg-[#D4E84A] hover:text-black text-neutral-300 border border-white/10 hover:border-[#D4E84A] transition-all btn-interactive shadow-xs"
                            title="Mover Role Transfer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate({ to: "/whatif" })}
                            className="p-2 rounded-full bg-[#141414] hover:bg-cyan-400 hover:text-black text-neutral-300 border border-white/10 hover:border-cyan-400 transition-all btn-interactive shadow-xs"
                            title="Simulate Access"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#141414] px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#8A8A82]">
          <div>
            Showing <span className="text-white font-bold">{filteredUsers.length}</span> of{" "}
            <span className="text-white font-bold">{users.length}</span> authoritative identities
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-[#D4E84A]">OKTA IDENTITY ENGINE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Slide-over Profile Drawer */}
      <UserDetailDrawer
        user={selectedUserForDrawer}
        open={Boolean(selectedUserForDrawer)}
        onClose={() => setSelectedUserForDrawer(null)}
      />
    </div>
  );
}
