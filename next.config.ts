import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    _TIMETRACK_DATABASE_ID: process.env._TIMETRACK_DATABASE_ID,
    _TIMETRACK_COLLECTION_ID: process.env._TIMETRACK_COLLECTION_ID,
    _APPWRITE_ENDPOINT: process.env._APPWRITE_ENDPOINT,
    _APPWRITE_PROJECT_ID: process.env._APPWRITE_PROJECT_ID
  },
};

export default nextConfig;
