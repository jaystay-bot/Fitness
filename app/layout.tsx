import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, JetBrains_Mono } from "next/font/google";

import { FeedbackWidget } from "@/components/FeedbackWidget";
import "./globals.css";

const CLERK_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Apex Protocol — your supplement stack, written by the science",
  description:
    "Evidence-tier-aware supplement and nutrition recommendations from a deterministic, peer-reviewed-research-backed engine. No email gate. No fluff.",
  openGraph: {
    title: "Apex Protocol — your supplement stack, written by the science",
    description:
      "Evidence-tier-aware supplement and nutrition recommendations. No email gate.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Protocol",
    description:
      "Evidence-tier-aware supplement and nutrition recommendations.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink text-paper antialiased">
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );

  if (!CLERK_ENABLED) {
    return tree;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#D4FF3A",
          colorText: "#FAFAF7",
          colorBackground: "#0A0A0A",
        },
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
