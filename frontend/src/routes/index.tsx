import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Lock,
  Activity,
  AlertTriangle,
  Play,
  RotateCw,
  Terminal,
  UserX,
  Code2,
  Check,
  Clock,
  Radio,
  Key,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Hash,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HolographicCyberCityBackground } from "../components/backgrounds/HolographicCyberCityBackground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/")({
  component: TeamEchoEditorialExperience,
});

interface PipelineStage {
  num: string;
  name: string;
  title: string;
  summary: string;
  action: string;
  techEndpoint: string;
  techService: string;
  techOutput: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    num: "01",
    name: "REQUEST",
    title: "Intake & Identification",
    summary: "Employee lifecycle transition initiated via HR trigger, Admin UI, or Bulk CSV ingestion.",
    action: "Validates identity payload and executes idempotency check to prevent duplicate provisioning.",
    techEndpoint: "POST /api/lifecycle/joiner · POST /api/bulk",
    techService: "JoinerController · ValidationService",
    techOutput: "{ employeeId: 'EMP1042', status: 'VALIDATED', duplicates: 0 }",
  },
  {
    num: "02",
    name: "VALIDATE",
    title: "Policy & Least Privilege",
    summary: "Evaluates Department + Role matrix to compute the exact required entitlement catalog.",
    action: "Enforces least-privilege boundary and detects toxic Segregation-of-Duties (SoD) collisions.",
    techEndpoint: "PolicyEngine.calculateRequiredGroups(dept, role)",
    techService: "PolicyService · RBAC RuleMatrix",
    techOutput: "{ requiredGroups: ['Engineering', 'Developers', 'GitHub-Access'] }",
  },
  {
    num: "03",
    name: "SIMULATE",
    title: "What-If Blast Radius",
    summary: "Dry-runs access mutations in memory without making any changes to Okta.",
    action: "Generates diff (REMOVE, KEEP, ADD) and assigns a composite security risk score.",
    techEndpoint: "POST /api/what-if · ImpactService.getImpact()",
    techService: "WhatIfService · RiskEngine",
    techOutput: "{ additions: 2, removals: 3, riskScore: 18, riskLevel: 'LOW' }",
  },
  {
    num: "04",
    name: "AUTHORIZE",
    title: "Risk-Gated Approval",
    summary: "Low-risk changes pass through automatically; high-risk operations stage into the Approval Queue.",
    action: "Requires multi-party administrator consensus with justification before mutation.",
    techEndpoint: "POST /api/approval/{simulationId}/approve",
    techService: "ApprovalService · LifecycleStateMachine",
    techOutput: "{ approvedBy: 'sec_admin_01', authorizedAt: '2026-08-18T16:00:00Z' }",
  },
  {
    num: "05",
    name: "EXECUTE",
    title: "Okta REST Mutation",
    summary: "Deterministic execution through the official Okta Management REST API with backoff retry.",
    action: "Creates user, updates group memberships, invalidates sessions, and activates/deactivates accounts.",
    techEndpoint: "OktaClient.createUser() · OktaClient.updateGroups()",
    techService: "OktaClient · OktaUserClient · OktaGroupClient",
    techOutput: "{ oktaUserId: '00u1a2b3c4d5', status: 'ACTIVE', httpStatus: 200 }",
  },
  {
    num: "06",
    name: "RECONCILE",
    title: "Digital Twin Verification",
    summary: "Synchronizes the expected state Digital Twin and seals an immutable audit trail.",
    action: "Continuously watches for manual out-of-band Okta drift and enables 1-click remediation.",
    techEndpoint: "GET /api/drift · POST /api/audit",
    techService: "IdentityTwin · AuditService · Spring Data JPA",
    techOutput: "{ twinStatus: 'IN_SYNC', auditRecordId: 84920, state: 'SEALED' }",
  },
];

interface TerminalScene {
  id: string;
  title: string;
  target: string;
  scenario: string;
  lines: string[];
  rawPayload: string;
  link: string;
}

const TERMINAL_SCENES: TerminalScene[] = [
  {
    id: "joiner",
    title: "01. Joiner Onboarding",
    target: "Sarah Chen (EMP-1042)",
    scenario: "New Hire Onboarding → Engineering / Developer",
    lines: [
      "> Request received: EMP-1042 (Sarah Chen) → Engineering / Developer",
      "> Identity validated (0 duplicate records in Okta) ✓",
      "> Policy evaluated (3 birthright entitlements calculated) ✓",
      "> Risk score: 0.12 (LOW RISK) ✓",
      "> Access simulated (0 toxic combinations detected) ✓",
      "> Execution approved (Auto-authorized by policy) ✓",
      "> OktaClient.createUser() → Assigned 3 groups [00u92a8b1c4d]",
      "> STATUS: COMPLETE · AUDIT SEALED #84920",
    ],
    rawPayload: `// [POST /api/lifecycle/joiner]
{
  "employeeId": "EMP-1042",
  "name": "Sarah Chen",
  "department": "Engineering",
  "role": "Developer",
  "groups": ["Engineering", "Developers", "GitHub-Access"]
}
--> HTTP 200 OK | Okta User Created [00u92a8b1c4d]
--> Database: digital_twin & audit_logs committed`,
    link: "/joiner",
  },
  {
    id: "mover",
    title: "02. Mover Recalculation",
    target: "Sarah Chen (EMP-1042)",
    scenario: "Cross-Department Transfer: Engineering → Finance / Analyst",
    lines: [
      "> Role change initiated: Engineering / Developer → Finance / Analyst",
      "> Current Okta groups cataloged (4 active entitlements) ✓",
      "> Target policy matrix computed (3 required entitlements) ✓",
      "> Access Diff: 3 REMOVED, 1 KEPT (Jira), 2 ADDED ✓",
      "> Risk score: 0.24 (LOW RISK) ✓",
      "> Transfer approved (Zero standing privileges accumulated) ✓",
      "> OktaClient updated: Obsolete tokens revoked & sessions refreshed",
      "> STATUS: COMPLETE · AUDIT SEALED #84921",
    ],
    rawPayload: `// [PUT /api/lifecycle/mover/EMP-1042]
{
  "targetDepartment": "Finance",
  "targetRole": "Analyst"
}
--> DELTA: -3 groups (Engineering, Developers, GitHub) | +2 groups (Finance, NetSuite)
--> OktaClient.removeUserFromGroup() x 3 -> OK
--> OktaClient.addUserToGroup() x 2 -> OK`,
    link: "/mover",
  },
  {
    id: "drift",
    title: "03. Out-of-Band Drift",
    target: "Sarah Chen (EMP-1042)",
    scenario: "Unauthorized 'AWS-Prod-Admin' group added directly in Okta Console",
    lines: [
      "> Scheduled reconciliation scan: Digital Twin vs Actual Okta",
      "> DRIFT DETECTED: Unapproved group 'AWS-Prod-Admin' present in Okta ⚠",
      "> Risk classification: CRITICAL (Privilege Creep / Toxic SoD) ⚠",
      "> Admin review: 1-Click Controlled Remediation Triggered",
      "> OktaClient mutation reverted: 'AWS-Prod-Admin' removed from identity",
      "> State verification: Expected == Actual → HEALTHY ✓",
      "> STATUS: COMPLETE · AUDIT SEALED #84922",
    ],
    rawPayload: `// [POST /api/drift/DRF-1001/remediate]
{
  "driftId": "DRF-1001",
  "employeeId": "EMP-1042",
  "action": "REVOKE_OUT_OF_BAND"
}
--> OktaClient.removeUserFromGroup('00u92a8b1c4d', '00g_aws_admin') -> HTTP 204
--> Verification: Digital Twin IN_SYNC`,
    link: "/drift",
  },
];

const INITIAL_AUDIT_EVENTS = [
  { time: "16:42:08", type: "JOINER", emp: "EMP-1042", status: "APPROVED", color: "text-emerald-400" },
  { time: "16:42:11", type: "POLICY", emp: "RBAC-23", status: "PASSED", color: "text-neutral-300" },
  { time: "16:42:14", type: "WHAT-IF", emp: "EMP-882", status: "SIMULATED", color: "text-cyan-400" },
  { time: "16:42:18", type: "DRIFT", emp: "EMP-391", status: "DETECTED", color: "text-amber-400" },
  { time: "16:42:21", type: "RECON", emp: "EMP-391", status: "RESOLVED", color: "text-[#D4E84A]" },
];

const TIMELINE_STEPS = [
  { time: "16:42:08", title: "Identity request initiated", actor: "HR_STREAM", target: "EMP-1042", detail: "Joiner request submitted for Sarah Chen (Engineering / Developer)" },
  { time: "16:42:09", title: "Policy & least privilege evaluated", actor: "POLICY_ENGINE", target: "RBAC-ENG-03", detail: "3 approved birthright entitlements calculated with 0 SoD collisions" },
  { time: "16:42:10", title: "Risk analyzed & auto-approved", actor: "RISK_ENGINE", target: "EMP-1042", detail: "Composite risk score 0.12 (Low Risk) -> Approved without escalation" },
  { time: "16:42:11", title: "Okta REST mutation executed", actor: "OKTA_CLIENT", target: "00u92a8b1c4d", detail: "User created and added to Engineering, Developers, and GitHub-Access" },
  { time: "16:42:12", title: "Cryptographic audit ledger sealed", actor: "AUDIT_SERVICE", target: "RECORD_84920", detail: "Immutable SHA-256 state proof committed to database ledger" },
];

export function TeamEchoEditorialExperience() {
  // ── Hero States ────────────────────────────────────────────────────
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // ── Section 01: Interactive Product Objects States ─────────────────
  // Object 1: Zero Standing Privilege (Sarah Chen)
  const [zspRequested, setZspRequested] = useState<boolean>(false);
  const [zspStep, setZspStep] = useState<number>(0); // 0=Idle, 1=Policy, 2=Risk, 3=Granted
  const [zspTimer, setZspTimer] = useState<number>(1799); // 29:59 in seconds

  // Object 2: Expected vs Actual (Drift slider 0=Expected, 100=Actual)
  const [driftSlider, setDriftSlider] = useState<number>(100);
  const [driftReconciled, setDriftReconciled] = useState<boolean>(false);

  // Object 3: Risk-Gated Execution (What-If Simulation)
  const [whatIfStep, setWhatIfStep] = useState<number>(0); // 0=Idle, 1=Running, 2=Ready
  const [whatIfApproved, setWhatIfApproved] = useState<boolean>(false);

  // ── Section 02: Pipeline Data Flow State ───────────────────────────
  const [activePipelineStage, setActivePipelineStage] = useState<number>(0);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  // ── Section 03: Live Terminal Stream State ─────────────────────────
  const [activeTerminalTab, setActiveTerminalTab] = useState<number>(0);
  const [visibleLineCount, setVisibleLineCount] = useState<number>(8);
  const [isTerminalStreaming, setIsTerminalStreaming] = useState<boolean>(false);
  const [showRawTrace, setShowRawTrace] = useState<boolean>(false);

  // ── Live Events & Timeline States ──────────────────────────────────
  const [eventStream, setEventStream] = useState(INITIAL_AUDIT_EVENTS);
  const [expandedTimelineStep, setExpandedTimelineStep] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("01");

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroObjectRef = useRef<HTMLDivElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement | null>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement | null>(null);
  const headlineLine3Ref = useRef<HTMLSpanElement | null>(null);

  // ── 1. GSAP Scroll Parallax, Reveal & Section Spy ──────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Headline Staggered Reveal
      const lines = [headlineLine1Ref.current, headlineLine2Ref.current, headlineLine3Ref.current].filter(Boolean);
      if (lines.length > 0) {
        gsap.fromTo(
          lines,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: "power2.out" }
        );
      }

      // Hero 3D Lens Parallax Scrub (Restrained 2–4 degrees)
      if (heroObjectRef.current) {
        gsap.to(heroObjectRef.current, {
          scrollTrigger: {
            trigger: heroObjectRef.current,
            start: "top 35%",
            end: "bottom -15%",
            scrub: 1.2,
          },
          y: 40,
          rotationZ: 3.5,
          rotationY: -2.5,
          scale: 0.97,
          ease: "power1.out",
        });
      }

      // Section Spy for progress indicator
      const sections = ["governance", "pipeline", "demos", "architecture"];
      sections.forEach((id, idx) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveSection(`0${idx + 1}`),
          onEnterBack: () => setActiveSection(`0${idx + 1}`),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── 2. Hero Cursor Response (Desktop Mouse Parallax) ───────────────
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setCursorPos({ x: x * 6, y: y * 6 });
  };

  const handleHeroMouseLeave = () => {
    setCursorPos({ x: 0, y: 0 });
  };

  // ── 3. Zero Standing Privilege Timer ───────────────────────────────
  useEffect(() => {
    if (!zspRequested || zspStep !== 3 || zspTimer <= 0) return;
    const interval = setInterval(() => {
      setZspTimer((prev) => {
        if (prev <= 1) {
          setZspRequested(false);
          setZspStep(0);
          return 1799;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [zspRequested, zspStep, zspTimer]);

  const handleRequestZsp = () => {
    setZspRequested(true);
    setZspStep(1);
    setTimeout(() => setZspStep(2), 350);
    setTimeout(() => {
      setZspStep(3);
      setZspTimer(1799);
    }, 750);
  };

  const handleRevokeZsp = () => {
    setZspRequested(false);
    setZspStep(0);
    setZspTimer(1799);
  };

  const formatZspTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `00:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ── 4. Risk-Gated Simulator Handler ────────────────────────────────
  const handleRunWhatIf = () => {
    setWhatIfApproved(false);
    setWhatIfStep(1);
    setTimeout(() => {
      setWhatIfStep(2);
    }, 1000);
  };

  // ── 5. Terminal Sequential Streamer ────────────────────────────────
  const handleSelectTerminalScene = (idx: number) => {
    setActiveTerminalTab(idx);
    setShowRawTrace(false);
    setIsTerminalStreaming(true);
    setVisibleLineCount(0);

    const scene = TERMINAL_SCENES[idx] || TERMINAL_SCENES[0]!;
    const totalLines = scene.lines.length;

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleLineCount(current);
      if (current >= totalLines) {
        clearInterval(interval);
        setIsTerminalStreaming(false);
      }
    }, 150);
  };

  // ── 6. Live Events Stream Periodic Rotator ─────────────────────────
  useEffect(() => {
    const eventTypes = ["JOINER", "POLICY", "WHAT-IF", "DRIFT", "RECON", "LEAVER", "MOVER"];
    const actions = ["APPROVED", "PASSED", "SIMULATED", "DETECTED", "RESOLVED", "TERMINATED", "RECALCULATED"];
    const colors = ["text-emerald-400", "text-neutral-300", "text-cyan-400", "text-amber-400", "text-[#D4E84A]"];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      const randIdx = Math.floor(Math.random() * eventTypes.length);
      const newEvent = {
        time: timeStr,
        type: eventTypes[randIdx] || "POLICY",
        emp: `EMP-${1000 + Math.floor(Math.random() * 900)}`,
        status: actions[randIdx] || "APPROVED",
        color: colors[randIdx % colors.length] || "text-emerald-400",
      };

      setEventStream((prev) => [newEvent, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const currentStage: PipelineStage = PIPELINE_STAGES[activePipelineStage] || PIPELINE_STAGES[0]!;
  const currentScene: TerminalScene = TERMINAL_SCENES[activeTerminalTab] || TERMINAL_SCENES[0]!;

  return (
    <div
      ref={containerRef}
      className="space-y-28 sm:space-y-36 pb-28 text-white selection:bg-[#D4E84A] selection:text-[#0E0E0E] relative"
    >
      {/* ── Subtle Floating Side Progress Tracker ──────────────────────── */}
      <div className="hidden 2xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-2.5 font-mono text-[10px] text-neutral-300 z-40 glass-card p-3 rounded-full shadow-2xl">
        {[
          { num: "01", label: "GOVERN", href: "#governance" },
          { num: "02", label: "FLOW", href: "#pipeline" },
          { num: "03", label: "DEMO", href: "#demos" },
          { num: "04", label: "PLATFORM", href: "#architecture" },
        ].map((item) => (
          <a
            key={item.num}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 ${
              activeSection === item.num
                ? "bg-[#D4E84A] text-[#0E0E0E] font-bold shadow-sm"
                : "hover:text-white hover:bg-white/5 text-neutral-300"
            }`}
          >
            <span>{item.num}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* ── 1. HERO SECTION ───────────────────────────────────────────── */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative pt-6 sm:pt-10 pb-10 sm:pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Balanced Typography & Line-by-Line Reveal */}
          <div ref={heroTextRef} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#D4E84A] tracking-wider uppercase font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4E84A]"></span>
              <span>IDENTITY GOVERNANCE FOR OKTA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              <span ref={headlineLine1Ref} className="block font-extrabold">
                There Is a
              </span>
              <span ref={headlineLine2Ref} className="inline-flex items-center gap-3 flex-wrap my-1">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md border border-white/20 shrink-0">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                </span>
                <span className="text-white font-extrabold">Better Way</span>
              </span>
              <span ref={headlineLine3Ref} className="block text-white font-extrabold">
                to Govern Identity.
              </span>
            </h1>

            <p className="text-base text-slate-300 font-normal leading-relaxed max-w-lg">
              Govern every identity change before it reaches Okta—validate policy, simulate impact, execute safely, and reconcile continuously.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#governance"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#D4E84A] text-[#0E0E0E] hover:bg-[#c4d838] font-mono text-xs font-bold transition-colors shadow-md group"
              >
                <span>EXPLORE CAPABILITIES</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                to="/users"
                className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-300 hover:text-[#D4E84A] underline underline-offset-4 transition-colors group"
              >
                <span>ENTER LIVE CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Integrated Physical Security Visual with Cursor Response */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div
              ref={heroObjectRef}
              style={{
                transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0) rotateX(${-cursorPos.y * 0.3}deg) rotateY(${cursorPos.x * 0.3}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="relative w-full max-w-[460px] lg:max-w-[540px]"
            >
              <img
                src="/assets/hero_lens.jpg"
                alt="Tactile 3D Optical Security Lens and Layered Geometry"
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-[32px] border border-white/20"
              />

              {/* Product Language Badge */}
              <div className="absolute -bottom-3 left-6 glass-card-strong px-5 py-3 rounded-[20px] shadow-2xl flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4E84A] animate-ping"></span>
                <span className="text-xs font-mono text-white tracking-wider font-bold">
                  REQUEST → GOVERN → EXECUTE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SECTION 01: WHAT TEAM ECHO GOVERNS (Interactive Objects) ── */}
      <section id="governance" className="space-y-10 pt-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-medium tracking-[0.2em] text-[#D4E84A] uppercase">
              01 / WHAT TEAM ECHO GOVERNS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100 font-sans leading-tight">
              Every Identity <br />
              Transition.
            </h2>
          </div>

          <p className="text-sm text-slate-300 max-w-md leading-relaxed font-normal">
            From onboarding to role changes to offboarding, every access transition passes through policy, risk, and verification.
          </p>
        </div>

        {/* 3 Interactive Product Objects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Object 1: ZERO STANDING PRIVILEGE (Node Graph + JIT Access) ── */}
          <div className="card-high-contrast rounded-[32px] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-md card-interactive">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-mono font-semibold text-[#D4E84A]">01</span>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 font-medium">
                  Just-In-Time Access
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                ZERO STANDING PRIVILEGE
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Access exists when needed—not permanently. Request temporary access to watch JIT provisioning and auto-expiry.
              </p>
            </div>

            {/* Interactive Identity Access Node Graph */}
            <div className="bg-[#0A0A0C]/70 rounded-[20px] p-5 border border-white/10 space-y-4">
              {/* Visual Node Graph Topology */}
              <div className="relative py-3 flex flex-col items-center justify-center font-mono text-xs">
                {/* Top Node: AWS */}
                <div
                  className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                    zspStep === 3
                      ? "bg-amber-500/25 border-amber-400 text-amber-200 font-semibold shadow-xs"
                      : "bg-[#1C1D22] border-white/10 text-slate-300 font-medium"
                  }`}
                >
                  AWS Prod
                </div>
                <div className={`w-0.5 h-4 transition-colors duration-300 ${zspStep === 3 ? "bg-amber-400" : "bg-neutral-700"}`}></div>

                {/* Middle Row: GitHub -- SARAH -- Jira */}
                <div className="flex items-center justify-center gap-3 w-full">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-medium">
                    GitHub
                  </div>
                  <div className="w-4 h-0.5 bg-emerald-400"></div>

                  <div className="px-4 py-2 rounded-xl bg-white text-[#0E0E0E] font-bold text-xs shadow-md shrink-0 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>SARAH</span>
                  </div>

                  <div className="w-4 h-0.5 bg-emerald-400"></div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-medium">
                    Jira
                  </div>
                </div>

                {/* Bottom Node: Slack */}
                <div className="w-0.5 h-4 bg-emerald-400"></div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-medium">
                  Slack
                </div>
              </div>

              {/* Action Button / Active Countdown */}
              {!zspRequested ? (
                <button
                  onClick={handleRequestZsp}
                  className="w-full py-3 rounded-xl bg-[#D4E84A] hover:bg-[#c4d838] text-[#0E0E0E] text-xs font-mono font-semibold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Key className="w-4 h-4 stroke-[2.5]" />
                  <span>REQUEST PRODUCTION ACCESS</span>
                </button>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  {zspStep === 1 && (
                    <div className="text-center py-2 text-xs font-mono font-bold text-[#D4E84A] animate-pulse">
                      › POLICY CHECK: Evaluating least privilege...
                    </div>
                  )}
                  {zspStep === 2 && (
                    <div className="text-center py-2 text-xs font-mono font-bold text-cyan-300 animate-pulse">
                      › RISK CHECK: Blast radius 0.14 (APPROVED) ✓
                    </div>
                  )}
                  {zspStep === 3 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-300 font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> ACCESS EXPIRES:
                        </span>
                        <span className="font-semibold text-white bg-black/80 px-3 py-1 rounded-md border border-white/20 tabular-nums">
                          {formatZspTime(zspTimer)}
                        </span>
                      </div>
                      <button
                        onClick={handleRevokeZsp}
                        className="w-full py-2 rounded-lg bg-[#202128] hover:bg-neutral-800 text-white text-xs font-mono font-bold transition-colors border border-white/20 cursor-pointer"
                      >
                        Revoke Access Now (0 Standing)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/joiner"
              className="inline-flex items-center justify-between text-xs font-mono font-bold text-white hover:text-[#D4E84A] pt-2 border-t border-white/10 group-hover:text-[#D4E84A] transition-colors"
            >
              <span>Explore JML Lifecycle</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Object 2: EXPECTED VS ACTUAL (Interactive State Slider) ─── */}
          <div className="card-high-contrast rounded-[32px] p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl group card-interactive ">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-sm font-mono font-semibold text-[#D4E84A]">02</span>
                <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 font-bold">
                  State Verification
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                EXPECTED VS ACTUAL
              </h3>
              <p className="text-sm text-white leading-relaxed font-medium">
                Know what access should look like before comparing it with reality. Move the slider to inspect drift.
              </p>
            </div>

            {/* Interactive Expected vs Actual State Comparison */}
            <div className="bg-[#0A0A0C] bg-dark-grid rounded-[24px] p-5 border border-white/15 space-y-4 shadow-inner">
              {/* Slider Control: EXPECTED ----●---- ACTUAL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={driftSlider < 50 ? "text-white font-semibold" : "text-slate-300 font-bold"}>
                    EXPECTED (Twin)
                  </span>
                  <span className={driftSlider >= 50 ? "text-[#D4E84A] font-semibold" : "text-slate-300 font-bold"}>
                    ACTUAL (Okta)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={driftSlider}
                  onChange={(e) => setDriftSlider(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D4E84A]"
                />
              </div>

              {/* Dynamic State List */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-medium">
                  <span>GitHub</span>
                  <span className="text-emerald-400 font-semibold">✓ In Policy</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-medium">
                  <span>AWS-Dev</span>
                  <span className="text-emerald-400 font-semibold">✓ In Policy</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-medium">
                  <span>Jira & Slack</span>
                  <span className="text-emerald-400 font-semibold">✓ In Policy</span>
                </div>

                {/* Unauthorized Drift Item (Fades in when slider > 40) */}
                {driftSlider >= 40 && !driftReconciled && (
                  <div
                    style={{ opacity: (driftSlider - 40) / 60 }}
                    className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 space-y-2.5 transition-opacity"
                  >
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span>⚠ AWS-Prod-Admin</span>
                      <span className="text-[10px] bg-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-bold">
                        Out-of-Band
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium">
                      3 deviations detected · 2 unapproved assignments
                    </div>
                    <button
                      onClick={() => setDriftReconciled(true)}
                      className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0E0E0E] text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 btn-interactive cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reconcile to Baseline</span>
                    </button>
                  </div>
                )}

                {driftReconciled && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs text-emerald-300 font-semibold animate-in fade-in duration-200">
                    ✓ Drift Reconciled: Unauthorized AWS-Prod-Admin purged
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/drift"
              className="inline-flex items-center justify-between text-xs font-mono font-bold text-white hover:text-[#D4E84A] pt-2 border-t border-white/15 group-hover:text-[#D4E84A] transition-colors"
            >
              <span>Launch Drift Scanner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Object 3: RISK-GATED EXECUTION (What-If Simulation Flow) ─── */}
          <div className="card-high-contrast rounded-[32px] p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl group card-interactive ">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-sm font-mono font-semibold text-[#D4E84A]">03</span>
                <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 font-bold">
                  Pre-Execution Gating
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                RISK-GATED EXECUTION
              </h3>
              <p className="text-sm text-white leading-relaxed font-medium">
                Simulate impact before a change reaches production. High-risk actions halt at the approval threshold.
              </p>
            </div>

            {/* Interactive Simulation Object */}
            <div className="bg-[#0A0A0C] bg-dark-grid rounded-[24px] p-5 border border-white/15 space-y-4 shadow-inner">
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs font-mono flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">MOVE USER: Sarah Chen</div>
                  <div className="text-xs text-slate-200 font-semibold mt-0.5">Engineering → Finance</div>
                </div>
                {whatIfStep === 0 && (
                  <button
                    onClick={handleRunWhatIf}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D4E84A] hover:bg-[#c4d838] text-[#0E0E0E] text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    SIMULATE
                  </button>
                )}
              </div>

              {/* Simulation Flow Pipeline / Impact analysis */}
              {whatIfStep === 1 && (
                <div className="py-4 text-center font-mono text-xs text-[#D4E84A] space-y-1 animate-pulse font-bold">
                  <div>REQUEST → POLICY → DELTA → RISK</div>
                  <div className="text-xs text-white">Calculating blast radius...</div>
                </div>
              )}

              {whatIfStep === 2 && (
                <div className="space-y-3 font-mono text-xs animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold">IMPACT ANALYSIS:</span>
                      <span className="text-[#D4E84A] font-semibold">+2 groups / -3 groups</span>
                    </div>

                    {/* Risk Score Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">Risk Score:</span>
                        <span className="text-amber-400 font-semibold">78% (HIGH RISK)</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[78%]"></div>
                      </div>
                    </div>

                    <div className="text-xs text-amber-300 font-bold">
                      RECOMMENDATION: Requires multi-party approval
                    </div>
                  </div>

                  {!whatIfApproved ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWhatIfApproved(true)}
                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                      >
                        APPROVE & STAGE
                      </button>
                      <button
                        onClick={() => setWhatIfStep(0)}
                        className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-emerald-400 py-1 font-semibold">
                      ✓ Staged & Executed in Okta Tenant
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/whatif"
              className="inline-flex items-center justify-between text-xs font-mono font-bold text-white hover:text-[#D4E84A] pt-2 border-t border-white/15 group-hover:text-[#D4E84A] transition-colors"
            >
              <span>Simulate Blast Radius</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION 02: HOW IT WORKS (Animated Pipeline Flow) ──────── */}
      <section id="pipeline" className="space-y-10 pt-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#D4E84A] uppercase">
              02 / HOW IT WORKS
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white font-sans leading-[0.98]">
              From Request <br />
              to Verified Access.
            </h2>
          </div>

          <p className="text-sm sm:text-base text-white max-w-md leading-relaxed font-semibold bg-black/50 p-3.5 rounded-xl border border-white/15">
            Watch the live governance pipeline progress from intake to policy checks, impact simulation, authorization, execution, and continuous reconciliation.
          </p>
        </div>

        {/* Unified Interactive Pipeline Flow Bar with Animated Data Pulse */}
        <div className="card-high-contrast rounded-[36px] p-7 sm:p-10 space-y-8 shadow-2xl card-interactive ">
          {/* Horizontal Step Indicator with Connectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 border-b border-white/15 pb-6 relative">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isActive = activePipelineStage === idx;
              const isPast = activePipelineStage > idx;
              return (
                <button
                  key={stage.name}
                  onClick={() => setActivePipelineStage(idx)}
                  className={`p-4 rounded-[20px] border text-left transition-all duration-300 relative group btn-interactive cursor-pointer ${
                    isActive
                      ? "bg-[#202128] border-[#D4E84A] shadow-xl scale-102"
                      : "bg-white/5 border-transparent hover:border-white/20 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={isActive ? "text-[#D4E84A] font-semibold" : "text-slate-300 font-bold"}>
                      {stage.num}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {isPast ? "✓" : isActive ? "● ACTIVE" : "○ WAITING"}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white tracking-wide font-mono">
                    {stage.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Live Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-[#D4E84A] font-bold">
                <span>STAGE {currentStage.num}</span>
                <span>/</span>
                <span>{currentStage.name}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-semibold text-white">
                {currentStage.title}
              </h3>

              <p className="text-base text-white leading-relaxed font-semibold">
                {currentStage.summary}
              </p>

              <div className="p-4 rounded-[18px] bg-black/70 border border-white/20 text-sm text-white leading-relaxed card-interactive font-medium">
                <strong className="text-[#D4E84A] font-mono font-bold">Platform Action: </strong>
                {currentStage.action}
              </div>

              {/* Progressive Disclosure Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#D4E84A] hover:underline btn-interactive cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>{showTechDetails ? "Hide Technical Specifications" : "VIEW TECHNICAL DETAILS →"}</span>
                </button>
              </div>
            </div>

            {/* Right: Technical Details or Dynamic Execution Node */}
            <div className="lg:col-span-5">
              {showTechDetails ? (
                <div className="bg-[#08080A] rounded-[24px] p-6 border border-[#D4E84A]/40 font-mono text-xs space-y-3 shadow-inner animate-in fade-in duration-200 card-interactive ">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2 text-xs text-white font-bold">
                    <span>ARCHITECTURE CONTRACT</span>
                    <span className="text-[#D4E84A]">JAVA 17 / SPRING BOOT</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-xs font-bold">ENDPOINT:</span>
                    <code className="text-[#D4E84A] font-bold">{currentStage.techEndpoint}</code>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-xs font-bold">INTERNAL SERVICE:</span>
                    <code className="text-white font-medium">{currentStage.techService}</code>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-xs font-bold">PAYLOAD STATE:</span>
                    <pre className="text-xs text-emerald-400 bg-white/10 p-2.5 rounded-lg mt-1 overflow-x-auto whitespace-pre-wrap font-bold">
                      {currentStage.techOutput}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#18191E] to-[#0A0A0C] bg-dark-grid rounded-[24px] p-8 border border-white/15 flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[220px] card-interactive ">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D4E84A] shadow-lg">
                    <Activity className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-white">Continuous Lifecycle Governance</div>
                    <div className="text-xs font-mono text-slate-200 font-bold">Stage {activePipelineStage + 1} of 6 in Execution Flow</div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setActivePipelineStage((prev) => (prev > 0 ? prev - 1 : 0))}
                      disabled={activePipelineStage === 0}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-mono text-white transition-all font-bold btn-interactive cursor-pointer"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActivePipelineStage((prev) => (prev < 5 ? prev + 1 : 0))}
                      className="px-5 py-2 rounded-full bg-[#D4E84A] text-[#0E0E0E] text-xs font-mono font-semibold hover:bg-white transition-all btn-interactive cursor-pointer"
                    >
                      Next Stage →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION 03: SEE IT IN ACTION & LIVE EVENT STREAM ───────── */}
      <section id="demos" className="space-y-10 pt-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#D4E84A] uppercase">
              03 / SEE IT IN ACTION
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white font-sans leading-[0.98]">
              Watch Governance <br />
              Happen.
            </h2>
          </div>

          <p className="text-sm sm:text-base text-white max-w-md leading-relaxed font-semibold bg-black/50 p-3.5 rounded-xl border border-white/15">
            Follow an identity request from intake to policy validation, risk analysis, execution, and audit.
          </p>
        </div>

        {/* Two-Column Grid: Live Execution Terminal + Live Event Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Terminal Console (8 Cols) */}
          <div className="lg:col-span-8 card-high-contrast rounded-[36px] p-7 sm:p-9 space-y-6 shadow-2xl card-interactive ">
            {/* Scenario Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
              <div className="flex flex-wrap gap-2">
                {TERMINAL_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectTerminalScene(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all btn-interactive cursor-pointer ${
                      activeTerminalTab === idx
                        ? "bg-[#D4E84A] text-[#0E0E0E] shadow-md"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowRawTrace(!showRawTrace)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-[#D4E84A] transition-colors btn-interactive cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>{showRawTrace ? "Show Summary" : "Inspect Raw Trace"}</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="bg-[#08080A] rounded-[24px] border border-white/15 p-6 sm:p-8 font-mono space-y-4 shadow-inner min-h-[260px] card-interactive">
              <div className="flex items-center justify-between border-b border-white/15 pb-3 text-xs text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="ml-2 text-white font-bold">team-echo://stream</span>
                </div>
                <span className="text-xs flex items-center gap-1.5 font-bold">
                  {isTerminalStreaming ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      ● EXECUTING
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">✓ COMPLETE</span>
                  )}
                </span>
              </div>

              {!showRawTrace ? (
                <div className="space-y-2.5 py-2 text-xs sm:text-sm font-medium">
                  {currentScene.lines.slice(0, visibleLineCount).map((line, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-150 ${
                        line.includes("STATUS:")
                          ? "text-[#D4E84A] font-semibold pt-2 border-t border-white/15"
                          : line.includes("DRIFT") || line.includes("CRITICAL")
                          ? "text-amber-300 font-bold"
                          : line.includes("OktaClient")
                          ? "text-emerald-300 font-bold"
                          : "text-white"
                      }`}
                    >
                      <span className="text-[#D4E84A] shrink-0 select-none font-semibold">›</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs sm:text-sm text-white leading-relaxed overflow-x-auto whitespace-pre-wrap py-2 animate-in fade-in duration-200 font-mono font-medium">
                  {currentScene.rawPayload}
                </pre>
              )}

              {/* Footer Link */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs text-slate-200 font-medium">
                  Target: <strong className="text-white font-bold">{currentScene.target}</strong>
                </span>
                <Link
                  to={currentScene.link}
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#D4E84A] hover:underline btn-interactive"
                >
                  <span>Launch in Platform Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Live Audit Event Stream (4 Cols) */}
          <div className="lg:col-span-4 card-high-contrast rounded-[36px] p-7 space-y-5 shadow-2xl flex flex-col justify-between card-interactive ">
            <div className="space-y-1">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                  <Radio className="w-4 h-4 text-[#D4E84A] animate-pulse" />
                  <span>LIVE AUDIT STREAM</span>
                </div>
                <span className="text-[10px] font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded-full">REAL-TIME</span>
              </div>
              <p className="text-xs text-white leading-relaxed pt-1 font-medium">
                Deterministic event feed from the Spring Boot orchestration engine.
              </p>
            </div>

            {/* Live Events Feed */}
            <div className="space-y-2 font-mono text-xs">
              {eventStream.map((ev, i) => (
                <div
                  key={`${ev.time}-${i}`}
                  className="p-3 rounded-xl bg-[#0A0A0C] border border-white/10 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-200 card-interactive"
                >
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-300 tabular-nums font-bold">{ev.time}</div>
                    <div className="font-semibold text-white">{ev.emp}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[10px] text-slate-200 font-bold">{ev.type}</div>
                    <div className={`text-xs font-semibold ${ev.color}`}>{ev.status}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/audit"
              className="inline-flex items-center justify-between text-xs font-mono font-bold text-white hover:text-[#D4E84A] pt-3 border-t border-white/15 transition-colors btn-interactive"
            >
              <span>View Full Audit Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Vertical Timeline of Event Sealing ───────────────────────── */}
        <div className="card-high-contrast rounded-[36px] p-7 sm:p-9 space-y-6 card-interactive">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <span className="text-xs font-mono font-semibold text-[#D4E84A] uppercase tracking-wider">
              Cryptographic Audit Progression
            </span>
            <span className="text-xs font-mono text-white font-medium">Click event to expand details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {TIMELINE_STEPS.map((step, idx) => (
              <div
                key={step.time}
                onClick={() => setExpandedTimelineStep(expandedTimelineStep === idx ? null : idx)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-2 card-interactive ${
                  expandedTimelineStep === idx
                    ? "bg-[#202128] border-[#D4E84A] shadow-lg "
                    : "bg-[#0A0A0C] border-white/15 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-200 font-bold">
                  <span className="tabular-nums">{step.time}</span>
                  <span className="w-2 h-2 rounded-full bg-[#D4E84A] shadow-[0_0_8px_#D4E84A]"></span>
                </div>
                <div className="text-xs font-semibold text-white leading-snug font-sans">
                  {step.title}
                </div>
                {expandedTimelineStep === idx && (
                  <div className="pt-2 border-t border-white/15 text-xs font-mono space-y-1 text-white animate-in fade-in duration-150 font-medium">
                    <div>Actor: <span className="text-[#D4E84A] font-bold">{step.actor}</span></div>
                    <div>Target: <span className="text-white font-bold">{step.target}</span></div>
                    <div className="text-slate-100 leading-relaxed pt-1">{step.detail}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CINEMATIC CTA ────────────────────────────────────── */}
      <section
        id="architecture"
        className="card-high-contrast rounded-[36px] p-10 sm:p-16 text-center space-y-8 shadow-2xl card-interactive "
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#D4E84A] uppercase">
            IDENTITY GOVERNANCE, WITHOUT THE BLIND SPOTS.
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
            Least Privilege. <br />
            Every Change Accounted For.
          </h2>
          <p className="text-sm sm:text-base text-white leading-relaxed max-w-lg mx-auto font-semibold bg-black/60 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
            Govern every employee lifecycle transition before it reaches Okta. Zero standing privilege, read-only simulation, and continuous drift detection.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/users"
            className="px-8 py-3.5 rounded-full bg-[#D4E84A] hover:bg-[#c4d838] text-[#0E0E0E] font-mono text-xs font-semibold shadow-xl transition-transform active:scale-95 flex items-center gap-2 group btn-interactive"
          >
            <span>ENTER PLATFORM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/whatif"
            className="px-8 py-3.5 rounded-full bg-[#1A1A1C] hover:bg-neutral-800 text-white font-mono text-xs font-bold border border-white/15 transition-colors flex items-center gap-2 group btn-interactive"
          >
            <span>RUN WHAT-IF SIMULATION</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Alias for Member 7 contract export
export { TeamEchoEditorialExperience as IAMEditorialMarketingExperience };
export default TeamEchoEditorialExperience;
