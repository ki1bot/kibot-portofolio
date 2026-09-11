import { cache } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Boxes,
  Code2,
  ExternalLink,
  FileText,
  Layers3,
  Sparkles,
} from "lucide-react";

import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { GithubIcon } from "@/components/icons/TablerIcons";
import { Footer } from "@/components/layout/Footer";
import { ProjectBackButton } from "@/components/layout/ProjectBackButton";
import { shouldBypassNextImageOptimization } from "@/lib/next-image";
import { getProjectById, getProjectBySlug } from "@/lib/portfolio-api";

export const revalidate = 60;

const getCachedProjectById = cache(getProjectById);
const getCachedProjectBySlug = cache(getProjectBySlug);

function normalizeJsonArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => {
    return typeof item === "string" && item.trim().length > 0;
  });
}

function getSearchParamValue(searchParams, key) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isDownloadableFile(url) {
  return /\.(?:exe|zip|rar|7z|msi)(?:\?.*)?$/i.test(url || "");
}

function getDownloadFileName(url) {
  if (!url) {
    return undefined;
  }

  const path = url.split("?")[0];
  const fileName = path.split("/").pop();

  if (!fileName) {
    return undefined;
  }

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

async function resolveProject(searchParams) {
  const projectId = getSearchParamValue(searchParams, "id");
  const projectSlug = getSearchParamValue(searchParams, "slug");

  if (projectId) {
    const project = await getCachedProjectById(projectId);

    if (project) {
      return project;
    }
  }

  if (projectSlug) {
    return getCachedProjectBySlug(projectSlug);
  }

  return null;
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const project = await resolveProject(resolvedSearchParams);

  if (!project) {
    return {
      title: "Project Tidak Ditemukan | Rifqi Susanto",
      description: "Project portofolio tidak ditemukan.",
    };
  }

  return {
    title: `${project.title} | Rifqi Susanto`,
    description:
      project.description || "Detail project portofolio Rifqi Susanto.",
  };
}

export default async function ProjectDetailPage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const project = await resolveProject(resolvedSearchParams);

  if (!project) {
    notFound();
  }

  const features = normalizeJsonArray(project.features);
  const techStack = normalizeJsonArray(project.tech_stack);

  const projectTitle = project.title || "Untitled Project";

  const projectDescription =
    project.description || "Deskripsi project belum tersedia.";

  const downloadableDemo = isDownloadableFile(project.link);

  const downloadFileName = downloadableDemo
    ? getDownloadFileName(project.link)
    : undefined;

  return (
    <main className="project-detail-page min-h-screen overflow-hidden bg-[#050816] text-white">
      <AnimatedBackground />

      <section className="relative min-h-screen px-4 py-7 sm:px-6 sm:py-10 md:px-10 md:py-14 lg:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(37,99,235,0.13),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.96))]" />

        <div className="project-detail-grid pointer-events-none absolute inset-0 -z-10 opacity-55" />

        <div className="mx-auto max-w-[1180px]">
          <div className="detail-reveal flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-100/50 sm:gap-4 sm:text-sm">
            <ProjectBackButton />

            <span>Projects</span>

            <span className="text-blue-100/28">›</span>

            <span className="max-w-[180px] truncate text-white min-[420px]:max-w-[260px] sm:max-w-none">
              {projectTitle}
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-14">
            <div>
              <div className="detail-reveal detail-delay-1">
                <h1 className="-mb-[0.16em] max-w-2xl overflow-visible bg-gradient-to-r from-blue-100 via-violet-100 to-fuchsia-200 bg-clip-text pb-[0.16em] text-3xl font-black leading-[1.08] tracking-tight text-transparent min-[390px]:text-4xl md:text-5xl lg:text-6xl">
                  {projectTitle}
                </h1>

                <div className="detail-glow-line mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/35 sm:mt-7 sm:w-28" />
              </div>

              <p className="detail-reveal detail-delay-2 mt-6 max-w-[620px] text-base font-medium leading-8 text-blue-100/72 sm:mt-9 sm:text-[1.05rem]">
                {projectDescription}
              </p>

              <div className="detail-reveal detail-delay-3 mt-7 rounded-2xl border border-white/8 bg-white/[0.035] p-3 shadow-2xl shadow-blue-950/15 backdrop-blur-xl sm:mt-9">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="detail-stat-card rounded-xl border border-blue-300/15 bg-blue-500/[0.07] p-4">
                    <div className="flex items-center gap-4">
                      <div className="detail-stat-icon flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                        <Code2 className="size-5" />
                      </div>

                      <div>
                        <p className="text-xl font-black text-white">
                          {techStack.length}
                        </p>

                        <p className="text-xs font-medium text-blue-100/55">
                          Total Teknologi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-stat-card rounded-xl border border-violet-300/15 bg-violet-500/[0.07] p-4">
                    <div className="flex items-center gap-4">
                      <div className="detail-stat-icon flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                        <Layers3 className="size-5" />
                      </div>

                      <div>
                        <p className="text-xl font-black text-white">
                          {features.length}
                        </p>

                        <p className="text-xs font-medium text-blue-100/55">
                          Fitur Utama
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-reveal detail-delay-4 mt-7 grid gap-3 min-[430px]:flex min-[430px]:flex-wrap min-[430px]:gap-4 sm:mt-8">
                {project.link && (
                  <a
                    href={project.link}
                    target={downloadableDemo ? undefined : "_blank"}
                    rel={downloadableDemo ? undefined : "noreferrer"}
                    download={downloadFileName}
                    className="video-hover-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-6 text-sm font-bold text-blue-200 shadow-xl shadow-blue-950/20 min-[430px]:w-auto sm:h-14 sm:min-w-36 sm:px-7"
                  >
                    <ExternalLink className="size-4" />
                    Live Demo
                  </a>
                )}

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="video-hover-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-6 text-sm font-bold text-fuchsia-100 shadow-xl shadow-blue-950/20 min-[430px]:w-auto sm:h-14 sm:min-w-32 sm:px-7"
                  >
                    <GithubIcon
                      className="size-5"
                      stroke={1.8}
                      aria-hidden="true"
                    />
                    GitHub
                  </a>
                )}

                {project.pdf && (
                  <a
                    href={project.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="video-hover-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-6 text-sm font-bold text-red-100 shadow-xl shadow-blue-950/20 min-[430px]:w-auto sm:h-14 sm:min-w-32 sm:px-7"
                  >
                    <FileText className="size-4" />
                    PDF
                  </a>
                )}
              </div>

              {techStack.length > 0 && (
                <div className="detail-reveal detail-delay-5 mt-8 sm:mt-9">
                  <div className="mb-4 flex items-center gap-3 sm:mb-5">
                    <Code2 className="size-4 text-blue-300" />

                    <h2 className="text-lg font-black text-white sm:text-xl">
                      Technologies Used
                    </h2>
                  </div>

                  <div className="flex max-w-[620px] flex-wrap gap-2.5 sm:gap-3">
                    {techStack.map((tech, index) => (
                      <span
                        key={`${tech}-${index}`}
                        style={{
                          animationDelay: `${420 + index * 45}ms`,
                        }}
                        className="detail-tech-pill inline-flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 shadow-lg shadow-blue-950/10 sm:px-4 sm:text-sm"
                      >
                        <Boxes className="size-4" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5 lg:space-y-6 lg:pt-12">
              <div className="detail-reveal detail-delay-2 detail-image-card overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-2 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
                {project.img ? (
                  <Image
                    src={project.img}
                    alt={projectTitle}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) calc(100vw - 80px), 560px"
                    quality={75}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    unoptimized={shouldBypassNextImageOptimization(project.img)}
                    className="aspect-[16/10] w-full rounded-xl object-cover object-top sm:aspect-video"
                  />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-slate-950/50 text-sm text-blue-100/55 sm:aspect-video">
                    No Image
                  </div>
                )}
              </div>

              <div className="detail-reveal detail-delay-4 detail-feature-card rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex items-center gap-3 sm:mb-6">
                  <Sparkles className="size-5 text-yellow-300" />

                  <h2 className="text-xl font-black text-white sm:text-2xl">
                    Key Features
                  </h2>
                </div>

                {features.length > 0 ? (
                  <ul className="detail-feature-list space-y-2.5 sm:space-y-3">
                    {features.map((feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        style={{
                          animationDelay: `${480 + index * 50}ms`,
                        }}
                        className="detail-feature-item group"
                      >
                        <span className="detail-feature-shine" />
                        <span className="detail-feature-dot" />
                        <span className="detail-feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-7 text-blue-100/60">
                    Fitur project belum ditambahkan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
