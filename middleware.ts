import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const CLERK_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const isPublicRoute = createRouteMatcher([
  "/",
  "/r/:path*",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/recommend",
  "/api/og",
  "/api/email/result",
  "/api/labs/(.*)",
  "/api/webhooks/(.*)",
  "/api/checkout",
  "/api/subscription",
]);

const passthrough = (_req: NextRequest) => NextResponse.next();

const guarded = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

// When Clerk is not configured (e.g. local dev or non-commercial deploys),
// the middleware degrades to a passthrough so the free recommendation
// experience and shareable URL still work without auth secrets.
export default (CLERK_ENABLED ? guarded : passthrough);

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
