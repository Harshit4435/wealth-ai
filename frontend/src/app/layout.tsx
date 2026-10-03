import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wealth AI — Autonomous Personal Financial Intelligence & Copilot",
  description: "Autonomous personal finance platform with continuous ML categorization, spending forecasting, 5-pillar financial health profiling, and deterministic AI Copilot.",
  keywords: ["personal finance", "AI copilot", "machine learning", "spending forecast", "financial health", "wealth intelligence"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100">{children}</body>
    </html>
  );
}
