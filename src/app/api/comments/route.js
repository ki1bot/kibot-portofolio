import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status) {
  return NextResponse.json(
    {
      message,
    },
    {
      status,
    },
  );
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonError("Format permintaan tidak didukung.", 415);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("Data permintaan tidak valid.", 400);
    }

    const userName = String(body.userName || "").trim();
    const content = String(body.content || "").trim();

    if (!userName || !content) {
      return jsonError("Nama dan komentar wajib diisi.", 400);
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
