import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Feature flag environment variables (fallbacks)
    NEXT_PUBLIC_FEATURE_ALERTS: process.env.NEXT_PUBLIC_FEATURE_ALERTS || 'true',
    NEXT_PUBLIC_FEATURE_CSV: process.env.NEXT_PUBLIC_FEATURE_CSV || 'true',
    NEXT_PUBLIC_FEATURE_CHANGES: process.env.NEXT_PUBLIC_FEATURE_CHANGES || 'false',
    NEXT_PUBLIC_FEATURE_ACTRADAR: process.env.NEXT_PUBLIC_FEATURE_ACTRADAR || 'true',
  },
  async redirects() {
    // Only add redirects if KILL_ACTRADAR is set
    if (process.env.KILL_ACTRADAR === 'true') {
      return [
        { source: '/ai-act', destination: '/who-funds', permanent: false },
        { source: '/ai-act/:path*', destination: '/who-funds', permanent: false },
      ];
    }
    return [];
  },
};

export default nextConfig;
