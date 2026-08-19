import { describeError } from "./lib/error-utils";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

/** Minimal 500 error page rendered server-side (no React dependency). */
function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>500 — Server Error | Northwind IAM</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#141414;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
    .card{max-width:420px;text-align:center;space-y:1rem}
    h1{font-size:4rem;font-weight:800;color:#D4E84A}
    h2{font-size:1.25rem;margin-top:1rem;color:#fff}
    p{color:#8A8A82;font-size:.875rem;margin-top:.75rem;line-height:1.6}
    a{display:inline-flex;margin-top:1.5rem;background:#D4E84A;color:#141414;padding:.5rem 1.5rem;border-radius:9999px;font-weight:700;text-decoration:none;font-size:.875rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>500</h1>
    <h2>Internal Server Error</h2>
    <p>Something went wrong on our end. The error has been logged. Try refreshing or head back home.</p>
    <a href="/">Go home</a>
  </div>
</body>
</html>`;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(describeError(new Error(`h3 swallowed SSR error: ${body}`)));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
