import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "172.28.182.82", 
        "localhost:3000",
        "sport-dashboard-three.vercel.app" 
      ],
    },
  },
};

export default nextConfig;