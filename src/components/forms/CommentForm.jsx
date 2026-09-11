"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  MessageSquare,
  Send,
  User,
  X,
} from "lucide-react";

const NOTIFICATION_DURATION = 4000;
const NOTIFICATION_EXIT_DURATION = 250;

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.06] text-sm text-white caret-white outline-none transition placeholder:text-blue-100/35 focus:border-violet-300/35 focus:bg-white/[0.09] autofill:border-white/10 autofill:shadow-[0_0_0_1000px_rgba(255,255,255,0.06)_inset] autofill:[-webkit-text-fill-color:white] autofill:caret-white autofill:transition-[background-color] autofill:duration-[999999s]";

function CommentNotification({ notification, isVisible, onClose }) {
  if (!notification || typeof document === "undefined") {
    return null;
  }

  const isSuccess = notification.type === "success";

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[99999] flex justify-center px-4 sm:top-6"
      aria-live={isSuccess ? "polite" : "assertive"}
      aria-atomic="true"
    >
      <div
        role={isSuccess ? "status" : "alert"}
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out sm:px-5 ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        } ${
          isSuccess
            ? "border-emerald-300/25 bg-emerald-950/95 shadow-emerald-950/40"
            : "border-red-300/25 bg-red-950/95 shadow-red-950/40"
        }`}
      >
        <div
          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
            isSuccess
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-red-400/15 text-red-300"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <CircleAlert className="size-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold ${
              isSuccess ? "text-emerald-100" : "text-red-100"
            }`}
          >
            {isSuccess ? "Berhasil" : "Terjadi Kesalahan"}
          </p>

          <p
            className={`mt-1 text-sm leading-6 ${
              isSuccess ? "text-emerald-100/75" : "text-red-100/75"
            }`}
          >
            {notification.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`flex size-8 shrink-0 self-center items-center justify-center rounded-lg transition ${
            isSuccess
              ? "text-emerald-100/60 hover:bg-emerald-400/15 hover:text-emerald-100"
              : "text-red-100/60 hover:bg-red-400/15 hover:text-red-100"
          }`}
          aria-label="Tutup notifikasi"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function CommentForm({ messageFieldHeight = null }) {
  const router = useRouter();

  const notificationTimerRef = useRef(null);
  const notificationExitTimerRef = useRef(null);
  const notificationFrameRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const isFormValid = useMemo(() => {
    return userName.trim().length > 0 && content.trim().length > 0;
  }, [userName, content]);

  const messageFieldStyle =
    typeof messageFieldHeight === "number"
      ? {
          height: `${messageFieldHeight}px`,
          minHeight: `${messageFieldHeight}px`,
          maxHeight: `${messageFieldHeight}px`,
        }
      : undefined;

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }

      if (notificationExitTimerRef.current) {
        window.clearTimeout(notificationExitTimerRef.current);
      }

      if (notificationFrameRef.current) {
        window.cancelAnimationFrame(notificationFrameRef.current);
      }
    };
  }, []);

  function clearNotificationTimers() {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);

      notificationTimerRef.current = null;
    }

    if (notificationExitTimerRef.current) {
      window.clearTimeout(notificationExitTimerRef.current);

      notificationExitTimerRef.current = null;
    }

    if (notificationFrameRef.current) {
      window.cancelAnimationFrame(notificationFrameRef.current);

      notificationFrameRef.current = null;
    }
  }

  function removeNotification() {
    setNotification(null);
    setIsNotificationVisible(false);
  }

  function closeNotification() {
    clearNotificationTimers();

    setIsNotificationVisible(false);

    notificationExitTimerRef.current = window.setTimeout(() => {
      removeNotification();
    }, NOTIFICATION_EXIT_DURATION);
  }

  function showNotification(type, message) {
    clearNotificationTimers();

    setIsNotificationVisible(false);

    setNotification({
      type,
      message,
    });

    notificationFrameRef.current = window.requestAnimationFrame(() => {
      setIsNotificationVisible(true);
      notificationFrameRef.current = null;
    });

    notificationTimerRef.current = window.setTimeout(() => {
      setIsNotificationVisible(false);

      notificationExitTimerRef.current = window.setTimeout(() => {
        removeNotification();
      }, NOTIFICATION_EXIT_DURATION);
    }, NOTIFICATION_DURATION);
  }

  function handleUserNameChange(event) {
    setUserName(event.target.value);
  }

  function handleContentChange(event) {
    setContent(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedUserName = userName.trim();
    const normalizedContent = content.trim();

    if (!normalizedUserName || !normalizedContent) {
      showNotification("error", "Nama dan komentar wajib diisi.");

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          userName: normalizedUserName,
          content: normalizedContent,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengirim komentar.");
      }

      setUserName("");
      setContent("");

      showNotification("success", "Komentar berhasil dikirim.");

      router.refresh();
    } catch (error) {
      console.error("COMMENT_SUBMIT_ERROR:", error);

      showNotification("error", "Gagal mengirim komentar. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CommentNotification
        notification={notification}
        isVisible={isNotificationVisible}
        onClose={closeNotification}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="comment-name" className="sr-only">
            Nama
          </label>

          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-blue-100/45 sm:left-5" />

            <input
              id="comment-name"
              type="text"
              name="commenter-name"
              value={userName}
              onChange={handleUserNameChange}
              placeholder="Masukkan nama Anda"
              autoComplete="name"
              className={`${fieldClassName} h-12 pl-11 pr-4 sm:h-14 sm:pl-12 sm:pr-5`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment-message" className="sr-only">
            Pesan
          </label>

          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-4 top-5 z-10 size-4 text-blue-100/45 sm:left-5" />

            <textarea
              id="comment-message"
              name="comment-message"
              value={content}
              onChange={handleContentChange}
              placeholder="Tulis pesan Anda di sini..."
              rows={7}
              style={messageFieldStyle}
              className={`${fieldClassName} min-h-[198px] resize-none py-4 pl-11 pr-4 sm:min-h-[206px] sm:pl-12 sm:pr-5`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:h-14"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Kirim Komentar
            </>
          )}
        </button>
      </form>
    </>
  );
}
