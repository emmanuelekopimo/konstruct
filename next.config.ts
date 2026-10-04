import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plan uploads go through a Server Action (8 MB file limit plus form overhead).
  experimental: {
    serverActions: { bodySizeLimit: "9mb" },
    proxyClientMaxBodySize: "10mb",
  },
  serverExternalPackages: ["@react-pdf/renderer", "pg"],
};

export default nextConfig;
