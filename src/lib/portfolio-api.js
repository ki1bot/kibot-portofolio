import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  FALLBACK_CERTIFICATES,
  FALLBACK_COMMENTS,
  FALLBACK_PROJECTS,
} from "@/lib/constants";
import {
  createPdfUrlFromImageUrl,
  resolveAssetUrl,
} from "@/lib/supabase-storage";
import { createProjectSlug } from "@/lib/project-slug";

const PROJECT_COLUMNS =
  "id, title, description, img, link, github, pdf, features, tech_stack, order_index, created_at";

const PINNED_RIFQI_PROFILE_IMAGE = resolveAssetUrl("assets/rifqi.jpg");

function normalizeProject(project) {
  return {
    ...project,
    img: resolveAssetUrl(project.img),
    pdf: project.pdf ? resolveAssetUrl(project.pdf) : "",
  };
}

function normalizeCertificate(certificate) {
  const normalizedImageUrl = resolveAssetUrl(certificate.img);
  const normalizedPdfUrl = certificate.pdf_url
    ? resolveAssetUrl(certificate.pdf_url)
    : createPdfUrlFromImageUrl(certificate.img);

  return {
    ...certificate,
    img: normalizedImageUrl,
    pdf_url: normalizedPdfUrl,
  };
}

function isPinnedRifqiComment(comment) {
  return (
    comment.is_pinned === true &&
    String(comment.user_name || "")
      .trim()
      .toLowerCase() === "rifqi"
  );
}

function normalizeComment(comment) {
  return {
    ...comment,
    profile_image: isPinnedRifqiComment(comment)
      ? PINNED_RIFQI_PROFILE_IMAGE
      : null,
  };
}

function normalizeProjects(projects) {
  return projects.map(normalizeProject);
}

function normalizeCertificates(certificates) {
  return certificates.map(normalizeCertificate);
}

function normalizeComments(comments) {
  return comments.map(normalizeComment);
}

function findFallbackProjectById(projectId) {
  return (
    FALLBACK_PROJECTS.find((project) => {
      return String(project.id) === String(projectId);
    }) || null
  );
}

function findFallbackProjectBySlug(slug) {
  return (
    FALLBACK_PROJECTS.find((project) => {
      return createProjectSlug(project.title) === slug;
    }) || null
  );
}

export async function getProjects() {
  if (!isSupabaseConfigured || !supabase) {
    return normalizeProjects(FALLBACK_PROJECTS);
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch projects:", error.message);
    return normalizeProjects(FALLBACK_PROJECTS);
  }

  return data?.length
    ? normalizeProjects(data)
    : normalizeProjects(FALLBACK_PROJECTS);
}

export async function getProjectById(projectId) {
  const normalizedProjectId = String(projectId ?? "").trim();

  if (!/^\d+$/.test(normalizedProjectId)) {
    return null;
  }

  const fallbackProject = findFallbackProjectById(normalizedProjectId);

  if (!isSupabaseConfigured || !supabase) {
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", normalizedProjectId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch project detail:", error.message);
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  if (!data) {
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  return normalizeProject(data);
}

export async function getProjectBySlug(slug) {
  const normalizedSlug = String(slug ?? "").trim();

  if (!normalizedSlug) {
    return null;
  }

  const fallbackProject = findFallbackProjectBySlug(normalizedSlug);

  if (!isSupabaseConfigured || !supabase) {
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Failed to fetch project by slug:", error.message);
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  const project = data?.find((currentProject) => {
    return createProjectSlug(currentProject.title) === normalizedSlug;
  });

  if (!project) {
    return fallbackProject ? normalizeProject(fallbackProject) : null;
  }

  return normalizeProject(project);
}

export async function getCertificates() {
  if (!isSupabaseConfigured || !supabase) {
    return normalizeCertificates(FALLBACK_CERTIFICATES);
  }

  const { data, error } = await supabase
    .from("certificates")
    .select("id, title, img, pdf_url, type, order_index, created_at")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch certificates:", error.message);
    return normalizeCertificates(FALLBACK_CERTIFICATES);
  }

  return data?.length
    ? normalizeCertificates(data)
    : normalizeCertificates(FALLBACK_CERTIFICATES);
}

export async function getComments() {
  if (!isSupabaseConfigured || !supabase) {
    return normalizeComments(FALLBACK_COMMENTS);
  }

  const { data, error } = await supabase
    .from("portfolio_comments")
    .select("id, content, user_name, is_pinned, created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch comments:", error.message);
    return normalizeComments(FALLBACK_COMMENTS);
  }

  return data?.length
    ? normalizeComments(data)
    : normalizeComments(FALLBACK_COMMENTS);
}

export async function getPortfolioData() {
  const [projects, certificates, comments] = await Promise.all([
    getProjects(),
    getCertificates(),
    getComments(),
  ]);

  return {
    projects,
    certificates,
    comments,
  };
}
