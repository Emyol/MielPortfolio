import Link from "next/link";
import Portfolio from "@/components/Portfolio";
import { getDraft } from "@/lib/content/repository";
import { getAdminStatus } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const state = await getAdminStatus();
  if (state.status !== "ready") redirect("/admin");
  const { content } = await getDraft();
  return (
    <>
      <div className="admin-preview-notice">
        Private preview of your saved draft.{" "}
        <Link href="/admin">Back to editor</Link>
      </div>
      <Portfolio content={content} preview />
    </>
  );
}
