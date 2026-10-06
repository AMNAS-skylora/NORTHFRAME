import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/services/branding",
        destination: "/services/brand-identity",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;


