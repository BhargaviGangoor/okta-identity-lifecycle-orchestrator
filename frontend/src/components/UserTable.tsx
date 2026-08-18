import { useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import type { User } from "../services/types";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";

interface UserTableProps {
  users: User[];
  onSelectUser?: (user: User) => void;
}

export function UserTable({ users, onSelectUser }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const departments = ["ALL", "Engineering", "Sales", "Finance", "IT", "People Ops", "Legal"];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1b1b1b] p-3 rounded-[20px] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A8A82] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] placeholder-[#8A8A82] font-sans"
          />
        </div>

        {/* Dept Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-colors shrink-0 ${
                selectedDept === dept
                  ? "bg-[#D4E84A] text-[#141414] font-bold"
                  : "bg-[#141414] text-[#8A8A82] hover:text-white border border-white/10"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1b1b1b] rounded-[24px] border border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#8A8A82] font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-5">Identity</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Risk Profile</th>
                <th className="py-3.5 px-4">Memberships</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans text-neutral-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#8A8A82] font-mono">
                    No matching identities found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      if (onSelectUser) onSelectUser(user);
                    }}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[8px] bg-[#141414] border border-white/10 text-[#D4E84A] font-mono font-bold flex items-center justify-center text-[10px] group-hover:scale-105 transition-transform">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#D4E84A] transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-[#8A8A82] font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{user.department}</div>
                      <div className="text-[11px] text-[#8A8A82]">{user.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge
                        level={user.riskScore > 75 ? "CRITICAL" : user.riskScore > 50 ? "HIGH" : user.riskScore > 25 ? "MEDIUM" : "LOW"}
                        score={user.riskScore}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A8A82]">
                        <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/10 text-neutral-300">
                          {user.groups.length} groups
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/10 text-neutral-300">
                          {user.apps.length} apps
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="p-1.5 rounded-full bg-[#141414] group-hover:bg-[#D4E84A] group-hover:text-[#141414] text-[#8A8A82] transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
          <div className="bg-[#141414] text-white w-full max-w-md h-full p-6 border-l border-white/10 shadow-2xl flex flex-col space-y-5 overflow-y-auto animate-in slide-in-from-right duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#D4E84A] text-[#141414] font-black text-base flex items-center justify-center">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-[#8A8A82] font-mono">{selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 flex items-center justify-center text-[#8A8A82] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Department</span>
                <p className="font-bold text-white mt-0.5">{selectedUser.department}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Role / Title</span>
                <p className="font-bold text-white mt-0.5">{selectedUser.title}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Manager</span>
                <p className="font-medium text-neutral-300 mt-0.5">{selectedUser.manager}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A8A82]">Location</span>
                <p className="font-medium text-neutral-300 mt-0.5">{selectedUser.location}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <StatusBadge status={selectedUser.status} />
                <RiskBadge
                  level={selectedUser.riskScore > 75 ? "CRITICAL" : selectedUser.riskScore > 50 ? "HIGH" : selectedUser.riskScore > 25 ? "MEDIUM" : "LOW"}
                  score={selectedUser.riskScore}
                />
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A82] font-bold">
                Assigned Okta Groups ({selectedUser.groups.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.groups.map((group) => (
                  <span
                    key={group}
                    className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#1b1b1b] text-neutral-200 border border-white/10"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A82] font-bold">
                SSO Applications ({selectedUser.apps.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.apps.map((app) => (
                  <span
                    key={app}
                    className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/25"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
