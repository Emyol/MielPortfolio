import { getDraft } from "@/lib/content/repository";
import { validateContent } from "@/lib/content/model";
import { requireOwner, AdminError } from "@/lib/supabase/server";
import { sameOrigin, readBody, json, failure } from "@/lib/supabase/http";

export async function GET() {
  try {
    return json(await getDraft());
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const client = await requireOwner();
    const { content, revision } = await readBody(request);
    if (!Number.isSafeInteger(revision) || revision < 0)
      throw new AdminError("Invalid revision.");
    let validated;
    try {
      validated = validateContent(content);
    } catch (e) {
      throw new AdminError(e instanceof Error ? e.message : "Invalid content.");
    }
    const { data, error } = await client.rpc("save_portfolio_draft", {
      new_content: validated,
      expected_revision: revision,
    });
    if (error)
      throw new AdminError(
        error.message.includes("revision_conflict")
          ? "Another tab saved changes. Reload before editing."
          : "Unable to save the draft.",
        error.message.includes("revision_conflict") ? 409 : 500,
      );
    return json({ revision: data });
  } catch (e) {
    return failure(e);
  }
}
