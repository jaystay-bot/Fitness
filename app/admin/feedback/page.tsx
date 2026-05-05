import { headers } from "next/headers";

import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Feedback · Admin",
};

interface SearchParams {
  password?: string;
}

interface FeedbackRow {
  id: string;
  message: string;
  user_email: string | null;
  page_url: string | null;
  user_agent: string | null;
  submitted_at: string;
}

function NotAuthorized() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12 flex flex-col gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clinical">
          Admin
        </span>
        <h1 className="font-serif text-3xl tracking-tight">Not authorized.</h1>
        <p className="text-sm text-paper/70">
          Append <code className="font-mono">?password=…</code> to the URL with
          a value matching <code className="font-mono">ADMIN_PASSWORD</code>.
        </p>
      </section>
    </main>
  );
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const expected = process.env.ADMIN_PASSWORD;
  const queryPassword = searchParams.password;
  const headerPassword = headers().get("x-admin-password");
  const provided = queryPassword ?? headerPassword ?? "";

  if (!expected || !provided || provided !== expected) {
    return <NotAuthorized />;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <section className="max-w-xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12 flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clinical">
            Admin
          </span>
          <h1 className="font-serif text-3xl tracking-tight">
            Supabase not configured.
          </h1>
          <p className="text-sm text-paper/70">
            Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="font-mono"> SUPABASE_SERVICE_ROLE_KEY</code> in
            the deployment environment.
          </p>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("feedback_submissions")
    .select("id, message, user_email, page_url, user_agent, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <section className="max-w-xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12 flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clinical">
            Admin
          </span>
          <h1 className="font-serif text-3xl tracking-tight">Query failed.</h1>
          <p className="text-sm text-paper/70 font-mono">{error.message}</p>
        </section>
      </main>
    );
  }

  const rows = (data ?? []) as FeedbackRow[];

  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-12 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Admin · Feedback
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
            {rows.length} {rows.length === 1 ? "submission" : "submissions"}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
            Reverse chronological order. Latest 500 entries.
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="text-sm text-paper/70">No feedback yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-2"
              >
                <p className="text-sm sm:text-base text-paper/90 leading-snug whitespace-pre-wrap">
                  {row.message}
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] font-mono uppercase tracking-wider text-paper/60">
                  <dt>When</dt>
                  <dd>{new Date(row.submitted_at).toLocaleString()}</dd>
                  {row.user_email ? (
                    <>
                      <dt>Email</dt>
                      <dd className="text-paper/85 normal-case tracking-normal font-sans">
                        {row.user_email}
                      </dd>
                    </>
                  ) : null}
                  {row.page_url ? (
                    <>
                      <dt>Page</dt>
                      <dd className="text-paper/70 break-all">{row.page_url}</dd>
                    </>
                  ) : null}
                  {row.user_agent ? (
                    <>
                      <dt>Agent</dt>
                      <dd className="text-paper/50 normal-case tracking-normal font-sans break-all">
                        {row.user_agent}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
