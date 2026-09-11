const IMMUTABLE_ASSET_CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable";

const OPTIMIZED_IMAGE_CACHE_TTL = 60 * 60 * 24 * 31;

const R2_ASSET_BASE_URL = String(
  process.env.NEXT_PUBLIC_R2_ASSET_BASE_URL || "",
)
  .trim()
  .replace(/\/+$/, "");

function createR2RemotePatterns() {
  if (!R2_ASSET_BASE_URL) {
    return [];
  }

  try {
    const url = new URL(R2_ASSET_BASE_URL);
    const basePath = url.pathname.replace(/\/+$/, "");

    return [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port,
        pathname: `${basePath}/**`,
      },
    ];
  } catch {
    return [];
  }
}

function createImmutableCacheHeaders() {
  return [
    {
      key: "Cache-Control",
      value: IMMUTABLE_ASSET_CACHE_CONTROL,
    },
  ];
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
  },

  images: {
    minimumCacheTTL: OPTIMIZED_IMAGE_CACHE_TTL,

    formats: ["image/webp"],

    qualities: [75],

    remotePatterns: createR2RemotePatterns(),
  },

  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: createImmutableCacheHeaders(),
      },
      {
        source: "/img/:path*",
        headers: createImmutableCacheHeaders(),
      },
      {
        source: "/sertifikat/:path*",
        headers: createImmutableCacheHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
