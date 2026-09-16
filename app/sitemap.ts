import { MetadataRoute } from "next";
import weaponsMeta from "../data/_weapons-meta.json";
import siteMeta from "../data/_site-meta.json";

type WeaponMeta = Record<string, { displayName: string; type: string; image?: string }>;
const meta = weaponsMeta as WeaponMeta;
const SITE_URL = "https://bf6-free-loadout-guide.vercel.app";

const TYPE_SLUGS = [
  "assault-rifle",
  "smg",
  "lmg",
  "dmr",
  "sniper-rifle",
  "shotgun",
  "carbine",
  "secondary",
];

function parseDate(s: string): Date {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = parseDate(siteMeta.updatedAt);

  const weaponEntries: MetadataRoute.Sitemap = Object.keys(meta).map((slug) => ({
    url: `${SITE_URL}/weapon/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const typeEntries: MetadataRoute.Sitemap = TYPE_SLUGS.map((type) => ({
    url: `${SITE_URL}/type/${type}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...typeEntries,
    ...weaponEntries,
  ];
}