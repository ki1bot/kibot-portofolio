import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 1000;
const MAX_REQUEST_BODY_BYTES = 16 * 1024;

const rateLimitStore = globalThis.__portfolioCommentRateLimitStore || new Map();

globalThis.__portfolioCommentRateLimitStore = rateLimitStore;

function jsonError(message, status, headers = {}) {
  return NextResponse.json(
    {
      message,
    },
    {
      status,
      headers,
    },
  );
}

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "";
  }

  return request.headers.get("x-real-ip")?.trim() || "";
}

function checkRateLimit(ip) {
  if (!ip) {
    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  const now = Date.now();

  if (rateLimitStore.size > 500) {
    for (const [storedIp, data] of rateLimitStore.entries()) {
      if (data.resetAt <= now) {
        rateLimitStore.delete(storedIp);
      }
    }
  }

  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitStore.set(ip, current);

  return {
    allowed: true,
    retryAfter: 0,
  };
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonError("Format permintaan tidak didukung.", 415);
    }

    const contentLengthHeader = request.headers.get("content-length");

    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);

      if (
        Number.isFinite(contentLength) &&
        contentLength > MAX_REQUEST_BODY_BYTES
      ) {
        return jsonError("Data komentar terlalu besar.", 413);
      }
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("Data permintaan tidak valid.", 400);
    }

    const userName = String(body.userName || "")
      .replace(/\s+/g, " ")
      .trim();

    const content = String(body.content || "").trim();

    if (!userName || !content) {
      return jsonError("Nama dan komentar wajib diisi.", 400);
    }

    if (userName.length > MAX_NAME_LENGTH) {
      return jsonError(
        `Nama terlalu panjang. Maksimal ${MAX_NAME_LENGTH} karakter.`,
        400,
      );
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return jsonError(
        `Komentar terlalu panjang. Maksimal ${MAX_COMMENT_LENGTH} karakter.`,
        400,
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return jsonError(
        "Terlalu banyak komentar dikirim. Silakan coba lagi beberapa saat.",
        429,
        {
          "Retry-After": String(rateLimit.retryAfter),
        },
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      console.error("COMMENT_SUPABASE_NOT_CONFIGURED");

      return jsonError("Layanan komentar sedang tidak tersedia.", 500);
    }

    const { error } = await supabase.from("portfolio_comments").insert({
      user_name: userName,
      content,
    });

    if (error) {
      console.error("COMMENT_INSERT_ERROR:", error.message);

      return jsonError("Gagal mengirim komentar. Coba lagi nanti.", 500);
    }

    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Komentar berhasil dikirim.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("COMMENT_API_ERROR:", error);

    return jsonError("Gagal mengirim komentar. Coba lagi nanti.", 500);
  }
}
