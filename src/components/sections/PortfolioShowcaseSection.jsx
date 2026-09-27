"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Code2,
  FolderKanban,
} from "lucide-react";

import { TECH_STACK } from "@/lib/constants";
import { CertificateCard } from "@/components/cards/CertificateCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";

const ITEMS_PER_CLICK = 3;
const MOBILE_INITIAL_VISIBLE_ITEMS = 3;
const DESKTOP_INITIAL_VISIBLE_ITEMS = 6;
const PROJECT_RETURN_STORAGE_KEY = "portfolio_project_return";
const PORTFOLIO_SECTION_ID = "projects";

const tabs = [
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: Award,
  },
  {
    key: "techstack",
    label: "Tech Stack",
    icon: Code2,
  },
];

function isVectorImage(imageUrl) {
  return /\.svg(?:\?.*)?$/i.test(imageUrl);
}

function getHeaderOffset() {
  const header = document.querySelector("header");

  if (!header) {
    return 16;
  }

  const headerStyles = window.getComputedStyle(header);
  const isFixedHeader =
    headerStyles.position === "fixed" || headerStyles.position === "sticky";

  if (!isFixedHeader) {
    return 16;
  }

  return header.getBoundingClientRect().height + 16;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothScrollToPortfolioShowcase() {
  return new Promise((resolve) => {
    const targetElement = document.getElementById(PORTFOLIO_SECTION_ID);

    if (!targetElement) {
      resolve();
      return;
    }

    const documentElement = document.documentElement;
    const previousInlineScrollBehavior = documentElement.style.scrollBehavior;

    documentElement.style.scrollBehavior = "auto";

    const startPosition = window.scrollY;
    const headerOffset = getHeaderOffset();
    const targetPosition = Math.max(
      0,
      startPosition + targetElement.getBoundingClientRect().top - headerOffset,
    );
    const distance = targetPosition - startPosition;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || Math.abs(distance) < 2) {
      window.scrollTo(0, targetPosition);
      documentElement.style.scrollBehavior = previousInlineScrollBehavior;
      resolve();
      return;
    }

    const duration = Math.min(1200, Math.max(700, Math.abs(distance) * 0.3));
    let startTime = null;

    function animateScroll(currentTime) {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
        return;
      }

      window.scrollTo(0, targetPosition);
      documentElement.style.scrollBehavior = previousInlineScrollBehavior;
      resolve();
    }

    window.requestAnimationFrame(animateScroll);
  });
}

function getResponsiveVisibilityClass(
  index,
  mobileVisibleCount,
  desktopVisibleCount,
) {
  const visibleOnMobile = index < mobileVisibleCount;
  const visibleOnDesktop = index < desktopVisibleCount;

  if (!visibleOnMobile && !visibleOnDesktop) {
    return "hidden";
  }

  if (!visibleOnMobile && visibleOnDesktop) {
    return "hidden md:block";
  }

  if (visibleOnMobile && !visibleOnDesktop) {
    return "md:hidden";
  }

  return undefined;
}

function useIncrementalVisibility(totalItems) {
  const [mobileVisibleCount, setMobileVisibleCount] = useState(
    MOBILE_INITIAL_VISIBLE_ITEMS,
  );
  const [desktopVisibleCount, setDesktopVisibleCount] = useState(
    DESKTOP_INITIAL_VISIBLE_ITEMS,
  );
  const isAnimatingRef = useRef(false);

  const effectiveMobileVisibleCount = Math.min(mobileVisibleCount, totalItems);

  const effectiveDesktopVisibleCount = Math.min(
    desktopVisibleCount,
    totalItems,
  );

  const showMoreMobile = useCallback(() => {
    setMobileVisibleCount((currentCount) =>
      Math.min(currentCount + ITEMS_PER_CLICK, totalItems),
    );
  }, [totalItems]);

  const showMoreDesktop = useCallback(() => {
    setDesktopVisibleCount((currentCount) =>
      Math.min(currentCount + ITEMS_PER_CLICK, totalItems),
    );
  }, [totalItems]);

  const showLess = useCallback(async () => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;

    await smoothScrollToPortfolioShowcase();

    setMobileVisibleCount(MOBILE_INITIAL_VISIBLE_ITEMS);
    setDesktopVisibleCount(DESKTOP_INITIAL_VISIBLE_ITEMS);
    isAnimatingRef.current = false;
  }, []);

  return {
    mobileVisibleCount: effectiveMobileVisibleCount,
    desktopVisibleCount: effectiveDesktopVisibleCount,
    showMoreMobile,
    showMoreDesktop,
    showLess,
  };
}

const TechStackGrid = memo(function TechStackGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {TECH_STACK.map((tech, index) => (
        <RevealOnScroll key={tech.name} delay={index * 35}>
          <div className="group rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-blue-950/10 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-violet-300/25 hover:bg-white/[0.1] hover:shadow-violet-500/15 sm:rounded-[1.5rem] sm:p-5">
            <div className="flex min-h-[124px] flex-col items-center justify-center gap-3 sm:min-h-[150px] sm:gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] p-3 transition duration-300 group-hover:scale-110 group-hover:bg-violet-500/15 sm:size-16 sm:rounded-3xl">
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={64}
                  height={64}
                  sizes="64px"
                  loading="lazy"
                  unoptimized={isVectorImage(tech.icon)}
                  className="h-full w-full object-contain transition duration-300 group-hover:rotate-6"
                />
              </div>

              <p className="text-center text-xs font-semibold text-white sm:text-sm">
                {tech.name}
              </p>
            </div>
          </div>
        </RevealOnScroll>
      ))}
    </div>
  );
});

function PaginationButton({ label, icon: Icon, onClick, variant = "primary" }) {
  const isPrimary = variant === "primary";

  const buttonAppearance = isPrimary
    ? "border-violet-300/20 bg-violet-400/[0.09] text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:border-violet-300/35 hover:bg-violet-400/[0.14]"
    : "border-white/10 bg-white/[0.035] text-blue-100/80 shadow-[0_10px_28px_rgba(0,0,0,0.14)] hover:border-white/20 hover:bg-white/[0.07] hover:text-white";

  const iconAppearance = isPrimary
    ? "border-violet-300/20 bg-violet-300/10 text-violet-100 group-hover:border-violet-200/30 group-hover:bg-violet-300/15"
    : "border-white/10 bg-white/[0.05] text-blue-100/70 group-hover:border-white/20 group-hover:bg-white/[0.08] group-hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[0.9rem] border px-4 py-3 text-sm font-semibold tracking-[0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] motion-reduce:transform-none motion-reduce:transition-none sm:min-h-[50px] sm:w-auto sm:px-5 ${buttonAppearance}`}
    >
      <span>{label}</span>

      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ${iconAppearance}`}
      >
        <Icon
          className={`size-[17px] transition-transform duration-200 ${
            isPrimary
              ? "group-hover:translate-y-0.5"
              : "group-hover:-translate-y-0.5"
          }`}
          strokeWidth={2}
        />
      </span>
    </button>
  );
}

function DevicePaginationControls({
  visibleCount,
  initialVisibleCount,
  totalCount,
  onShowMore,
  onShowLess,
  visibilityClass,
}) {
  const hiddenCount = Math.max(totalCount - visibleCount, 0);
  const nextVisibleCount = Math.min(ITEMS_PER_CLICK, hiddenCount);
  const canShowMore = hiddenCount > 0;
  const canShowLess = visibleCount > Math.min(initialVisibleCount, totalCount);

  if (!canShowMore && !canShowLess) {
    return null;
  }

  return (
    <div
      className={`mt-8 flex-col items-stretch justify-center gap-2.5 sm:mt-10 sm:flex-row sm:items-center ${visibilityClass}`}
    >
      {canShowMore && (
        <PaginationButton
          label={`See ${nextVisibleCount} more`}
          icon={ChevronDown}
          onClick={onShowMore}
          variant="primary"
        />
      )}

      {canShowLess && (
        <PaginationButton
          label="Show less"
          icon={ChevronUp}
          onClick={onShowLess}
          variant="secondary"
        />
      )}
    </div>
  );
}

function PaginationControls({
  mobileVisibleCount,
  desktopVisibleCount,
  totalCount,
  onShowMoreMobile,
  onShowMoreDesktop,
  onShowLess,
}) {
  return (
    <>
      <DevicePaginationControls
        visibleCount={mobileVisibleCount}
        initialVisibleCount={MOBILE_INITIAL_VISIBLE_ITEMS}
        totalCount={totalCount}
        onShowMore={onShowMoreMobile}
        onShowLess={onShowLess}
        visibilityClass="flex md:hidden"
      />

      <DevicePaginationControls
        visibleCount={desktopVisibleCount}
        initialVisibleCount={DESKTOP_INITIAL_VISIBLE_ITEMS}
        totalCount={totalCount}
        onShowMore={onShowMoreDesktop}
        onShowLess={onShowLess}
        visibilityClass="hidden md:flex"
      />
    </>
  );
}

const ProjectsPanel = memo(function ProjectsPanel({ projects }) {
  const projectItems = useMemo(() => {
    return Array.isArray(projects) ? projects : [];
  }, [projects]);

  const {
    mobileVisibleCount,
    desktopVisibleCount,
    showMoreMobile,
    showMoreDesktop,
    showLess,
  } = useIncrementalVisibility(projectItems.length);

  const visibleProjects = useMemo(() => {
    const maximumVisibleCount = Math.max(
      mobileVisibleCount,
      desktopVisibleCount,
    );

    return projectItems.slice(0, maximumVisibleCount);
  }, [desktopVisibleCount, mobileVisibleCount, projectItems]);

  if (!projectItems.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-blue-100/65 sm:p-8 sm:text-base">
        Belum ada project yang ditampilkan.
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {visibleProjects.map((project, index) => (
          <RevealOnScroll
            key={project.id ?? project.title}
            delay={index * 70}
            className={getResponsiveVisibilityClass(
              index,
              mobileVisibleCount,
              desktopVisibleCount,
            )}
          >
            <ProjectCard project={project} />
          </RevealOnScroll>
        ))}
      </div>

      <PaginationControls
        mobileVisibleCount={mobileVisibleCount}
        desktopVisibleCount={desktopVisibleCount}
        totalCount={projectItems.length}
        onShowMoreMobile={showMoreMobile}
        onShowMoreDesktop={showMoreDesktop}
        onShowLess={showLess}
      />
    </div>
  );
});

const CertificatesPanel = memo(function CertificatesPanel({ certificates }) {
  const certificateItems = useMemo(() => {
    return Array.isArray(certificates) ? certificates : [];
  }, [certificates]);

  const {
    mobileVisibleCount,
    desktopVisibleCount,
    showMoreMobile,
    showMoreDesktop,
    showLess,
  } = useIncrementalVisibility(certificateItems.length);

  const visibleCertificates = useMemo(() => {
    const maximumVisibleCount = Math.max(
      mobileVisibleCount,
      desktopVisibleCount,
    );

    return certificateItems.slice(0, maximumVisibleCount);
  }, [certificateItems, desktopVisibleCount, mobileVisibleCount]);

  if (!certificateItems.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-blue-100/65 sm:p-8 sm:text-base">
        Belum ada sertifikat yang ditampilkan.
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {visibleCertificates.map((certificate, index) => (
          <RevealOnScroll
            key={certificate.id ?? certificate.title ?? certificate.img}
            delay={index * 70}
            className={getResponsiveVisibilityClass(
              index,
              mobileVisibleCount,
              desktopVisibleCount,
            )}
          >
            <CertificateCard certificate={certificate} />
          </RevealOnScroll>
        ))}
      </div>

      <PaginationControls
        mobileVisibleCount={mobileVisibleCount}
        desktopVisibleCount={desktopVisibleCount}
        totalCount={certificateItems.length}
        onShowMoreMobile={showMoreMobile}
        onShowMoreDesktop={showMoreDesktop}
        onShowLess={showLess}
      />
    </div>
  );
});

export function PortfolioShowcaseSection({ projects = [], certificates = [] }) {
  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    try {
      sessionStorage.removeItem(PROJECT_RETURN_STORAGE_KEY);
    } catch {}
  }, []);

  const selectTab = useCallback(
    (tabKey) => {
      if (tabKey === activeTab) {
        return;
      }

      setActiveTab(tabKey);
    },
    [activeTab],
  );

  return (
    <section
      id={PORTFOLIO_SECTION_ID}
      className="border-t border-white/10 py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <RevealOnScroll className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              Portofolio Showcase
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-blue-100/72 sm:text-base md:mt-5 md:text-lg md:leading-8">
            Jelajahi project, sertifikat, dan teknologi yang saya gunakan dalam
            proses belajar dan pengembangan Portofolio ini.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={100} y={20}>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-2.5 shadow-2xl shadow-blue-950/20 backdrop-blur-md sm:mt-12 sm:rounded-[2rem] sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(tab.key)}
                    className={`group flex min-h-[74px] flex-col items-center justify-center rounded-[1.05rem] border px-2 py-3 text-center transition duration-300 sm:min-h-[96px] sm:rounded-[1.4rem] sm:px-6 sm:py-5 ${
                      isActive
                        ? "border-violet-300/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.28),rgba(255,255,255,0.08))] shadow-xl shadow-violet-500/10"
                        : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      className={`mb-2 size-4 transition sm:mb-3 sm:size-5 ${
                        isActive
                          ? "text-violet-200"
                          : "text-blue-100/55 group-hover:text-blue-100/85"
                      }`}
                    />

                    <span
                      className={`text-[11px] font-semibold leading-tight transition min-[390px]:text-xs sm:text-2xl ${
                        isActive
                          ? "text-white"
                          : "text-blue-100/70 group-hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </RevealOnScroll>

        <div className="mt-8 sm:mt-10" role="tabpanel">
          {activeTab === "projects" && <ProjectsPanel projects={projects} />}

          {activeTab === "certificates" && (
            <CertificatesPanel certificates={certificates} />
          )}

          {activeTab === "techstack" && <TechStackGrid />}
        </div>
      </div>
    </section>
  );
}
