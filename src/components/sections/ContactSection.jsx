import { MessageCircleMore, Share2 } from "lucide-react";

import { CommentCard } from "@/components/cards/CommentCard";
import { CommentForm } from "@/components/forms/CommentForm";
import { ContactMessageForm } from "@/components/forms/ContactMessageForm";
import {
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  SpotifyIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/icons/TablerIcons";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { ContactLayoutSync } from "@/components/sections/ContactLayoutSync";
import { PERSONAL_INFO } from "@/lib/constants";

const socialLinks = [
  {
    title: "LinkedIn",
    subtitle: "Rifqi Susanto",
    href: PERSONAL_INFO.linkedin,
    Icon: Linkedin01Icon,
  },
  {
    title: "GitHub",
    subtitle: "@ki1bot",
    href: PERSONAL_INFO.github,
    Icon: GithubIcon,
  },
  {
    title: "Instagram",
    subtitle: "@ki1bot_",
    href: PERSONAL_INFO.instagram,
    Icon: InstagramIcon,
  },
  {
    title: "YouTube",
    subtitle: "@kibot7659",
    href: PERSONAL_INFO.youtube,
    Icon: YoutubeIcon,
  },
  {
    title: "Spotify",
    subtitle: "kibot",
    href: PERSONAL_INFO.spotify,
    Icon: SpotifyIcon,
  },
  {
    title: "TikTok",
    subtitle: "@kiibott_",
    href: PERSONAL_INFO.tiktok,
    Icon: TiktokIcon,
  },
];

function SocialIcon({ item, className = "h-full w-full" }) {
  const Icon = item.Icon;

  return <Icon className={className} stroke={1.8} aria-hidden="true" />;
}

export function ContactSection({ comments = [] }) {
  return (
    <section id="contact" className="border-t border-white/10 py-20 md:py-32">
      <ContactLayoutSync />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 md:px-10">
        <RevealOnScroll className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-blue-100/70">
            Contact
          </p>

          <h2 className="text-4xl font-black leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
            Hubungi Saya
          </h2>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-blue-100/78 md:text-lg">
            Punya pertanyaan atau ingin bekerja sama? Kirimkan pesan, dan saya
            akan membalas secepat mungkin.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid items-start gap-10 md:mt-20 md:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16 xl:gap-20">
          <RevealOnScroll y={0} className="self-start">
            <div
              data-contact-source-card=""
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-5 md:rounded-[1.75rem] md:p-7"
            >
              <div data-contact-source-top="">
                <div
                  data-contact-source-header=""
                  className="flex items-start justify-between gap-5"
                >
                  <div>
                    <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                      Hubungi
                    </h3>

                    <p className="mt-3 max-w-sm text-[0.95rem] leading-7 text-blue-100/70 sm:text-base">
                      Ada yang ingin didiskusikan? Kirim saya pesan dan mari
                      kita bicara.
                    </p>
                  </div>

                  <Share2 className="mt-1 size-5 shrink-0 text-violet-200" />
                </div>

                <div className="mt-8">
                  <ContactMessageForm />
                </div>
              </div>

              <div className="my-8 h-px bg-white/10" />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-[2px] w-5 rounded-full bg-violet-400" />

                  <h4 className="text-lg font-semibold text-white">
                    Connect With Me
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                  {socialLinks.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:-translate-y-1 hover:border-violet-300/20 hover:bg-white/10 lg:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 p-2.5 text-violet-100 lg:size-11">
                          <SocialIcon item={item} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white lg:text-base">
                            {item.title}
                          </p>

                          <p className="truncate text-xs text-blue-100/60 lg:text-sm">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll y={0} className="min-h-0 self-start">
            <div
              data-contact-target-card=""
              className="flex min-h-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-5 md:rounded-[1.75rem] md:p-7"
            >
              <div className="flex min-h-0 w-full flex-col">
                <div data-contact-target-top="" className="shrink-0">
                  <div
                    data-contact-target-header=""
                    className="shrink-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-200">
                        <MessageCircleMore className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-2xl font-bold text-white sm:text-[1.65rem]">
                          Komentar{" "}
                          <span className="text-violet-300">
                            ({comments.length})
                          </span>
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 shrink-0 text-[0.95rem] leading-7 text-blue-100/70 sm:max-w-xl sm:text-base">
                      Tinggalkan komentar, saran, atau tanggapan mengenai
                      portofolio ini.
                    </p>
                  </div>

                  <div className="mt-8 shrink-0">
                    <CommentForm />
                  </div>
                </div>

                <div
                  data-contact-target-spacer=""
                  className="shrink-0"
                  aria-hidden="true"
                />

                <div className="my-8 h-px shrink-0 bg-white/10" />

                <div className="min-h-0 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3 lg:flex-1 lg:border-0 lg:bg-transparent lg:p-0">
                  <div className="comment-scroll-area max-h-[360px] min-h-0 space-y-4 overflow-y-auto overscroll-contain pl-1 pr-4 touch-pan-y sm:max-h-[400px] sm:pr-5 md:max-h-[440px] md:pr-5 lg:h-full lg:max-h-none lg:pr-2">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-blue-100/60">
                        Belum ada komentar.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
