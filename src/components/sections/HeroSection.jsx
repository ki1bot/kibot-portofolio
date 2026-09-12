"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChartNoAxesCombined, ExternalLink, Mail } from "lucide-react";

import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import {
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
} from "@/components/icons/TablerIcons";
import { PERSONAL_INFO } from "@/lib/constants";
import { assetUrl } from "@/lib/supabase-storage";

const heroStacks = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "PHP",
  "Node.JS",
  "Bootstrap",
  "Tailwind CSS",
  "React",
];

const heroRoles = ["Fullstack Website", "Mobile Application"];

const heroSocials = [
  {
    title: "GitHub",
    href: PERSONAL_INFO.github,
    Icon: GithubIcon,
  },
  {
    title: "LinkedIn",
    href: PERSONAL_INFO.linkedin,
    Icon: Linkedin01Icon,
  },
  {
    title: "Instagram",
    href: PERSONAL_INFO.instagram,
    Icon: InstagramIcon,
  },
];

const HERO_ANIMATION_SOURCE = assetUrl("image/coding.gif");

const TYPEWRITER_START_DELAY_MS = 6000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetGifMotion(element) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.remove("is-gif-active");
  element.style.setProperty("--gif-x", "0px");
  element.style.setProperty("--gif-y", "0px");
  element.style.setProperty("--gif-rotate-x", "0deg");
  element.style.setProperty("--gif-rotate-y", "0deg");
  element.style.setProperty("--gif-scale", "1");
  element.style.setProperty("--gif-spot-x", "50%");
  element.style.setProperty("--gif-spot-y", "50%");
  element.style.setProperty("--gif-glow-opacity", "0");
}

function navigateToSection(event, sectionId) {
  event.preventDefault();

  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  const navbarOffset = window.innerWidth < 768 ? 84 : 115;

  const sectionPosition =
    section.getBoundingClientRect().top + window.scrollY - navbarOffset;

  window.history.replaceState(null, "", `#${sectionId}`);

  window.scrollTo({
    top: Math.max(sectionPosition, 0),
    behavior: "smooth",
  });
}

function useTypewriter(
  words,
  typingSpeed = 75,
  deletingSpeed = 45,
  pause = 1500,
) {
  const firstWord = words[0] || "";

  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(firstWord);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || words.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    let hasActivated = false;

    function removeActivationListeners() {
      window.removeEventListener("pointerdown", activateTypewriter);
      window.removeEventListener("touchstart", activateTypewriter);
      window.removeEventListener("keydown", activateTypewriter);
    }

    function activateTypewriter() {
      if (hasActivated) {
        return;
      }

      hasActivated = true;

      window.clearTimeout(startTimer);

      removeActivationListeners();

      setIsDeleting(true);
      setIsAnimationEnabled(true);
    }

    const startTimer = window.setTimeout(
      activateTypewriter,
      TYPEWRITER_START_DELAY_MS,
    );

    window.addEventListener("pointerdown", activateTypewriter, {
      once: true,
      passive: true,
    });

    window.addEventListener("touchstart", activateTypewriter, {
      once: true,
      passive: true,
    });

    window.addEventListener("keydown", activateTypewriter, {
      once: true,
    });

    return () => {
      window.clearTimeout(startTimer);
      removeActivationListeners();
    };
  }, [words.length]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !isAnimationEnabled ||
      words.length === 0
    ) {
      return;
    }

    const currentWord = words[wordIndex] || "";

    if (!isDeleting && displayText === currentWord) {
      const pauseTimeout = window.setTimeout(() => {
        setIsDeleting(true);
      }, pause);

      return () => {
        window.clearTimeout(pauseTimeout);
      };
    }

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          return;
        }

        const nextText = currentWord.slice(0, displayText.length - 1);

        setDisplayText(nextText);

        if (nextText === "") {
          setIsDeleting(false);
          setWordIndex((currentIndex) => (currentIndex + 1) % words.length);
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    words,
    wordIndex,
    displayText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pause,
    isAnimationEnabled,
  ]);

  return displayText;
}

export function HeroSection() {
  const typedRole = useTypewriter(heroRoles);

  const gifFieldRef = useRef(null);
  const gifMotionFrameRef = useRef(null);

  const gifPointerRef = useRef({
    clientX: 0,
    clientY: 0,
  });

  const gifVisibleRef = useRef(true);

  useEffect(() => {
    const gifField = gifFieldRef.current;

    if (!gifField) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      gifVisibleRef.current = true;

      return () => {
        if (gifMotionFrameRef.current !== null) {
          window.cancelAnimationFrame(gifMotionFrameRef.current);
          gifMotionFrameRef.current = null;
        }

        resetGifMotion(gifField);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        gifVisibleRef.current = entry.isIntersecting;

        if (!entry.isIntersecting) {
          if (gifMotionFrameRef.current !== null) {
            window.cancelAnimationFrame(gifMotionFrameRef.current);
            gifMotionFrameRef.current = null;
          }

          resetGifMotion(gifField);
        }
      },
      {
        root: null,
        rootMargin: "240px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(gifField);

    return () => {
      observer.disconnect();

      if (gifMotionFrameRef.current !== null) {
        window.cancelAnimationFrame(gifMotionFrameRef.current);
        gifMotionFrameRef.current = null;
      }

      resetGifMotion(gifField);
    };
  }, []);

  function updateGifMotion(element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const rect = element.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const pointerX = clamp(
      gifPointerRef.current.clientX - rect.left,
      0,
      rect.width,
    );

    const pointerY = clamp(
      gifPointerRef.current.clientY - rect.top,
      0,
      rect.height,
    );

    const normalizedX = pointerX / rect.width - 0.5;
    const normalizedY = pointerY / rect.height - 0.5;

    const translateX = normalizedX * 34;
    const translateY = normalizedY * 26;
    const rotateX = normalizedY * -9;
    const rotateY = normalizedX * 12;

    element.classList.add("is-gif-active");

    element.style.setProperty("--gif-x", `${translateX.toFixed(2)}px`);
    element.style.setProperty("--gif-y", `${translateY.toFixed(2)}px`);
    element.style.setProperty("--gif-rotate-x", `${rotateX.toFixed(2)}deg`);
    element.style.setProperty("--gif-rotate-y", `${rotateY.toFixed(2)}deg`);
    element.style.setProperty("--gif-scale", "1.055");

    element.style.setProperty(
      "--gif-spot-x",
      `${((pointerX / rect.width) * 100).toFixed(2)}%`,
    );

    element.style.setProperty(
      "--gif-spot-y",
      `${((pointerY / rect.height) * 100).toFixed(2)}%`,
    );

    element.style.setProperty("--gif-glow-opacity", "1");
  }

  function handleGifPointerMove(event) {
    if (!gifVisibleRef.current) {
      return;
    }

    const element = event.currentTarget;

    if (!(element instanceof HTMLElement)) {
      return;
    }

    gifPointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    if (gifMotionFrameRef.current !== null) {
      return;
    }

    gifMotionFrameRef.current = window.requestAnimationFrame(() => {
      gifMotionFrameRef.current = null;
      updateGifMotion(element);
    });
  }

  function handleGifPointerLeave(event) {
    if (gifMotionFrameRef.current !== null) {
      window.cancelAnimationFrame(gifMotionFrameRef.current);
      gifMotionFrameRef.current = null;
    }

    resetGifMotion(event.currentTarget);
  }

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_38%,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_82%_38%,rgba(14,165,233,0.1),transparent_30%)] md:bg-[radial-gradient(circle_at_18%_38%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_82%_38%,rgba(14,165,233,0.14),transparent_30%)]" />

      <div className="mx-auto grid min-h-screen max-w-[1320px] items-center gap-10 px-4 pb-20 pt-28 sm:px-6 sm:pt-32 md:px-10 md:pb-28 md:pt-44 lg:grid-cols-[0.9fr_1.1fr] lg:gap-28 lg:pt-56 xl:gap-48">
        <RevealOnScroll className="order-1 opacity-100" y={28} scale={0.99}>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 shadow-lg shadow-violet-500/10 backdrop-blur-xl sm:px-4 sm:text-sm">
            <ChartNoAxesCombined className="size-4 text-blue-300" />
            Ready to Innovate
          </div>

          <h1 className="mt-7 max-w-2xl text-[2.75rem] font-black leading-[1.03] tracking-tight text-white min-[390px]:text-5xl sm:text-6xl md:mt-10 md:text-7xl">
            Software{" "}
            <span className="-mb-[0.12em] block bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text pb-[0.12em] leading-[1.12] text-transparent">
              Engineer
            </span>
          </h1>

          <div className="mt-5 min-h-[40px] text-xl font-medium text-white sm:text-2xl md:mt-7 md:min-h-[56px] md:text-3xl">
            <span>{typedRole}</span>
            <span className="ml-1 animate-pulse text-violet-400">|</span>
          </div>

          <p className="mt-6 max-w-xl text-base leading-8 text-blue-100/75 sm:text-lg md:mt-8">
            Saya membangun website yang modern, fungsional, dan mudah digunakan
            untuk menjawab berbagai kebutuhan digital.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 md:mt-9 md:gap-4">
            {heroStacks.map((stack) => (
              <span
                key={stack}
                className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-blue-100/85 shadow-lg shadow-blue-950/10 backdrop-blur-xl sm:text-sm"
              >
                {stack}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-row sm:gap-4 md:mt-10">
            <a
              href="#projects"
              onClick={(event) => navigateToSection(event, "projects")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-slate-950/80 px-6 text-sm font-semibold text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-1 hover:border-violet-300/40 hover:bg-violet-600/20 sm:w-auto sm:min-w-40"
            >
              Projects
              <ExternalLink className="size-4" />
            </a>

            <a
              href="#contact"
              onClick={(event) => navigateToSection(event, "contact")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-slate-950/80 px-6 text-sm font-semibold text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-1 hover:border-violet-300/40 hover:bg-violet-600/20 sm:w-auto sm:min-w-40"
            >
              Contact
              <Mail className="size-4" />
            </a>
          </div>

          <div className="mt-10 flex items-center gap-4 sm:gap-6 md:mt-12 md:gap-7">
            {heroSocials.map(({ title, href, Icon }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={title}
                className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-violet-100 shadow-lg shadow-violet-950/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-300/25 hover:bg-violet-500/10 hover:text-white sm:size-12"
              >
                <Icon
                  className="h-full w-full"
                  stroke={1.8}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll
          className="order-2 block lg:translate-x-16 xl:translate-x-20"
          delay={120}
          y={28}
          scale={0.99}
        >
          <div
            ref={gifFieldRef}
            onPointerMove={handleGifPointerMove}
            onPointerLeave={handleGifPointerLeave}
            onPointerCancel={handleGifPointerLeave}
            className="hero-gif-field relative mx-auto flex w-full max-w-[320px] cursor-pointer items-center justify-center bg-transparent sm:max-w-[420px] md:max-w-[520px] lg:max-w-[720px]"
          >
            <Image
              src={HERO_ANIMATION_SOURCE}
              alt="Frontend development illustration"
              width={690}
              height={690}
              sizes="(max-width: 639px) 320px, (max-width: 767px) 420px, (max-width: 1023px) 520px, 690px"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              unoptimized
              className="hero-gif-image relative z-10 w-full max-w-[320px] object-contain sm:max-w-[420px] md:max-w-[520px] lg:max-w-[690px]"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
