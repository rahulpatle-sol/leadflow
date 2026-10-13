import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Minimal standalone server for the Alpine Docker image.
  output: "standalone",
  experimental: {
    agentFeedback: true,
    // Trim barrel imports so icon/date/toast libs don't bloat client chunks.
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "sonner",
      "@tanstack/react-query",
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
