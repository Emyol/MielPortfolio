import { publicClient, serverClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(name))
    return new Response("Not found", { status: 404 });
  try {
    const anonymous = publicClient();
    const { data: published } = await anonymous
      .from("published_assets")
      .select("name")
      .eq("name", name)
      .maybeSingle();
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
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
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
