import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s.gravatar.com",
        pathname: "/avatar/**",
      },
      {
        protocol: "https",
        hostname: "cdn.auth0.com",
        pathname: "/avatars/**",
      },
    ],
  },
};

export default nextConfig;
