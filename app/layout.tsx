import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink text-paper antialiased">
        {children}
      </body>
    </html>
  );
}
