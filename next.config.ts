import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  },
};

export default nextConfig;
