import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [resolve("styles")],
  },
};

export default nextConfig;
