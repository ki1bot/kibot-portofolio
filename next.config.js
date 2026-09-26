const REVALIDATED_ASSET_CACHE_CONTROL =
  "public, no-cache, max-age=0, must-revalidate";

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

function createRevalidatedAssetCacheHeaders() {
  return [
    {
      key: "Cache-Control",
      value: REVALIDATED_ASSET_CACHE_CONTROL,
    },
  ];
}

const nextConfig = {
  experimental: {
    inlineCss: true,
  },

  images: {
    unoptimized: true,
    formats: ["image/webp"],
    qualities: [75],
    remotePatterns: createRemoteImagePatterns(),
  },

  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: createRevalidatedAssetCacheHeaders(),
      },
      {
        source: "/img/:path*",
        headers: createRevalidatedAssetCacheHeaders(),
      },
      {
        source: "/sertifikat/:path*",
        headers: createRevalidatedAssetCacheHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
