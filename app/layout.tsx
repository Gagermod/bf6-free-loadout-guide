import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import siteMeta from "../data/_site-meta.json";
import "./globals.scss";

const SITE_URL = "https://bf6-free-loadout-guide.vercel.app";
const SITE_NAME = "BF6 Loadout Guide";

const description = `Free Battlefield 6 loadout builder. See the best attachments for every weapon at every rank. No account needed. Updated for ${siteMeta.season}.`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank",
    template: "%s | BF6 Loadout Guide",
  },
  description,
  keywords: [
    "battlefield 6",
    "bf6",
    "loadout",
    "best attachments",
    "weapon builds",
    siteMeta.season.toLowerCase(),
    "meta",
    "ranked",
    "battle royale",
    "multiplayer",
    "guide",
    "free",
    "no account",
    "bf6 meta",
    "weapon tier list",
  ],
  authors: [{ name: "BF6 Loadout Guide" }],
  creator: "BF6 Loadout Guide",
  publisher: "BF6 Loadout Guide",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
