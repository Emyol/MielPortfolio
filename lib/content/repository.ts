import "server-only";
import { unstable_cache } from "next/cache";
import { seedContent, validateContent, type PortfolioContent } from "./model";
import {
  AdminError,
  publicClient,
  requireOwner,
  supabaseConfig,
} from "@/lib/supabase/server";

const readPublished = unstable_cache(
  async (): Promise<PortfolioContent> => {
    const { data, error } = await publicClient()
      .from("portfolio_published")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error("Published content is unavailable.");
    if (!data) return seedContent;
    return validateContent(data.content);
  },
  ["portfolio-published-v1"],
  { revalidate: 3600, tags: ["portfolio-content"] },
);

export async function getPublishedContent(): Promise<PortfolioContent> {
  if (!supabaseConfig()) return seedContent;
  // On a warm cache Next retains the previous successful value after refresh failures.
  // A cold start cannot recover database content; keep the original portfolio available.
  try {
    return await readPublished();
  } catch {
    return seedContent;
  }
}
export async function getDraft(): Promise<{
  content: PortfolioContent;
  revision: number;
}> {
  const client = await requireOwner();
  const { data, error } = await client
    .from("portfolio_draft")
    .select("content,revision")
    .eq("id", 1)
    .maybeSingle();
  if (error)
    throw new AdminError(
      "Unable to load the draft. Check database setup.",
      503,
    );
  return data
    ? { content: data.content as PortfolioContent, revision: data.revision }
    : { content: seedContent, revision: 0 };
}
