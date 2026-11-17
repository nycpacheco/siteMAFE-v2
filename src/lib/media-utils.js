const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const candidate = parsed.pathname.split("/").filter(Boolean)[0] || "";
      return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v") || "";
        return YOUTUBE_ID_REGEX.test(v) ? v : null;
      }

      const segments = parsed.pathname.split("/").filter(Boolean);
      if (
        segments.length >= 2 &&
        ["embed", "shorts", "live", "v"].includes(segments[0])
      ) {
        const candidate = segments[1];
        return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(rawUrl) {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}

export function getYouTubeThumbnailUrl(rawUrl) {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isDirectVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const clean = rawUrl.split("?")[0].split("#")[0].trim().toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".m4v")
  );
}

export function sanitizeExternalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return "";
  } catch {
    return "";
  }
}

export function calculateYearsActive(
  anoFundacao,
  currentYear = new Date().getFullYear()
) {
  const year = Number(anoFundacao);
  if (!Number.isFinite(year) || year <= 0) return null;
  return Math.max(0, currentYear - year);
}

export function sortGalleryItems(items = []) {
  return [...items].sort((a, b) => {
    const viewsDiff = Number(b.visualizacoes || 0) - Number(a.visualizacoes || 0);
    if (viewsDiff !== 0) return viewsDiff;

    const dateA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
    const dateB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;

    return Number(b.id || 0) - Number(a.id || 0);
  });
}

export function filterGalleryItems(
  items = [],
  { categoriaId = "Todas", tipoMidia = "Ambos", ano = "Todos", busca = "" } = {}
) {
  const normalizedSearch = String(busca || "").trim().toLowerCase();
  const normalizedType = String(tipoMidia || "Ambos").trim().toLowerCase();

  return items.filter((item) => {
    const matchCategory =
      categoriaId === "Todas" ||
      String(item.categoria_id) === String(categoriaId);

    const matchType =
      normalizedType === "ambos" ||
      normalizedType === "todos" ||
      String(item.tipo_midia).toLowerCase() === normalizedType;

    const matchYear =
      ano === "Todos" || String(item.ano) === String(ano);

    const matchSearch =
      !normalizedSearch ||
      String(item.titulo || "").toLowerCase().includes(normalizedSearch);

    return matchCategory && matchType && matchYear && matchSearch;
  });
}
