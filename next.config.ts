import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.vincentguanco.com",
      },
    ],
  },
};

export default nextConfig;
