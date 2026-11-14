import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // A production build must not replace modules used by a running dev runtime.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
