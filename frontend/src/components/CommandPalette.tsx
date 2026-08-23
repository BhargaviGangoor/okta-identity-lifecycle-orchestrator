import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  UserPlus,
  UserCheck,
  UserMinus,
  Sparkles,
  RefreshCw,
  FileText,
  Network,
  Users,
  Terminal,
  ArrowRight,
  ShieldAlert,
  X,
  ExternalLink,
  ChevronRight,
  Command,
} from "lucide-react";
import { getUsers } from "../services/api";
import type { User } from "../services/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getUsers().then(setUsers);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Navigation Items
  const navItems = [
    {
      id: "overview",
      title: "Overview Dashboard",
      subtitle: "Telemetry, active pipeline stages, and security telemetry",
      icon: Terminal,
      category: "Navigation",
      action: () => navigate({ to: "/" }),
      badge: "PAGE",
    },
    {
      id: "users",
      title: "Authoritative Identities",
      subtitle: "Browse worker directory, groups, and application tiles",
      icon: Users,
      category: "Navigation",
      action: () => navigate({ to: "/users" }),
      badge: "PAGE",
    },
    {
      id: "joiner",
      title: "Joiner Provisioning",
      subtitle: "Onboard new hire with computed birthright entitlements",
      icon: UserPlus,
      category: "Lifecycle Workflows",
      action: () => navigate({ to: "/joiner" }),
      badge: "WORKFLOW",
    },
    {
      id: "mover",
      title: "Mover Role Transfer",
      subtitle: "Execute cross-department role transfer & delta reconciliation",
      icon: UserCheck,
      category: "Lifecycle Workflows",
      action: () => navigate({ to: "/mover" }),
      badge: "WORKFLOW",
    },
    {
      id: "leaver",
      title: "Leaver Deprovisioning",
      subtitle: "Trigger instant session kill-switch & entitlement revocation",
      icon: UserMinus,
      category: "Lifecycle Workflows",
      action: () => navigate({ to: "/leaver" }),
      badge: "WORKFLOW",
    },
    {
      id: "whatif",
      title: "What-If Blast Radius Simulation",
      subtitle: "Predictive dry-run access mutation and risk assessment",
      icon: Sparkles,
      category: "Lifecycle Workflows",
      action: () => navigate({ to: "/whatif" }),
      badge: "SIMULATION",
    },
    {
      id: "drift",
      title: "Drift Scanner & Reconciliation",
      subtitle: "Detect unauthorized out-of-band Okta assignments",
      icon: RefreshCw,
      category: "Governance & Audit",
      action: () => navigate({ to: "/drift" }),
      badge: "SECURITY",
    },
    {
      id: "audit",
      title: "Security Audit Trail",
      subtitle: "Cryptographically sealed immutable compliance ledger",
      icon: FileText,
      category: "Governance & Audit",
      action: () => navigate({ to: "/audit" }),
      badge: "COMPLIANCE",
    },
    {
      id: "graph",
      title: "Identity Access Graph",
      subtitle: "Interactive topology of users, groups, and SaaS apps",
      icon: Network,
      category: "Governance & Audit",
      action: () => navigate({ to: "/graph" }),
      badge: "TOPOLOGY",
    },
  ];

  // User Items
  const userItems = useMemo(() => {
    return users.slice(0, 15).map((u) => ({
      id: `user-${u.id}`,
      title: u.name,
      subtitle: `${u.department} · ${u.title} (${u.email})`,
      icon: Users,
      category: "Identities",
      action: () => navigate({ to: "/users" }),
      badge: u.riskLevel,
      riskLevel: u.riskLevel,
    }));
  }, [users, navigate]);

  // Combine and filter
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [...navItems, ...userItems.slice(0, 5)];

    const all = [...navItems, ...userItems];
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, navItems, userItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredItems.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredItems, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#141414] border border-white/20 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#181818]">
          <Search className="w-5 h-5 text-[#D4E84A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, identity name, or lifecycle action... (e.g. 'Mover', 'Sarah', 'Drift')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-neutral-500 font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-neutral-400 hover:text-white p-1 rounded-full text-xs font-mono"
            >
              CLEAR
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs font-mono">No matching actions or identities found</p>
              <p className="text-[11px] text-neutral-600">Try searching for "Joiner", "Mover", "What-If", or a team member name</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-[16px] flex items-center justify-between gap-3 transition-all duration-100 ${
                    isSelected
                      ? "bg-[#D4E84A] text-[#0E0E0E]"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#0E0E0E] text-[#D4E84A]"
                          : "bg-[#222] text-neutral-300 border border-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-[#0E0E0E]" : "text-white"}`}>
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-black/15 text-black"
                              : "bg-white/10 text-neutral-400"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? "text-neutral-800" : "text-neutral-400"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-black text-[#D4E84A]"
                            : item.badge === "CRITICAL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : item.badge === "HIGH"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/10 text-neutral-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isSelected ? "text-black translate-x-0.5" : "text-neutral-600"
                      } transition-transform`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#111] flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">esc</kbd> Close
            </span>
          </div>
          <span className="text-[#D4E84A] font-bold">TEAM ECHO IAM ORCHESTRATOR</span>
        </div>
      </div>
    </div>
  );
}
