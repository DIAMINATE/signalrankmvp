import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/signalrankmvp",
  images: { unoptimized: true },
};

export default nextConfig;
