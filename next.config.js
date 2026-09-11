const IMMUTABLE_ASSET_CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable";

const OPTIMIZED_IMAGE_CACHE_TTL = 60 * 60 * 24 * 31;

const R2_ASSET_BASE_URL = String(
  process.env.NEXT_PUBLIC_R2_ASSET_BASE_URL || "",
)
  .trim()
  .replace(/\/+$/, "");

const DEFAULT_REMOTE_IMAGE_PATTERNS = [
  {
    protocol: "https",
    hostname: "assets.rifqii.com",
    pathname: "/**",
  },
];

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

function createRemoteImagePatterns() {
  const patterns = [
    ...DEFAULT_REMOTE_IMAGE_PATTERNS,
    ...createR2RemotePatterns(),
  ];

  const uniquePatterns = new Map();

  patterns.forEach((pattern) => {
    const key = [
      pattern.protocol,
      pattern.hostname,
      pattern.port || "",
      pattern.pathname || "",
    ].join("|");

    uniquePatterns.set(key, pattern);
  });

  return Array.from(uniquePatterns.values());
}

function createImmutableCacheHeaders() {
  return [
    {
      key: "Cache-Control",
      value: IMMUTABLE_ASSET_CACHE_CONTROL,
    },
  ];
}

const nextConfig = {
  experimental: {
    inlineCss: true,
  },

  images: {
    minimumCacheTTL: OPTIMIZED_IMAGE_CACHE_TTL,
    formats: ["image/webp"],
    qualities: [75],
    remotePatterns: createRemoteImagePatterns(),
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
