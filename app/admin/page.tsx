import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { getAdminStatus } from "@/lib/supabase/server";
import { getDraft } from "@/lib/content/repository";
import AdminEditor from "./AdminEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const state = await getAdminStatus();
  if (state.status === "ready") {
    try {
      const draft = await getDraft();
      return (
        <AdminEditor
          initialContent={draft.content}
          initialRevision={draft.revision}
        />
      );
    } catch {
      return <EntryScreen status="error" />;
    }
  }
  return <EntryScreen status={state.status} />;
}

function EntryScreen({ status }: { status: string }) {
  const setup = status === "setup";
  const signedOut = status === "signed-out";
  return (
    <main className="admin-shell admin-entry">
      <header className="admin-topbar">
        <Link href="/" className="admin-brand">
          Miel<span> / editor</span>
        </Link>
        <Link href="/">
          View portfolio <ArrowUpRight size={16} />
        </Link>
      </header>
      <div className="admin-entry-content">
        <LockKeyhole size={28} strokeWidth={1.5} aria-hidden="true" />
        <h1>
          {setup
            ? "Your portfolio, in your hands."
            : signedOut
              ? "Welcome back."
              : status === "forbidden"
                ? "This account cannot edit the portfolio."
                : "The editor could not connect."}
        </h1>
        <p className="admin-lede">
          {setup
            ? "Connect Supabase once, then manage every section here. Your public portfolio continues to work while you set up."
            : signedOut
              ? "Sign in to update your work, experience, credentials, and everything in between."
              : status === "forbidden"
                ? "Sign in with the GitHub account registered as this portfolio’s owner."
                : "Check that your Supabase project is active and its database migration has been applied, then reload this page. Your local edits should be exported before closing an open editing session."}
        </p>
        {setup ? (
          <>
            <ol className="admin-setup-steps">
              <li>
                <strong>Create a free Supabase project</strong>
                <p>
                  Keep the project on the Free plan. Copy its project URL and
                  publishable key into the environment variables listed in{" "}
                  <code>.env.example</code>.
                </p>
              </li>
              <li>
                <strong>Apply the database migration</strong>
                <p>
                  The setup guide includes the SQL file to run, GitHub sign-in
                  configuration, and the step that grants editing access only to
                  your account.
                </p>
              </li>
              <li>
                <strong>Connect and publish</strong>
                <p>
                  Add the same environment variables to Vercel and redeploy.
                  Sign in here to review the imported portfolio and publish your
                  first update.
                </p>
              </li>
            </ol>
            <p className="admin-note">
              Full walkthrough: <code>docs/admin-setup.md</code> in your
              repository. No database password or privileged key belongs in the
              browser.
            </p>
            <a
              className="admin-button admin-primary"
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Supabase <ArrowUpRight size={16} />
            </a>
          </>
        ) : signedOut ? (
          <a className="admin-button admin-primary" href="/auth/login">
            Continue with GitHub <ArrowUpRight size={16} />
          </a>
        ) : (
          <div className="admin-actions">
            <a className="admin-button" href="/admin">
              Try again
            </a>
            <form action="/auth/logout" method="post">
              <button className="admin-button">Sign out</button>
            </form>
          </div>
        )}
      </div>
      <footer className="admin-entry-footer">
        Draft privately. Publish when you’re ready.
      </footer>
    </main>
  );
}
