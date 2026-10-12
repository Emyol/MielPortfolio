import { requireOwner, AdminError } from "@/lib/supabase/server";
import { sameOrigin, readBody, json, failure } from "@/lib/supabase/http";
import { revalidatePath, revalidateTag } from "next/cache";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const client = await requireOwner();
    const { revision } = await readBody(request);
    if (!Number.isSafeInteger(revision) || revision < 1)
      throw new AdminError("Save your draft before publishing.");
    const { error } = await client.rpc("publish_portfolio", {
      expected_revision: revision,
    });
    if (error)
      throw new AdminError(
        error.message.includes("revision_conflict")
          ? "Draft changed. Reload before publishing."
          : "Unable to publish. Check that uploaded files still exist.",
        error.message.includes("revision_conflict") ? 409 : 500,
      );
    revalidateTag("portfolio-content", { expire: 0 });
    revalidatePath("/");
    return json({ published: true, revision });
  } catch (e) {
    return failure(e);
  }
}
