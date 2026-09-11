const R2_ASSET_BASE_URL = String(
  process.env.NEXT_PUBLIC_R2_ASSET_BASE_URL || "",
)
  .trim()
  .replace(/\/+$/, "");

function isR2AssetUrl(imageUrl) {
  const normalizedUrl = String(imageUrl || "").trim();

  if (!normalizedUrl || !R2_ASSET_BASE_URL) {
    return false;
  }

  try {
    const image = new URL(normalizedUrl);
    const base = new URL(R2_ASSET_BASE_URL);

    if (image.origin !== base.origin) {
      return false;
    }

    const basePath = base.pathname.replace(/\/+$/, "");

    if (!basePath) {
      return true;
    }

    return (
      image.pathname === basePath || image.pathname.startsWith(`${basePath}/`)
    );
  } catch {
    return false;
  }
}

export function canUseNextImage(imageUrl) {
  const normalizedUrl = String(imageUrl || "").trim();

  if (!normalizedUrl) {
    return false;
  }

  if (/^(data:|blob:)/i.test(normalizedUrl)) {
    return false;
  }

  if (/\.(?:gif|svg)(?:[?#]|$)/i.test(normalizedUrl)) {
    return false;
  }

  if (normalizedUrl.startsWith("/")) {
    return true;
  }

  return isR2AssetUrl(normalizedUrl);
}

export function shouldBypassNextImageOptimization(imageUrl) {
  const normalizedUrl = String(imageUrl || "").trim();

  if (!normalizedUrl) {
    return false;
  }

  if (/\.(?:gif|svg)(?:[?#]|$)/i.test(normalizedUrl)) {
    return true;
  }

  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  if (!/^https?:\/\//i.test(normalizedUrl)) {
    return false;
  }

  return isR2AssetUrl(normalizedUrl);
}
