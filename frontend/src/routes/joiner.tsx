import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Layers,
  AppWindow,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Zap,
  Check,
  Plus,
  X,
} from "lucide-react";
import { createJoiner } from "../services/api";
import { DEPARTMENTS, GROUP_CATALOG, APP_CATALOG } from "../services/mock-data";
import { AccessDiff } from "../components/AccessDiff";
import { RiskBadge } from "../components/RiskBadge";
import type { Simulation } from "../services/types";
import { useToast } from "../components/Toast";
import { ConvergenceBackground } from "../components/backgrounds/ConvergenceBackground";
import { UnifiedPageBackground } from "../components/backgrounds/UnifiedPageBackground";

export const Route = createFileRoute("/joiner")({
  component: JoinerWizardPage,
});

interface PresetTemplate {
  name: string;
  department: string;
  title: string;
  manager: string;
  location: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: "Alex Thorne",
    department: "Engineering",
    title: "Senior Backend Engineer",
    manager: "Dana Whitfield",
    location: "San Francisco, CA (Hybrid)",
  },
  {
    name: "Elena Rostova",
    department: "Finance",
    title: "FinOps Lead Analyst",
    manager: "Grace Lindqvist",
    location: "New York, NY (Remote)",
  },
  {
    name: "Marcus Vance",
    department: "Sales",
    title: "Enterprise Account Executive",
    manager: "Devin Brooks",
    location: "London, UK (Hybrid)",
  },
  {
    name: "Priya Sharma",
    department: "IT",
    title: "IAM Security Administrator",
    manager: "Victor Chen",
    location: "Bengaluru, IN (Remote)",
  },
];

export function JoinerWizardPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "Alex Thorne",
    email: "alex.thorne@company.com",
    department: "Engineering",
    title: "Senior Backend Engineer",
    manager: "Dana Whitfield",
    location: "San Francisco, CA (Hybrid)",
    startDate: "2026-09-01",
  });
  const [createdSim, setCreatedSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    GROUP_CATALOG["Engineering"] || []
  );
  const [selectedApps, setSelectedApps] = useState<string[]>(
    APP_CATALOG["Engineering"] || []
  );
  const [newGroupInput, setNewGroupInput] = useState("");
  const [newAppInput, setNewAppInput] = useState("");

  const handleApplyPreset = (tpl: PresetTemplate) => {
    const email = `${tpl.name.toLowerCase().replace(/\s+/g, ".")}@company.com`;
    setFormData({
      ...formData,
      name: tpl.name,
      email,
      department: tpl.department,
      title: tpl.title,
      manager: tpl.manager,
      location: tpl.location,
    });
    setSelectedGroups(GROUP_CATALOG[tpl.department] || []);
    setSelectedApps(APP_CATALOG[tpl.department] || []);
    success("Applied Template", `Pre-filled form with ${tpl.title} (${tpl.department}) parameters.`);
  };

  const handleDepartmentChange = (dept: string) => {
    setFormData({ ...formData, department: dept });
    setSelectedGroups(GROUP_CATALOG[dept] || []);
    setSelectedApps(APP_CATALOG[dept] || []);
  };

  const handleAddGroup = () => {
    if (newGroupInput.trim() && !selectedGroups.includes(newGroupInput.trim())) {
      setSelectedGroups([...selectedGroups, newGroupInput.trim()]);
      setNewGroupInput("");
    }
  };

  const handleRemoveGroup = (group: string) => {
    setSelectedGroups(selectedGroups.filter((g) => g !== group));
  };

  const handleAddApp = () => {
    if (newAppInput.trim() && !selectedApps.includes(newAppInput.trim())) {
      setSelectedApps([...selectedApps, newAppInput.trim()]);
      setNewAppInput("");
    }
  };

  const handleRemoveApp = (app: string) => {
    setSelectedApps(selectedApps.filter((a) => a !== app));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const sim = await createJoiner({
        ...formData,
        groups: selectedGroups,
        apps: selectedApps,
      });
      setCreatedSim(sim);
      setStep(4);
      success("Identity Provisioned in Okta", `Created ${formData.name} with ${selectedGroups.length} birthright groups.`);
    } catch (err: any) {
      error("Provisioning Failed", err?.message || "Failed to create joiner identity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 relative">
      <UnifiedPageBackground mode="converge" accentColor="#D4E84A" />
      {/* Hero Panel */}
      <section className="bg-gradient-to-r from-[#121316]/90 via-[#181920]/90 to-[#121316]/90 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/15 text-white flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] card-interactive hover-glow-lime relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4E84A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold tracking-[0.2em] text-[#D4E84A] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A] animate-pulse"></span>
            <span>01 / LIFECYCLE ONBOARDING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Joiner Provisioning Wizard
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-300 leading-[1.65] max-w-xl font-light">
            Birthright entitlement computation, duplicate identity validation, and automated SSO application bundle staging.
          </p>
        </div>
        <div className="w-14 h-14 rounded-[20px] bg-[#141416] text-[#D4E84A] border border-white/15 hidden sm:flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform relative z-10">
          <UserPlus className="w-7 h-7" />
        </div>
      </section>

      {/* Step Progress Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {[
          { num: "01", label: "Identity Profile" },
          { num: "02", label: "Entitlements" },
          { num: "03", label: "Pre-Flight Review" },
          { num: "04", label: "Okta Sealed" },
        ].map((st, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div
              key={st.num}
              className={`p-2.5 sm:p-3 rounded-[16px] border flex items-center gap-2 transition-all card-interactive ${
                isActive
                  ? "bg-[#141414] border-[#D4E84A] text-white shadow-lg hover-glow-lime"
                  : isDone
                  ? "bg-[#141414] border-white/20 text-[#D4E84A]"
                  : "bg-[#141414]/50 border-white/5 text-neutral-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                  isActive
                    ? "bg-[#D4E84A] text-[#141414]"
                    : isDone
                    ? "bg-[#D4E84A]/20 text-[#D4E84A]"
                    : "bg-white/10 text-neutral-400"
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
              </div>
              <span className="truncate text-[11px] sm:text-xs">{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Steps */}
      <div className="bg-[#141414] rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 border border-white/10 shadow-xl space-y-6 card-interactive">
        {/* Step 1: Profile & Presets */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Quick Templates Bar */}
            <div className="bg-[#1b1b1b] p-4 rounded-[20px] border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#D4E84A]" />
                <span className="text-[11px] font-mono font-bold uppercase text-[#D4E84A]">
                  Quick Role Templates
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleApplyPreset(tpl)}
                    className="px-3.5 py-1.5 rounded-full bg-[#141414] hover:bg-[#252525] border border-white/10 hover:border-[#D4E84A]/50 text-xs text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 btn-interactive shadow-xs"
                  >
                    <span className="font-bold text-white">{tpl.title}</span>
                    <span className="text-[10px] font-mono text-[#8E8E86]">({tpl.department})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. Sarah Chen"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Company Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. sarah.chen@company.com"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. Software Engineer II"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Reporting Manager
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. Dana Whitfield"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#8E8E86] block mb-1.5 font-bold">
                  Work Location & Onboarding Date
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white p-3 rounded-[16px] border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-sans"
                  placeholder="e.g. San Francisco HQ (Hybrid)"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.email}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold flex items-center gap-2 shadow-md btn-interactive disabled:opacity-50"
              >
                <span>CONTINUE TO ENTITLEMENTS</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Entitlement & App Bundle Builder */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Birthright Okta Groups */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4E84A]" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    Computed Birthright Groups ({selectedGroups.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#D4E84A]">AUTONOMOUS POLICY</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedGroups.map((grp) => (
                  <span
                    key={grp}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/30 flex items-center gap-1.5 font-bold hover:bg-[#D4E84A]/20 transition-all btn-interactive"
                  >
                    <span>{grp}</span>
                    <button
                      onClick={() => handleRemoveGroup(grp)}
                      className="hover:text-white p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newGroupInput}
                  onChange={(e) => setNewGroupInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                  placeholder="+ Add custom group..."
                  className="flex-1 bg-[#1b1b1b] text-white px-3.5 py-1.5 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] hover:border-white/30 transition-colors font-mono"
                />
                <button
                  onClick={handleAddGroup}
                  className="px-4 py-1.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-[#D4E84A] text-xs font-mono font-bold border border-white/10 btn-interactive"
                >
                  ADD
                </button>
              </div>
            </div>

            {/* SaaS Applications Staging */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AppWindow className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    Provisioned SaaS Tiles ({selectedApps.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">SAML 2.0 / OIDC</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedApps.map((app) => (
                  <div
                    key={app}
                    className="p-3.5 rounded-[16px] bg-[#1b1b1b] border border-white/10 flex items-center justify-between gap-2 text-xs card-interactive hover-glow-cyan"
                  >
                    <span className="font-bold text-white truncate">{app}</span>
                    <button
                      onClick={() => handleRemoveApp(app)}
                      className="text-neutral-500 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newAppInput}
                  onChange={(e) => setNewAppInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddApp()}
                  placeholder="+ Add custom application tile..."
                  className="flex-1 bg-[#1b1b1b] text-white px-3.5 py-1.5 rounded-full text-xs border border-white/10 focus:outline-none focus:border-cyan-400 hover:border-white/30 transition-colors font-mono"
                />
                <button
                  onClick={handleAddApp}
                  className="px-4 py-1.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-cyan-400 text-xs font-mono font-bold border border-white/10 btn-interactive"
                >
                  ADD
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                onClick={handlePrev}
                className="px-5 py-2 rounded-full border border-white/20 text-neutral-300 hover:bg-white/5 font-mono text-xs flex items-center gap-2 btn-interactive"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold flex items-center gap-2 shadow-md btn-interactive"
              >
                <span>PRE-FLIGHT REVIEW</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pre-Flight Review */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Identity Summary Card */}
            <div className="bg-[#1b1b1b] p-5 rounded-[24px] border border-white/10 space-y-3 card-interactive hover-glow-lime">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#D4E84A] text-[#0E0E0E] flex items-center justify-center font-semibold font-mono">
                    {formData.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{formData.name}</h3>
                    <p className="text-xs text-[#8E8E86] font-mono">{formData.email}</p>
                  </div>
                </div>
                <RiskBadge level="LOW" score={12} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="bg-[#141414] p-2.5 rounded-[12px] border border-white/5">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">DEPARTMENT</span>
                  <span className="font-bold text-white mt-0.5 block">{formData.department}</span>
                </div>
                <div className="bg-[#141414] p-2.5 rounded-[12px] border border-white/5">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">TITLE</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{formData.title}</span>
                </div>
                <div className="bg-[#141414] p-2.5 rounded-[12px] border border-white/5">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">MANAGER</span>
                  <span className="font-bold text-white mt-0.5 block">{formData.manager}</span>
                </div>
                <div className="bg-[#141414] p-2.5 rounded-[12px] border border-white/5">
                  <span className="text-[10px] font-mono text-[#8E8E86] block">LOCATION</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{formData.location}</span>
                </div>
              </div>
            </div>

            {/* Access Diff Preview */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase font-bold text-[#8E8E86]">
                Birthright Provisioning Delta
              </span>
              <AccessDiff
                delta={{
                  granted: selectedGroups,
                  revoked: [],
                  unchanged: [],
                }}
              />
            </div>

            {/* Pre-Flight Checklist */}
            <div className="bg-[#181818] p-4 rounded-[20px] border border-white/10 space-y-2 text-xs card-interactive">
              <div className="text-[10px] font-mono font-bold uppercase text-[#D4E84A]">
                Pre-Flight Automated Checks
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-[#D4E84A]" /> Okta user directory duplicate check: 0 collisions found
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-[#D4E84A]" /> Toxic Segregation-of-Duties (SoD) boundary verified: 0 risks
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-[#D4E84A]" /> Automated Welcome & MFA enrollment push staged
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                onClick={handlePrev}
                className="px-5 py-2 rounded-full border border-white/20 text-neutral-300 hover:bg-white/5 font-mono text-xs flex items-center gap-2 btn-interactive"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold flex items-center gap-2 shadow-lg btn-interactive"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? "PROVISIONING IN OKTA..." : "AUTHORIZE & CREATE USER"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Completion & Sealed Result */}
        {step === 4 && createdSim && (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-[#D4E84A] text-[#0E0E0E] flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(212,232,74,0.4)] hover:scale-110 transition-transform">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-[#D4E84A]">{createdSim.id}</span>
                <span className="text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-white">
                  OKTA REST HTTP 201
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Identity Provisioned Successfully</h2>
              <p className="text-xs text-[#8E8E86] max-w-md mx-auto leading-relaxed">
                Created worker account for <span className="text-white font-bold">{formData.name}</span> with{" "}
                <span className="text-[#D4E84A] font-bold">{selectedGroups.length} birthright groups</span> and{" "}
                <span className="text-white font-bold">{selectedApps.length} SaaS applications</span>.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  setStep(1);
                  setCreatedSim(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold btn-interactive border border-white/10"
              >
                PROVISION ANOTHER HIRE
              </button>
              <button
                onClick={() => navigate({ to: "/users" })}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#0E0E0E] font-mono text-xs font-semibold shadow-md btn-interactive"
              >
                VIEW IN DIRECTORY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
