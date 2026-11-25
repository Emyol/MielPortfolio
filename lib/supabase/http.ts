import { AdminError } from "./server";

// CSRF guard for the admin's state-changing routes (save, publish, upload,
// logout): they run on the owner's session cookie, so a request from another
// site must be refused even though the browser would attach that cookie.
export function sameOrigin(request: Request) {
  const url = new URL(request.url);
  const expected =
    process.env.SITE_URL ||
    `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (request.headers.get("origin") !== new URL(expected).origin)
    throw new AdminError("Request origin is not allowed.", 403);
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
// AdminError messages are written for the owner and safe to show; any other
// error only reaches the server log, so internals never leak to the client.
export function failure(error: unknown) {
  console.error(
    "[admin]",
    error instanceof Error ? error.message : "Unknown failure",
  );
  return json(
    {
      error:
        error instanceof AdminError
          ? error.message
          : "The operation failed. Please try again.",
    },
    error instanceof AdminError ? error.status : 500,
  );
}
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AdminError("Expected JSON.", 415);
  const text = await request.text();
  // Mirrors the 1,000,000 cap save_portfolio_draft enforces in the database,
  // so an oversized draft fails here before a round trip to Supabase.
  if (text.length > 1000000) throw new AdminError("Content is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new AdminError("Invalid JSON.");
  }
}
