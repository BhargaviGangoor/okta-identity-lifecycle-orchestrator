import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // All 8 Primary Lifecycle Navigation Items directly in Main Navbar
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

  return (
    <header
      className={`w-full flex items-center justify-between gap-4 px-3 sticky top-2 z-50 transition-all duration-300 ${
        scrolled
          ? "py-2 bg-[#141414]/90 backdrop-blur-md rounded-[24px] border border-white/10 shadow-xl"
          : "py-3 bg-transparent"
      }`}
    >
      {/* Left: TEAM ECHO logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-8 h-8 rounded-[10px] border border-white/20 bg-black flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-xs">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#D4E84A] shadow-[0_0_8px_#D4E84A] group-hover:shadow-[0_0_12px_#D4E84A] transition-shadow"></div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold tracking-tight text-white text-lg font-sans">TEAM ECHO</span>
          <span className="text-[10px] font-mono text-[#8E8E86] tracking-widest uppercase">/ IAM</span>
        </div>
      </Link>

      {/* Center: Editorial floating pill nav bar with all lifecycle modules */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#FAF8F5] text-[#0E0E0E] px-3.5 py-1.5 rounded-full shadow-lg border border-white/20">
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
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

      {/* Right: Environment dropdown + Simulate CTA + Mobile Menu Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 bg-[#141414] border border-white/20 hover:border-white/40 px-3.5 py-1.5 rounded-full text-xs text-white cursor-pointer transition-colors font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4E84A] animate-pulse"></span>
          <span className="text-[11px] font-mono">Okta Prod-US</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </div>

        <Link
          to="/whatif"
          className="hidden md:flex items-center gap-2 bg-[#141414] hover:bg-white hover:text-[#0E0E0E] border border-white/30 hover:border-white px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all duration-200 shadow-xs group"
        >
          <div className="w-4 h-4 rounded-full bg-white text-[#0E0E0E] group-hover:bg-[#0E0E0E] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-2.5 h-2.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span>Simulate Access</span>
        </Link>

        {/* Mobile menu hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-8 h-8 rounded-full bg-[#1b1b1b] border border-white/20 flex items-center justify-center text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/15 rounded-[24px] p-4 shadow-2xl flex flex-col gap-1.5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-[14px] text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#D4E84A] text-[#0E0E0E] font-bold"
                    : "text-neutral-300 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
