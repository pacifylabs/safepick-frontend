import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "SafePick — Verified school pickup for every parent",
  description:
    "SafePick verifies every school pickup in real-time with multi-step identity checks, instant parent notifications, and a full audit trail."
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} scroll-smooth`}>
      <body className="font-body antialiased bg-off-white text-navy">
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}
