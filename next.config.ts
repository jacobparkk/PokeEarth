import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships modern ESM; transpiling keeps older browsers + Turbopack happy.
  transpilePackages: ["three"],
  async headers() {
    return [
      {
        // Long-lived caching for heavy static assets (music, ambience, .glb models).
        source: "/:dir(audio|models)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
