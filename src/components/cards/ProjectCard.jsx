"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createProjectSlug } from "@/lib/project-slug";

const PROJECT_RETURN_STORAGE_KEY = "portfolio_project_return";
const PORTFOLIO_SECTION_HASH = "#projects";

function shouldBypassImageOptimization(imageUrl) {
  return /\.(?:gif|svg)(?:[?#].*)?$/i.test(String(imageUrl || ""));
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

function getPortfolioReturnLocation() {
  const returnLocation = new URL(window.location.href);

  returnLocation.pathname = "/";
  returnLocation.search = "";
  returnLocation.hash = PORTFOLIO_SECTION_HASH;

  return returnLocation;
}

export const ProjectCard = memo(function ProjectCard({ project }) {
  const projectTitle = project.title || "Untitled Project";
  const projectDescription =
    project.description || "Deskripsi project belum tersedia.";

  const projectId = String(project.id ?? "").trim();
  const projectSlug = createProjectSlug(projectTitle);

  const projectDetailUrl = projectId
    ? `/project?id=${encodeURIComponent(projectId)}&slug=${encodeURIComponent(
        projectSlug,
      )}`
    : `/project?slug=${encodeURIComponent(projectSlug)}`;

  const downloadableDemo = isDownloadableFile(project.link);
  const downloadFileName = downloadableDemo
    ? getDownloadFileName(project.link)
    : undefined;

  function handleDetailNavigation(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    try {
      const returnLocation = getPortfolioReturnLocation();

      const returnPath = `${returnLocation.pathname}${returnLocation.search}${returnLocation.hash}`;

      window.history.replaceState(window.history.state, "", returnPath);

      sessionStorage.setItem(
        PROJECT_RETURN_STORAGE_KEY,
        JSON.stringify({
          url: returnLocation.href,
          savedAt: Date.now(),
        }),
      );
    } catch {}
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c2240]/90 p-0 shadow-2xl shadow-blue-950/25 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-violet-300/25 hover:bg-[#202747] hover:shadow-violet-500/15">
      <div className="p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-950/50 sm:aspect-[16/9]">
          {project.img ? (
            <Image
              src={project.img}
              alt={projectTitle}
              fill
              sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1279px) calc(50vw - 52px), 390px"
              quality={75}
              loading="lazy"
              unoptimized={shouldBypassImageOptimization(project.img)}
              className="object-cover object-top transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-blue-100/60">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <h3 className="text-xl font-black leading-tight tracking-tight text-blue-100 sm:text-2xl md:text-[1.55rem]">
            {projectTitle}
          </h3>

          <p className="mt-3 text-sm font-medium leading-7 text-blue-100/62 sm:mt-4 sm:text-base sm:leading-8">
            {projectDescription}
          </p>
        </div>

        <div className="mt-auto grid gap-3 pt-6 min-[430px]:flex min-[430px]:items-center min-[430px]:justify-between min-[430px]:gap-4 sm:pt-8">
          {project.link ? (
            <a
              href={project.link}
              target={downloadableDemo ? undefined : "_blank"}
              rel={downloadableDemo ? undefined : "noreferrer"}
              download={downloadFileName}
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-blue-400 transition duration-300 hover:text-blue-300 min-[430px]:justify-start"
            >
              Live Demo
              <ExternalLink className="size-4" />
            </a>
          ) : (
            <span className="inline-flex items-center justify-center gap-2 text-sm font-bold text-blue-100/35 min-[430px]:justify-start">
              Live Demo
              <ExternalLink className="size-4" />
            </span>
          )}

          <Link
            href={projectDetailUrl}
            prefetch={false}
            onClick={handleDetailNavigation}
            aria-label={`Buka detail project ${projectTitle}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition duration-300 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-white/[0.12] min-[430px]:h-12 min-[430px]:w-auto"
          >
            Details
            <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
});
