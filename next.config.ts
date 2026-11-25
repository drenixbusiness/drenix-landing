import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // Full-screen photos: AVIF at quality 75 is visually lossless and ~40% smaller than 90
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1680, 1920, 2560],
    // Optimized images are cached for 30 days. If you replace a photo, give it a new file name.
    minimumCacheTTL: 2592000,
  },
  partialPrefetching: true,
  experimental: {
    // The stylesheet is small: sent inside the page, the first paint does not wait for a second request
    inlineCss: true,
  },
  // Public source maps: lets Lighthouse/DevTools attribute JS cost (they are only fetched by devtools)
  productionBrowserSourceMaps: true,
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
    resolveAlias: {
      // Next adds fallbacks for features every supported browser has had since 2022. Ours keeps the one that is still needed.
      "../build/polyfills/polyfill-module": "./src/lib/polyfills.js",
    },
    rules: {
      // The number is part of the build cache key: raise it after editing the script
      "react-dom-client.production.js": { loaders: [{ loader: "./scripts/trim-react-dom.cjs", options: { edition: 3 } }] },
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
