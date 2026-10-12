import { zipSync, strToU8 } from "fflate";
import { requireOwner, AdminError } from "@/lib/supabase/server";
import { failure } from "@/lib/supabase/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const client = await requireOwner();
    const [draft, published] = await Promise.all([
      client.from("portfolio_draft").select("*").eq("id", 1).maybeSingle(),
      client.from("portfolio_published").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (draft.error || published.error)
      throw new AdminError("Cannot export records.", 503);
    const files: Record<string, Uint8Array> = {};
    let offset = 0,
      total = 0;
    while (true) {
      const { data, error } = await client.storage
        .from("portfolio-assets")
        .list("", {
          limit: 100,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
      if (error) throw new AdminError("Cannot list backup assets.", 503);
      for (const item of data || []) {
        total += Number(item.metadata?.size || 0);
        if (total > 64 * 1024 * 1024)
          throw new AdminError(
            "Assets exceed the 64 MB web export limit. Use the Storage backup instructions in docs/admin-setup.md.",
            413,
          );
        const result = await client.storage
          .from("portfolio-assets")
          .download(item.name);
        if (result.error || !result.data)
          throw new AdminError(
            "An asset could not be downloaded. Retry the backup.",
            503,
          );
        files[`assets/${item.name}`] = new Uint8Array(
          await result.data.arrayBuffer(),
        );
      }
      if (!data || data.length < 100) break;
      offset += 100;
    }
    files["content.json"] = strToU8(
      JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          draft: draft.data,
          published: published.data,
        },
        null,
        2,
      ),
    );
    files["README.txt"] = strToU8(
      "See docs/admin-setup.md in the portfolio repository for restoration. The assets folder contains Supabase uploads, including unused draft files. Original static assets stay in the Git repository. Owner identities, auth secrets and OAuth configuration are not exported.",
    );
    return new Response(new Uint8Array(zipSync(files, { level: 0 })).buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="portfolio-backup.zip"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
