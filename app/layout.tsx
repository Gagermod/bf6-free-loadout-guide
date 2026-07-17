import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";

const SITE_URL = "https://bf6loadout.gg";
const SITE_NAME = "BF6 Loadout Guide";

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
  description:
    "Free Battlefield 6 loadout builder. See the best attachments for every weapon at every rank. No account needed. Updated for Season 3.",
  keywords: [
    "battlefield 6",
    "bf6",
    "loadout",
    "best attachments",
    "weapon builds",
    "season 3",
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
    description:
      "Free Battlefield 6 loadout builder. See the best attachments for every weapon at every rank. No account needed. Updated for Season 3.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "BF6 Loadout Guide — Free weapon builds for Battlefield 6",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank",
    description:
      "Free Battlefield 6 loadout builder. See the best attachments for every weapon at every rank.",
    images: [`${SITE_URL}/og-image.png`],
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
      <head>
        <link rel="canonical" href={SITE_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}
