import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, UserPlus } from "lucide-react";
import { createJoiner } from "../services/api";
import { DEPARTMENTS, GROUP_CATALOG, APP_CATALOG } from "../services/mock-data";
import { AccessDiff } from "../components/AccessDiff";
import { RiskBadge } from "../components/RiskBadge";
import type { Simulation } from "../services/types";

export const Route = createFileRoute("/joiner")({
  component: JoinerWizardPage,
});

export function JoinerWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "Engineering",
    title: "Software Engineer",
    manager: "Dana Whitfield",
    location: "Bengaluru, IN",
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
      const sim = await createJoiner(formData);
      setCreatedSim(sim);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Hero Panel */}
      <section className="bg-[#F7F4EE] rounded-[32px] p-6 sm:p-8 border border-black/10 text-[#0E0E0E] flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8E8E86] uppercase">
            01 / LIFECYCLE ONBOARDING
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Joiner Provisioning
          </h1>
          <p className="text-xs sm:text-[13px] text-[#666] leading-[1.65] max-w-lg">
            Birthright entitlement computation, duplicate identity validation, and automated SSO application bundle staging.
          </p>
        </div>
        <div className="w-12 h-12 rounded-[16px] bg-[#0E0E0E] text-[#D4E84A] hidden sm:flex items-center justify-center font-bold shadow-md">
          <UserPlus className="w-6 h-6" />
        </div>
      </section>

      {/* Step Progress Pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: "01", title: "Identity Details" },
          { num: "02", title: "Birthright Policy" },
          { num: "03", title: "Review & Commit" },
        ].map((s, idx) => (
          <div
            key={s.num}
            className={`p-4 rounded-[22px] border transition-all ${
              step === idx + 1
                ? "bg-[#D4E84A] text-[#0E0E0E] border-[#D4E84A] font-bold shadow-sm"
                : step > idx + 1
                ? "bg-[#1b1b1b] text-neutral-200 border-white/10"
                : "bg-[#141414] text-[#8E8E86] border-white/5"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono uppercase">
              <span>Step {s.num}</span>
              {step > idx + 1 && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4E84A]" />}
            </div>
            <div className="text-xs font-bold mt-0.5 truncate">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Wizard Body */}
      <section className="bg-[#141414] rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#D4E84A] font-mono">01.</span> Candidate Profile Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Chen"
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. maya.chen@northwind.io"
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Security Architect"
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="e.g. Aisha Bello"
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-[#8A8A82]">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#1b1b1b] text-white px-4 py-2.5 rounded-[14px] text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.email}
                className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] disabled:opacity-50 text-[#141414] font-mono text-xs font-black flex items-center gap-2"
              >
                <span>CONTINUE TO POLICY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-[#D4E84A] font-mono">02.</span> Tailor Entitlements & Application Access
              </h2>
              <span className="text-[11px] font-mono text-[#8E8E86]">Click &times; to remove or add custom below</span>
            </div>

            <div className="space-y-4">
              {/* Groups Management */}
              <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#D4E84A] font-bold">
                    Okta Group Memberships ({selectedGroups.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {selectedGroups.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#141414] text-neutral-200 border border-white/10 group"
                    >
                      <span>{g}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(g)}
                        className="text-[#8E8E86] hover:text-[#E8703A] text-xs font-bold transition-colors ml-0.5"
                        title="Remove group"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    value={newGroupInput}
                    onChange={(e) => setNewGroupInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGroup())}
                    placeholder="Add custom group (e.g. sec-analysts-l2)..."
                    className="flex-1 bg-[#141414] text-white px-3 py-1.5 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddGroup}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold shrink-0"
                  >
                    + Add Group
                  </button>
                </div>
              </div>

              {/* SSO Applications Management */}
              <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#D4E84A] font-bold">
                    SSO Application Tiles ({selectedApps.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {selectedApps.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#D4E84A]/10 text-[#D4E84A] border border-[#D4E84A]/25 group"
                    >
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveApp(a)}
                        className="text-[#D4E84A]/60 hover:text-[#E8703A] text-xs font-bold transition-colors ml-0.5"
                        title="Remove application"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    value={newAppInput}
                    onChange={(e) => setNewAppInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddApp())}
                    placeholder="Add custom app (e.g. Datadog, Splunk)..."
                    className="flex-1 bg-[#141414] text-white px-3 py-1.5 rounded-full text-xs border border-white/10 focus:outline-none focus:border-[#D4E84A] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddApp}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold shrink-0"
                  >
                    + Add App
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black flex items-center gap-2"
              >
                <span>REVIEW & SUBMIT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#D4E84A] font-mono">03.</span> Final Review & Simulation Delta
            </h2>

            <div className="bg-[#1b1b1b] p-4 rounded-[18px] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{formData.name}</div>
                <div className="text-xs text-[#8A8A82] font-mono">
                  {formData.email} · {formData.department} ({formData.title})
                </div>
              </div>
              <RiskBadge level="LOW" score={18} />
            </div>

            <AccessDiff
              delta={{
                granted: selectedGroups,
                revoked: [],
                unchanged: ["okta-mfa-enforced", "google-workspace-user"],
              }}
            />

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#D4E84A] hover:bg-[#c2d73b] text-[#141414] font-mono text-xs font-black flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "PROVISIONING..." : "CONFIRM & CREATE JOINER"}</span>
              </button>
            </div>
          </div>
        )}

        {step === 4 && createdSim && (
          <div className="space-y-5 text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#D4E84A] text-[#141414] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#D4E84A]">{createdSim.id}</span>
              <h2 className="text-xl font-extrabold text-white">Joiner Simulation Created</h2>
              <p className="text-xs text-[#8A8A82] max-w-sm mx-auto leading-relaxed">
                Identity for <span className="text-white font-bold">{formData.name}</span> staged in orchestrator queue.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    department: "Engineering",
                    title: "Software Engineer",
                    manager: "Dana Whitfield",
                    location: "Bengaluru, IN",
                    startDate: "2026-09-01",
                  });
                  setStep(1);
                }}
                className="px-4 py-2 rounded-full bg-[#1b1b1b] hover:bg-neutral-800 text-white font-mono text-xs font-bold"
              >
                ONBOARD ANOTHER
              </button>
              <button
                onClick={() => navigate({ to: "/" })}
                className="px-5 py-2 rounded-full bg-[#D4E84A] text-[#141414] font-mono text-xs font-black"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
