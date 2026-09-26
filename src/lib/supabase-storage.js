const R2_ASSET_BASE_URL = String(
  process.env.NEXT_PUBLIC_R2_ASSET_BASE_URL || "",
)
  .trim()
  .replace(/\/+$/, "");

const R2_ASSET_VERSION = String(
  process.env.NEXT_PUBLIC_R2_ASSET_VERSION || "20260927",
).trim();

const R2_DIRECTORIES = new Set(["assets", "image", "projects", "sertifikat"]);

function cleanAssetPath(value) {
  return String(value || "").trim();
}

function stripLeadingSlash(value) {
  return cleanAssetPath(value).replace(/^\/+/, "");
}

function splitPathSuffix(value) {
  const cleanValue = cleanAssetPath(value);
  const separatorIndex = cleanValue.search(/[?#]/);

  if (separatorIndex === -1) {
    return {
      pathname: cleanValue,
      suffix: "",
    };
  }

  return {
    pathname: cleanValue.slice(0, separatorIndex),
    suffix: cleanValue.slice(separatorIndex),
  };
}

function getStoragePathFromSupabaseUrl(value) {
  try {
    const url = new URL(value);
    const markers = [
      "/storage/v1/object/public/portofolio-assets/",
      "/storage/v1/object/sign/portofolio-assets/",
      "/storage/v1/render/image/public/portofolio-assets/",
      "/storage/v1/render/image/authenticated/portofolio-assets/",
    ];

    for (const marker of markers) {
      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        return decodeURIComponent(
          url.pathname.slice(markerIndex + marker.length),
        );
      }
    }

    return "";
  } catch {
    return "";
  }
}

function normalizeAssetKey(value) {
  let cleanPath = stripLeadingSlash(value);

  if (!cleanPath) {
    return "";
  }

  const rootAliases = [
    ["public/img/", ""],
    ["img/", ""],
    ["portofolio-assets/", ""],
    ["public/assets/sertifikat/", "sertifikat/"],
    ["public/assets/media/", "media/"],
    ["public/assets/projects/", "projects/"],
    ["public/assets/screen/", "screen/"],
    ["public/assets/techstack/", "techstack/"],
    ["public/assets/", "assets/"],
    ["public/sertifikat/", "sertifikat/"],
  ];

  for (const [sourcePrefix, targetPrefix] of rootAliases) {
    if (cleanPath.startsWith(sourcePrefix)) {
      cleanPath = `${targetPrefix}${cleanPath.slice(sourcePrefix.length)}`;
      break;
    }
  }

  const pathAliases = [
    ["assets/sertifikat/", "sertifikat/"],
    ["assets/media/", "media/"],
    ["assets/projects/", "projects/"],
    ["assets/screen/", "screen/"],
    ["assets/techstack/", "techstack/"],
  ];

  for (const [sourcePrefix, targetPrefix] of pathAliases) {
    if (cleanPath.startsWith(sourcePrefix)) {
      return `${targetPrefix}${cleanPath.slice(sourcePrefix.length)}`;
    }
  }

  return cleanPath;
}

function getAssetDirectory(path) {
  return path.split("/")[0] || "";
}

function buildLocalAssetUrl(path) {
  return `/img/${path}`;
}

function buildR2AssetUrl(path) {
  if (!R2_ASSET_BASE_URL) {
    return "";
  }

  return `${R2_ASSET_BASE_URL}/${path}`;
}

function isR2AssetUrl(value) {
  const cleanValue = cleanAssetPath(value);

  if (!cleanValue || !R2_ASSET_BASE_URL) {
    return false;
  }

  try {
    const assetUrl = new URL(cleanValue);
    const baseUrl = new URL(R2_ASSET_BASE_URL);

    if (assetUrl.origin !== baseUrl.origin) {
      return false;
    }

    const basePath = baseUrl.pathname.replace(/\/+$/, "");

    if (!basePath) {
      return true;
    }

    return (
      assetUrl.pathname === basePath ||
      assetUrl.pathname.startsWith(`${basePath}/`)
    );
  } catch {
    return false;
  }
}

function addR2AssetVersion(value) {
  const cleanValue = cleanAssetPath(value);

  if (!cleanValue || !R2_ASSET_VERSION || !isR2AssetUrl(cleanValue)) {
    return cleanValue;
  }

  try {
    const url = new URL(cleanValue);

    url.searchParams.set("v", R2_ASSET_VERSION);

    return url.toString();
  } catch {
    return cleanValue;
  }
}

export function assetUrl(path) {
  const cleanPath = cleanAssetPath(path);

  if (!cleanPath) {
    return "";
  }

  if (/^(data:|blob:)/i.test(cleanPath)) {
    return cleanPath;
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    const supabaseStoragePath = getStoragePathFromSupabaseUrl(cleanPath);

    if (supabaseStoragePath) {
      return assetUrl(supabaseStoragePath);
    }

    if (isR2AssetUrl(cleanPath)) {
      return addR2AssetVersion(cleanPath);
    }

    return cleanPath;
  }

  const { pathname, suffix } = splitPathSuffix(cleanPath);
  const normalizedPath = normalizeAssetKey(pathname);

  if (!normalizedPath) {
    return "";
  }

  const directory = getAssetDirectory(normalizedPath);

  if (R2_DIRECTORIES.has(directory)) {
    const r2Url = buildR2AssetUrl(normalizedPath);

    if (r2Url) {
      return addR2AssetVersion(`${r2Url}${suffix}`);
    }
  }

  return `${buildLocalAssetUrl(normalizedPath)}${suffix}`;
}

export function resolveAssetUrl(value) {
  return assetUrl(value);
}

export function createPdfUrlFromImageUrl(value) {
  const resolvedImageUrl = resolveAssetUrl(value);

  if (!resolvedImageUrl) {
    return "";
  }

  return resolvedImageUrl.replace(
    /\.(png|jpg|jpeg|webp|avif)(?=([?#]|$))/i,
    ".pdf",
  );
}
