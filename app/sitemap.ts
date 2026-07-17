import { MetadataRoute } from "next";

const SITE_URL = "https://bf6loadout.gg";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = [
    "",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  return staticPages;
}
