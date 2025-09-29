import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Feature flag environment variables (fallbacks)
    NEXT_PUBLIC_FEATURE_ALERTS: process.env.NEXT_PUBLIC_FEATURE_ALERTS || 'false',
    NEXT_PUBLIC_FEATURE_CSV: process.env.NEXT_PUBLIC_FEATURE_CSV || 'false',
    NEXT_PUBLIC_FEATURE_CHANGES: process.env.NEXT_PUBLIC_FEATURE_CHANGES || 'false',
    NEXT_PUBLIC_FEATURE_ACTRADAR: process.env.NEXT_PUBLIC_FEATURE_ACTRADAR || 'false',
  },
};

export default nextConfig;
