import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Search,
  Check,
  Globe,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { useToast } from "./Toast";
import { cyberSound } from "../utils/cyberSound";

export function Navbar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { info } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [envDropdownOpen, setEnvDropdownOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(cyberSound.isMuted());
  const [currentEnv, setCurrentEnv] = useState({
    name: "Okta Prod-US",
    region: "us-east-1",
    status: "HEALTHY",
    latency: "24ms",
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        cyberSound.playClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSound = () => {
    const newMuted = cyberSound.toggleMute();
    setSoundMuted(newMuted);
    if (!newMuted) {
      info("Cyber Sound Effects Enabled", "Synthesized Web Audio UI feedback active.");
    } else {
      info("Audio Muted", "Interface sound effects muted.");
    }
  };

  const navItems = [
    { to: "/", label: "Overview" },
    { to: "/users", label: "Identities" },
    { to: "/graph", label: "Graph" },
    { to: "/joiner", label: "Joiner" },
    { to: "/mover", label: "Mover" },
    { to: "/leaver", label: "Leaver" },
    { to: "/whatif", label: "What-If" },
    { to: "/drift", label: "Drift" },
    { to: "/audit", label: "Audit" },
  ];

  const environments = [
    { name: "Okta Prod-US", region: "us-east-1", status: "HEALTHY", latency: "24ms" },
    { name: "Okta Preview (Sandbox)", region: "us-west-2", status: "HEALTHY", latency: "38ms" },
    { name: "Okta EU-Staging", region: "eu-central-1", status: "HEALTHY", latency: "82ms" },
  ];

  return (
    <>
      <header className="w-full flex items-center justify-between gap-3 px-1 py-1">
        {/* Left: TEAM ECHO logo */}
        <Link
          to="/"
          onMouseEnter={() => cyberSound.playHover()}
          onClick={() => cyberSound.playClick()}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-[10px] border border-white/20 bg-black flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-xs">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#D4E84A] shadow-[0_0_8px_#D4E84A] group-hover:shadow-[0_0_14px_#D4E84A] transition-shadow"></div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold tracking-tight text-white text-lg font-sans">TEAM ECHO</span>
            <span className="text-[10px] font-mono text-[#8E8E86] tracking-widest uppercase">/ IAM</span>
          </div>
        </Link>

        {/* Center: Editorial floating pill nav bar */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#FAF8F5] text-[#0E0E0E] px-3.5 py-1.5 rounded-full shadow-lg border border-white/20">
          {navItems.map((item) => {
            const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={() => cyberSound.playHover()}
                onClick={() => cyberSound.playClick()}
                className={`text-[12px] font-semibold px-3 py-1 rounded-full transition-all duration-200 relative ${
                  isActive
                    ? "bg-[#0E0E0E] text-white font-bold shadow-xs"
                    : "text-[#555] hover:text-[#0E0E0E] hover:bg-black/5"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4E84A]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Sound Toggle + Spotlight ⌘K + Environment Switcher + CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              !soundMuted
                ? "bg-[#D4E84A]/15 border-[#D4E84A]/40 text-[#D4E84A] shadow-[0_0_12px_rgba(212,232,74,0.3)] hover:scale-105"
                : "bg-[#1b1b1b] border-white/10 text-neutral-400 hover:text-white"
            }`}
            title={soundMuted ? "Enable Cyber Sound Effects" : "Mute Sound Effects"}
          >
            {!soundMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Search Button */}
          <button
            onClick={() => {
              setCommandPaletteOpen(true);
              cyberSound.playClick();
            }}
            onMouseEnter={() => cyberSound.playHover()}
            className="flex items-center gap-2 bg-[#1b1b1b] hover:bg-[#252525] border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full text-xs text-neutral-300 transition-all group btn-interactive"
            title="Search Actions & Identities (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#D4E84A]" />
            <span className="hidden sm:inline font-sans text-[11px]">Quick Find</span>
            <kbd className="text-[9px] font-mono text-neutral-400 bg-white/10 px-1.5 py-0.5 rounded ml-1">
              ⌘K
            </kbd>
          </button>

          {/* Environment dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setEnvDropdownOpen(!envDropdownOpen);
                cyberSound.playClick();
              }}
              onMouseEnter={() => cyberSound.playHover()}
              className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-full text-xs text-white cursor-pointer transition-colors font-medium btn-interactive"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A] animate-pulse"></span>
              <span className="text-[11px] font-mono">{currentEnv.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {envDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#181818] border border-white/15 rounded-[20px] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 card-interactive"
                onClick={() => setEnvDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono text-[#8E8E86] uppercase tracking-wider">
                  Target Okta Tenant
                </div>
                {environments.map((env) => (
                  <button
                    key={env.name}
                    onClick={() => {
                      setCurrentEnv(env);
                      cyberSound.playSuccess();
                      info("Switched Okta Environment", `Active tenant changed to ${env.name}`);
                    }}
                    onMouseEnter={() => cyberSound.playHover()}
                    className={`w-full text-left px-3 py-2 rounded-[12px] flex items-center justify-between text-xs transition-colors ${
                      currentEnv.name === env.name
                        ? "bg-[#D4E84A] text-[#0E0E0E] font-bold shadow-xs"
                        : "text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="truncate">{env.name}</div>
                      <div
                        className={`text-[10px] font-mono ${
                          currentEnv.name === env.name ? "text-neutral-800" : "text-neutral-500"
                        }`}
                      >
                        {env.region} · {env.latency}
                      </div>
                    </div>
                    {currentEnv.name === env.name && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/whatif"
            onMouseEnter={() => cyberSound.playHover()}
            onClick={() => cyberSound.playClick()}
            className="hidden sm:flex items-center gap-2 bg-[#141414] hover:bg-white hover:text-[#0E0E0E] border border-white/30 hover:border-white px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-all duration-200 shadow-xs group btn-interactive"
          >
            <div className="w-4 h-4 rounded-full bg-white text-[#0E0E0E] group-hover:bg-[#0E0E0E] group-hover:text-white flex items-center justify-center transition-colors">
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span>Simulate</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              cyberSound.playClick();
            }}
            className="xl:hidden w-8 h-8 rounded-full bg-[#1b1b1b] border border-white/20 flex items-center justify-center text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-[70px] bg-black/60 backdrop-blur-md z-50 xl:hidden p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto touch-scroll"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="bg-[#141416] border border-white/15 rounded-[24px] p-4 sm:p-5 shadow-2xl flex flex-col gap-2 max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-2">
                <span className="text-[10px] font-mono uppercase text-[#8E8E86] tracking-wider font-bold">
                  Navigation Menu
                </span>
                <span className="text-[10px] font-mono text-[#D4E84A]">9 SECTIONS</span>
              </div>

              {/* Navigation Links Grid (2-cols on mobile for faster navigation without excessive scrolling) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 py-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        cyberSound.playClick();
                      }}
                      onMouseEnter={() => cyberSound.playHover()}
                      className={`px-3 py-2.5 rounded-[14px] text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                        isActive
                          ? "bg-[#D4E84A] text-[#0E0E0E] font-bold shadow-md"
                          : "bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Environment Switcher for Mobile */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#8E8E86] tracking-wider font-bold block px-2">
                  Target Okta Tenant
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {environments.map((env) => (
                    <button
                      key={env.name}
                      onClick={() => {
                        setCurrentEnv(env);
                        cyberSound.playSuccess();
                        info("Switched Okta Environment", `Active tenant changed to ${env.name}`);
                      }}
                      className={`px-3 py-2 rounded-[12px] text-left text-xs transition-colors flex items-center justify-between ${
                        currentEnv.name === env.name
                          ? "bg-[#D4E84A] text-[#0E0E0E] font-bold shadow-xs"
                          : "bg-white/5 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate text-[11px] font-semibold">{env.name}</div>
                        <div className="text-[9px] font-mono opacity-70">{env.latency}</div>
                      </div>
                      {currentEnv.name === env.name && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="pt-2 border-t border-white/10">
                <Link
                  to="/whatif"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    cyberSound.playClick();
                  }}
                  className="w-full py-2.5 rounded-full bg-[#D4E84A] text-[#0E0E0E] text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#c2d73b]"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  <span>LAUNCH WHAT-IF SIMULATOR</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
}
