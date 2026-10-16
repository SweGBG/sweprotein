import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // CRiNTRO: the film frames never change under the same name (new versions get a new folder),
  // so phones can keep them for a year and return visits load instantly.
  async headers() {
    return [
      { source: "/video/m2/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/video/:file(.*\\.(?:mp4|jpg))", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
