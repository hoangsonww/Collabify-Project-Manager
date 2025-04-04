import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["s.gravatar.com", "cdn.auth0.com"],
  },
  reactStrictMode: true,
};

export default nextConfig;
