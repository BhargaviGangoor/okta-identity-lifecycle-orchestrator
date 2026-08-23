import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/Toast";
import { LivingMeshBackground } from "../components/LivingMeshBackground";
import { CyberSpinWheelNav } from "../components/CyberSpinWheelNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414] text-white px-4">
      <div className="max-w-md text-center bg-[#1b1b1b] p-8 rounded-[32px] border border-white/10 shadow-2xl">
        <h1 className="text-7xl font-extrabold text-[#D4E84A] font-mono">404</h1>
        <h2 className="mt-4 text-xl font-bold text-white">Route Not Found</h2>
        <p className="mt-2 text-xs text-neutral-400 font-sans leading-relaxed">
          The requested IAM console route does not exist or has been relocated in the policy matrix.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#D4E84A] px-5 py-2.5 text-xs font-mono font-bold text-[#0E0E0E] transition-all hover:bg-[#c2d73b] active:scale-95 shadow-md btn-interactive"
          >
            RETURN TO OVERVIEW
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414] text-white px-4">
      <div className="max-w-md text-center bg-[#1b1b1b] p-8 rounded-[32px] border border-white/10 shadow-2xl">
        <h1 className="text-xl font-bold tracking-tight text-white">
          System Exception Detected
        </h1>
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-mono">
          {error?.message || "An unexpected error occurred during execution."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#D4E84A] px-5 py-2 text-xs font-mono font-bold text-[#0E0E0E] transition-colors hover:bg-[#c2d73b] btn-interactive"
          >
            RETRY PIPELINE
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-mono font-medium text-white transition-colors hover:bg-white/10 btn-interactive"
          >
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TEAM ECHO IAM — Identity Governance for Okta" },
      { name: "description", content: "TEAM ECHO: Authoritative identity governance for Okta. Validate policy, simulate impact, execute safely, and reconcile continuously." },
      { name: "author", content: "TEAM ECHO" },
      { property: "og:title", content: "TEAM ECHO IAM — Identity Governance for Okta" },
      { property: "og:description", content: "Govern every identity change before it reaches Okta—validate policy, simulate impact, execute safely, and reconcile continuously." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {/* Full-bleed living canvas background */}
        <div className="min-h-screen bg-transparent p-2.5 sm:p-5 md:p-6 flex flex-col justify-start selection:bg-[#D4E84A] selection:text-[#0E0E0E] relative overflow-x-hidden">
          {/* Animated Living Identity Mesh Canvas */}
          <LivingMeshBackground />

          {/* Quick-Nav Right Arrow & Spinwheel Dock */}
          <CyberSpinWheelNav />

          {/* Main Content Area — airy translucent frosted glass frame allowing animated living mesh to shine through clearly */}
          <div className="w-full max-w-[1600px] mx-auto bg-[#0B0C10]/25 backdrop-blur-md text-white rounded-[28px] sm:rounded-[36px] p-3 sm:p-6 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-white/10 flex flex-col flex-1 min-h-[calc(100vh-2.5rem)] relative z-10">
            <Navbar />
            <main className="flex-1 w-full mt-4">
              <Outlet />
            </main>
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}
