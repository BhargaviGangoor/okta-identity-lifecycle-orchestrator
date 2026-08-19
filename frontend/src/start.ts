import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

/** Minimal IAM-branded 500 error page for the server middleware. */
function renderErrorPage(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>500 | Northwind IAM</title><style>body{background:#141414;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.c{text-align:center}h1{font-size:3.5rem;color:#D4E84A;font-weight:800}p{color:#8A8A82;margin-top:.5rem}a{display:inline-block;margin-top:1.25rem;background:#D4E84A;color:#141414;padding:.4rem 1.25rem;border-radius:9999px;font-weight:700;text-decoration:none}</style></head><body><div class="c"><h1>500</h1><p>Server error — please try again.</p><a href="/">Home</a></div></body></html>`;
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});


// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
