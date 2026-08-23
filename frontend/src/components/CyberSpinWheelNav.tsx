import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  Compass,
  Sparkles,
  Users,
  Network,
  UserPlus,
  UserCheck,
  UserMinus,
  Radio,
  ShieldAlert,
  FileText,
  X,
} from "lucide-react";
import { cyberSound } from "../utils/cyberSound";

export const APP_ROUTES = [
  { path: "/", label: "Overview", num: "00", icon: Sparkles, desc: "IAM Command Center" },
  { path: "/users", label: "Identities", num: "01", icon: Users, desc: "Authoritative Directory" },
  { path: "/graph", label: "Graph", num: "02", icon: Network, desc: "Access Topology" },
  { path: "/joiner", label: "Joiner", num: "03", icon: UserPlus, desc: "Birthright Onboarding" },
  { path: "/mover", label: "Mover", num: "04", icon: UserCheck, desc: "Role Transition Cockpit" },
  { path: "/leaver", label: "Leaver", num: "05", icon: UserMinus, desc: "Deprovision Kill-Switch" },
  { path: "/whatif", label: "What-If", num: "06", icon: Radio, desc: "Blast Radius Simulator" },
  { path: "/drift", label: "Drift", num: "07", icon: ShieldAlert, desc: "Drift Reconciliation" },
  { path: "/audit", label: "Audit", num: "08", icon: FileText, desc: "Cryptographic Ledger" },
];

export function CyberSpinWheelNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [wheelOpen, setWheelOpen] = useState(false);
  const [hoveredRouteIdx, setHoveredRouteIdx] = useState<number | null>(null);

  // Determine current active route index
  const currentIndex = APP_ROUTES.findIndex(
    (r) => r.path === currentPath || (r.path !== "/" && currentPath.startsWith(r.path))
  );
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  const prevRoute = APP_ROUTES[(activeIdx - 1 + APP_ROUTES.length) % APP_ROUTES.length]!;
  const nextRoute = APP_ROUTES[(activeIdx + 1) % APP_ROUTES.length]!;

  const goToNext = () => {
    cyberSound.playClick();
    navigate({ to: nextRoute.path });
  };

  const goToPrev = () => {
    cyberSound.playClick();
    navigate({ to: prevRoute.path });
  };

  // Keyboard navigation support: ArrowRight / ArrowLeft with Alt/Option
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIdx]);

  // Display target route info in center hub
  const displayedRoute =
    hoveredRouteIdx !== null ? APP_ROUTES[hoveredRouteIdx]! : APP_ROUTES[activeIdx]!;

  return (
    <>
      {/* ── Fixed Floating Navigation Dock on Right Side ──────────────── */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[9900] flex flex-col items-center gap-3">
        {/* Previous Page Arrow (Hover reveals title) */}
        <div className="relative group flex items-center justify-end">
          <div className="absolute right-12 px-3 py-1 rounded-full bg-black/90 text-white font-mono text-[10px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:-translate-x-1 transition-all border border-white/20 shadow-xl flex items-center gap-1.5">
            <span className="text-[#8E8E86] font-bold">PREV:</span>
            <span>{prevRoute.label}</span>
          </div>
          <button
            onClick={goToPrev}
            onMouseEnter={() => cyberSound.playHover()}
            className="w-10 h-10 rounded-full bg-[#121316]/90 hover:bg-[#1C1D22] border border-white/20 hover:border-[#D4E84A] text-white hover:text-[#D4E84A] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:scale-110 btn-interactive cursor-pointer"
            title={`Previous: ${prevRoute.label}`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Spinwheel Orbit Launcher Button */}
        <div className="relative group flex items-center justify-end">
          <div className="absolute right-14 px-3 py-1 rounded-full bg-black/90 text-white font-mono text-[10px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:-translate-x-1 transition-all border border-white/20 shadow-xl flex items-center gap-1.5">
            <span className="text-[#D4E84A] font-bold">Navigate to</span>
          </div>
          <button
            onClick={() => {
              cyberSound.playClick();
              setWheelOpen(!wheelOpen);
            }}
            onMouseEnter={() => cyberSound.playHover()}
            className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-[0_0_24px_rgba(212,232,74,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-110 cursor-pointer ${
              wheelOpen
                ? "bg-[#D4E84A] border-[#D4E84A] text-[#0E0E0E] rotate-90"
                : "bg-[#16171B]/95 border-[#D4E84A]/60 text-[#D4E84A] hover:border-[#D4E84A]"
            }`}
            title="Navigate to"
          >
            {wheelOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Compass className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            )}
          </button>
        </div>

        {/* Next Page Arrow (Hover reveals title & quick skip) */}
        <div className="relative group flex items-center justify-end">
          <div className="absolute right-12 px-3 py-1 rounded-full bg-[#D4E84A] text-[#0E0E0E] font-mono text-[10px] font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:-translate-x-1 transition-all shadow-xl flex items-center gap-1.5">
            <span>NEXT:</span>
            <span>{nextRoute.label}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <button
            onClick={goToNext}
            onMouseEnter={() => cyberSound.playHover()}
            className="w-10 h-10 rounded-full bg-[#121316]/90 hover:bg-[#D4E84A] border border-white/20 hover:border-[#D4E84A] text-white hover:text-[#0E0E0E] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:scale-110 btn-interactive cursor-pointer"
            title={`Next: ${nextRoute.label}`}
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ── Circular Radial Spinwheel Modal Menu ─────────────────────── */}
      {wheelOpen && (
        <div
          className="fixed inset-0 z-[9950] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setWheelOpen(false)}
        >
          {/* Close button top right */}
          <button
            onClick={() => setWheelOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-[#18191E] border border-white/20 text-white hover:text-[#D4E84A] flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative w-[480px] h-[480px] sm:w-[540px] sm:h-[540px] flex items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Outer Orbit Background Halo Rings */}
            <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_45s_linear_infinite] pointer-events-none"></div>
            <div className="absolute inset-10 rounded-full border border-dashed border-[#D4E84A]/25 animate-[spin_30s_linear_infinite_reverse] pointer-events-none"></div>
            <div className="absolute inset-24 rounded-full border border-white/5 pointer-events-none"></div>

            {/* Center Interactive Hub Display */}
            <div className="relative z-20 w-32 h-32 rounded-full bg-[#101115] border-2 border-[#D4E84A] flex flex-col items-center justify-center text-center p-3 shadow-[0_0_50px_rgba(212,232,74,0.35)] pointer-events-none transition-all">
              <span className="text-[10px] font-mono text-[#8E8E86] uppercase tracking-widest">
                PAGE {displayedRoute.num}
              </span>
              <span className="text-sm font-extrabold text-white mt-0.5 truncate max-w-[105px]">
                {displayedRoute.label}
              </span>
              <span className="text-[9px] font-sans text-neutral-400 mt-0.5 line-clamp-1 max-w-[105px]">
                {displayedRoute.desc}
              </span>
            </div>

            {/* Circular Orbit Page Link Buttons */}
            {APP_ROUTES.map((route, idx) => {
              const total = APP_ROUTES.length;
              // Angle distributed around 360 degrees, starting from top (-90 deg)
              const angle = (idx / total) * (Math.PI * 2) - Math.PI / 2;
              const radius = 175; // px distance from center hub
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = idx === activeIdx;
              const Icon = route.icon;

              return (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={() => {
                    cyberSound.playSuccess();
                    setWheelOpen(false);
                  }}
                  onMouseEnter={() => {
                    setHoveredRouteIdx(idx);
                    cyberSound.playHover();
                  }}
                  onMouseLeave={() => setHoveredRouteIdx(null)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute z-30 flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-115 cursor-pointer group/node ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  {/* Circular Button Icon */}
                  <div
                    className={`w-13 h-13 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                      isActive
                        ? "bg-[#D4E84A] text-[#0E0E0E] ring-4 ring-[#D4E84A]/40 shadow-[0_0_24px_#D4E84A]"
                        : "bg-[#18191E] border border-white/20 text-white group-hover/node:border-[#D4E84A] group-hover/node:text-[#D4E84A] group-hover/node:shadow-[0_0_16px_rgba(212,232,74,0.3)]"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Always Visible Text Label Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-md transition-all ${
                      isActive
                        ? "bg-[#D4E84A] text-[#0E0E0E]"
                        : "bg-black/85 text-neutral-200 border border-white/15 group-hover/node:text-white group-hover/node:border-[#D4E84A]/50 group-hover/node:bg-black"
                    }`}
                  >
                    {route.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
