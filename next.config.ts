import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" bundles only production dependencies — ideal for cPanel upload.
  // Remove this line if you want to use the default Next.js output.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/webp"],
  },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

export default nextConfig;
