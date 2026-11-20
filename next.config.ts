import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // Full-screen photos: AVIF at quality 75 is visually lossless and ~40% smaller than 90
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    // Optimized images are cached for 30 days. If you replace a photo, give it a new file name.
    minimumCacheTTL: 2592000,
  },
  partialPrefetching: true,
  // 3D models, panoramas and the Draco decoder rarely change: let browsers and CDNs keep them
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }];
    return [
      { source: "/models/:path*", headers: cache },
      { source: "/hdri/:path*", headers: cache },
      { source: "/draco/:path*", headers: cache },
      { source: "/media/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
