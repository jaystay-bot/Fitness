import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account · Apex Protocol",
};

export default async function AccountPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in?redirect_url=/account");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const supabase = getSupabaseAdmin();
  let tier: "free" | "pro" = "free";
  let status: string | null = null;
  let currentPeriodEnd: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("subscriptions")
      .select("tier, status, current_period_end")
      .eq("clerk_user_id", userId)
      .maybeSingle();
    if (data) {
      tier = (data.tier as "free" | "pro") ?? "free";
      status = data.status ?? null;
      currentPeriodEnd = data.current_period_end ?? null;
    }
  }

  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-12 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">
            Your protocol home
          </h1>
        </header>

        <dl className="border border-paper/15 rounded-lg p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/60 self-center">
            Email
          </dt>
          <dd className="text-paper/90 self-center">{email}</dd>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/60 self-center">
            Tier
          </dt>
          <dd className="text-paper/90 self-center font-mono uppercase tracking-wider">
            {tier}
          </dd>
          {status ? (
            <>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/60 self-center">
                Status
              </dt>
              <dd className="text-paper/90 self-center">{status}</dd>
            </>
          ) : null}
          {currentPeriodEnd ? (
            <>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/60 self-center">
                Renews
              </dt>
              <dd className="text-paper/90 self-center">
                {new Date(currentPeriodEnd).toLocaleDateString()}
              </dd>
            </>
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95"
          >
            New recommendation
          </Link>
          {tier === "free" ? (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-4 py-3 hover:border-lime"
            >
              Upgrade to Pro
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
