import { randomUUID } from "node:crypto";
import { requireOwner, AdminError } from "@/lib/supabase/server";
import { sameOrigin, json, failure } from "@/lib/supabase/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const client = await requireOwner();
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 4 * 1024 * 1024
    )
      throw new AdminError("Choose a file under 4 MB.");
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "application/pdf": "pdf",
    };
    const ext = extensions[file.type];
    if (!ext)
      throw new AdminError("Supported files: JPEG, PNG, WebP, and PDF.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const valid =
      ext === "jpg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : ext === "png"
          ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
          : ext === "webp"
            ? new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
              new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
            : new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
    if (!valid) throw new AdminError("File contents do not match its type.");
    const path = `${randomUUID()}.${ext}`;
    const { error } = await client.storage
      .from("portfolio-assets")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (error)
      throw new AdminError(
        "Upload failed. Check Storage setup and available space.",
        503,
      );
    return json({ url: `/api/media/${path}` });
  } catch (e) {
    return failure(e);
  }
}
