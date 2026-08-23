import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserMinus,
  Sparkles,
  Network,
  ExternalLink,
  Copy,
  Check,
  Key,
  Layers,
  AppWindow,
  Mail,
  MapPin,
  Briefcase,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import type { User as UserType } from "../services/types";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { APP_CATALOG } from "../services/mock-data";
import { useToast } from "./Toast";

interface UserDetailDrawerProps {
  user: UserType | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailDrawer({ user, open, onClose }: UserDetailDrawerProps) {
  const navigate = useNavigate();
  const { success } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!open || !user) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    success("Copied to clipboard", `${label}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const groups = user.groups || [];
  const apps = (user.apps && user.apps.length > 0)
    ? user.apps
    : (APP_CATALOG[user.department] || ["Google Workspace", "Slack", "Jira"]);

  return (
    <div
      className="fixed inset-0 z-[9990] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-[#141414] border-l border-white/15 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#181818] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-[#0E0E0E] border border-white/20 text-[#D4E84A] font-mono font-semibold text-sm sm:text-base flex items-center justify-center shadow-md shrink-0">
              {(user?.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">{user.name}</h2>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-xs text-[#8E8E86] font-mono mt-0.5 truncate">
                {user.title} · {user.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 scrollbar-none touch-scroll safe-p-bottom">
          {/* Quick Lifecycle Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                navigate({ to: "/mover" });
                onClose();
              }}
              className="p-3 rounded-[16px] bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group card-interactive hover-glow-lime btn-interactive"
            >
              <UserCheck className="w-4 h-4 text-[#D4E84A] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono font-bold text-neutral-200">Mover</span>
              <span className="text-[9px] text-neutral-500">Transfer Role</span>
            </button>

            <button
              onClick={() => {
                navigate({ to: "/whatif" });
                onClose();
              }}
              className="p-3 rounded-[16px] bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group card-interactive hover-glow-cyan btn-interactive"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono font-bold text-neutral-200">Simulate</span>
              <span className="text-[9px] text-neutral-500">Blast Radius</span>
            </button>

            <button
              onClick={() => {
                navigate({ to: "/graph" });
                onClose();
              }}
              className="p-3 rounded-[16px] bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group card-interactive hover-glow-lime btn-interactive"
            >
              <Network className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono font-bold text-neutral-200">Graph</span>
              <span className="text-[9px] text-neutral-500">View Lineage</span>
            </button>

            <button
              onClick={() => {
                navigate({ to: "/leaver" });
                onClose();
              }}
              className="p-3 rounded-[16px] bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group card-interactive hover-glow-orange btn-interactive"
            >
              <UserMinus className="w-4 h-4 text-[#E8703A] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono font-bold text-neutral-200">Leaver</span>
              <span className="text-[9px] text-neutral-500">Offboard</span>
            </button>
          </div>

          {/* Risk Profile & Telemetry Card */}
          <div className="bg-[#1a1a1a] rounded-[22px] p-5 border border-white/10 space-y-4 card-interactive hover-glow-lime">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D4E84A]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Security Risk Profile
                </span>
              </div>
              <RiskBadge level={user.riskLevel} score={user.riskScore} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#141414] p-3 rounded-[14px] border border-white/10 text-center">
                <span className="text-[10px] font-mono text-[#8E8E86] block">ENTITLEMENTS</span>
                <span className="text-lg font-semibold text-white mt-0.5 block">{groups.length}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-[14px] border border-white/10 text-center">
                <span className="text-[10px] font-mono text-[#8E8E86] block">LINKED APPS</span>
                <span className="text-lg font-semibold text-white mt-0.5 block">{apps.length}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-[14px] border border-white/10 text-center">
                <span className="text-[10px] font-mono text-[#8E8E86] block">RISK SCORE</span>
                <span className={`text-lg font-semibold mt-0.5 block ${
                  user.riskScore > 60 ? "text-[#E8703A]" : user.riskScore > 30 ? "text-amber-400" : "text-[#D4E84A]"
                }`}>
                  {user.riskScore}/100
                </span>
              </div>
            </div>

            {user.riskScore > 40 && (
              <div className="bg-[#E8703A]/10 border border-[#E8703A]/30 rounded-[14px] p-3 flex items-start gap-2.5 text-xs text-neutral-300">
                <AlertTriangle className="w-4 h-4 text-[#E8703A] shrink-0 mt-0.5" />
                <span>
                  Elevated risk detected due to privileged cloud access policies or cross-department standing entitlements.
                </span>
              </div>
            )}
          </div>

          {/* Identity Attribute Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E86]">
              Okta Identity Attributes
            </h4>
            <div className="bg-[#1a1a1a] rounded-[20px] p-4 border border-white/10 divide-y divide-white/5 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-[#8E8E86] flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Okta User ID:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-white">
                  <span>{user.id}</span>
                  <button
                    onClick={() => handleCopy(user.id, "User ID")}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    {copiedField === "User ID" ? <Check className="w-3 h-3 text-[#D4E84A]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-[#8E8E86] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Primary Email:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-white">
                  <span>{user.email}</span>
                  <button
                    onClick={() => handleCopy(user.email, "Email")}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    {copiedField === "Email" ? <Check className="w-3 h-3 text-[#D4E84A]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-[#8E8E86] flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Manager:
                </span>
                <span className="font-medium text-white">{user.manager || "Executive Staff"}</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-[#8E8E86] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Location:
                </span>
                <span className="font-medium text-white">{user.location || "San Francisco HQ (Hybrid)"}</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <span className="text-[#8E8E86] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Provisioned:
                </span>
                <span className="font-mono text-neutral-300">
                  {user.startDate ? new Date(user.startDate).toLocaleDateString() : "2026-01-15"}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Okta Groups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E86] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#D4E84A]" /> Assigned Okta Groups ({groups.length})
              </h4>
              <span className="text-[10px] font-mono text-[#D4E84A]">AUTHORITATIVE RBAC</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <div
                  key={group}
                  className="px-3 py-1.5 rounded-[12px] bg-[#1a1a1a] border border-white/10 text-xs font-mono text-neutral-200 flex items-center gap-2 hover:border-[#D4E84A]/40 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A]"></span>
                  <span>{group}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected SaaS Applications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E86] flex items-center gap-2">
                <AppWindow className="w-3.5 h-3.5 text-cyan-400" /> Provisioned SaaS Applications ({apps.length})
              </h4>
              <span className="text-[10px] font-mono text-cyan-400">SSO / SAML 2.0</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {apps.map((app) => (
                <div
                  key={app}
                  className="p-3 rounded-[14px] bg-[#1a1a1a] border border-white/10 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-bold text-neutral-200 truncate">{app}</span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#181818] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-[#8E8E86]">
            Identity Synchronized with Okta Production
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
