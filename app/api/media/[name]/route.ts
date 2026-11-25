import { publicClient, serverClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  // Only names shaped like the upload route's randomUUID() files are served, so
  // a crafted path can never reach any other object in the bucket.
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(name))
    return new Response("Not found", { status: 404 });
  try {
    const anonymous = publicClient();
    const { data: published } = await anonymous
      .from("published_assets")
      .select("name")
      .eq("name", name)
      .maybeSingle();
    // Published assets download anonymously; anything else (a draft upload)
    // uses the signed-in session, so storage RLS only lets the owner read it.
    const client = published ? anonymous : await serverClient();
    const { data, error } = await client.storage
      .from("portfolio-assets")
      .download(name);
    if (error || !data)
      return new Response("Not found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    return new Response(data, {
      headers: {
        "Content-Type": data.type,
        // Uploaded files are untrusted: no MIME sniffing, and the sandboxed CSP
        // stops a served PDF or image from running script on this origin.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        // Never cached: a draft asset must not linger in a shared cache, and an
        // unpublished file should stop loading as soon as it leaves the list.
        "Cache-Control": "private, no-store",
        ...(name.endsWith(".pdf")
          ? {
              "Content-Disposition":
                'inline; filename="portfolio-document.pdf"',
            }
          : {}),
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
