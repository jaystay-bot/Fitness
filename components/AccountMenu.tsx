"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const CLERK_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function AccountMenu() {
  if (!CLERK_ENABLED) return null;
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Link
          href="/sign-in"
          className="font-mono text-[11px] uppercase tracking-wider text-paper/70 hover:text-lime"
        >
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/account"
          className="font-mono text-[11px] uppercase tracking-wider text-paper/70 hover:text-lime"
        >
          Account
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#2563EB",
              colorText: "#0F1B2D",
              colorBackground: "#FFFFFF",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
