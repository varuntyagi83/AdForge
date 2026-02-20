import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/categories',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
