import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [resolve("styles")],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.battlefieldmeta.gg" },
    ],
  },
};

export default nextConfig;
