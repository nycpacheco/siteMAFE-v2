import { fallbackSiteContent, resolveAssetUrl } from "@/lib/site-content";

/**
 * Na Entrega 1, VITE_API_BASE_URL não está definida, então o front-end consome
 * os arquivos simulados em `/mock/galeria.json`, `/mock/apoiadores.json` e `/mock/institucional.json`.
 *
 * Na Entrega 2, basta definir `VITE_API_BASE_URL=http://localhost:5000` (ou a URL da API Flask)
 * no arquivo `.env` para que o React passe automaticamente a requisitar:
 * - GET `${API_BASE_URL}/galeria`
 * - GET `${API_BASE_URL}/apoiadores`
 */
const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, "")) ||
  "";

const DEFAULT_TIMEOUT_MS = 8000;

export const ENDPOINTS = {
  galeria: API_BASE_URL ? `${API_BASE_URL}/galeria` : "/mock/galeria.json",
  apoiadores: API_BASE_URL
    ? `${API_BASE_URL}/apoiadores`
    : "/mock/apoiadores.json",
  institucional: "/mock/institucional.json",
};

let cachedContentPromise = null;

/**
 * Helper HTTP assíncrono com suporte a timeout via AbortController (preparado para Entrega 3).
 */
async function requestJson(url, { timeoutMs = DEFAULT_TIMEOUT_MS, signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status} ao acessar ${url}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/**
 * Adaptador que aceita tanto as chaves em inglês do front-end atual quanto
 * possíveis nomes de colunas em português vindos do banco MySQL / API Flask na Entrega 2.
 */
export function normalizeGalleryItem(item, index = 0) {
  const rawImage =
    item.image ?? item.imagem ?? item.url_midia ?? item.url ?? "";
  const yearVal = String(item.year ?? item.ano ?? item.date ?? item.data ?? "2026");

  return {
    id: item.id ?? item.id_midia ?? index + 1,
    title: item.title ?? item.titulo ?? "Registro MAFE",
    description: item.description ?? item.descricao ?? "",
    date: String(item.date ?? item.data ?? yearVal),
    year: yearVal,
    eventType: item.eventType ?? item.tipo_evento ?? item.categoria ?? "Treinos",
    mediaType: item.mediaType ?? item.tipo_midia ?? item.tipo ?? "Foto",
    image: resolveAssetUrl(rawImage),
    width: Number(item.width ?? item.largura ?? 1200),
    height: Number(item.height ?? item.altura ?? 912),
  };
}

/**
 * Adaptador para os itens vindos de `GET /apoiadores` (mock JSON ou API Flask + MySQL).
 */
export function normalizeSupporter(item, index = 0) {
  const rawLogo = item.logo ?? item.logotipo ?? item.imagem ?? item.url_logo ?? "";

  return {
    id: item.id ?? item.id_apoiador ?? index + 1,
    name: item.name ?? item.nome ?? "Apoiador MAFE",
    summary:
      item.summary ??
      item.resumo ??
      "Nome, logotipo e site oficial deste parceiro em atualização.",
    description:
      item.description ??
      item.descricao ??
      "Parceiro do Maturidade Feliz que apoia os treinos de vôlei adaptado.",
    logo: resolveAssetUrl(rawLogo),
    url: item.url ?? item.site_url ?? item.site ?? item.link ?? "",
  };
}

/**
 * Consulta isolada ao endpoint `GET /galeria` (ou `/mock/galeria.json`).
 */
export async function getGaleria(options = {}) {
  const payload = await requestJson(ENDPOINTS.galeria, options);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.galleryItems)
      ? payload.galleryItems
      : Array.isArray(payload?.galeria)
        ? payload.galeria
        : null;

  if (!list) {
    throw new Error("Formato inválido no retorno de /galeria");
  }

  return list.map(normalizeGalleryItem);
}

/**
 * Consulta isolada ao endpoint `GET /apoiadores` (ou `/mock/apoiadores.json`).
 */
export async function getApoiadores(options = {}) {
  const payload = await requestJson(ENDPOINTS.apoiadores, options);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.supporters)
      ? payload.supporters
      : Array.isArray(payload?.apoiadores)
        ? payload.apoiadores
        : null;

  if (!list) {
    throw new Error("Formato inválido no retorno de /apoiadores");
  }

  return list.map(normalizeSupporter);
}

/**
 * Consulta aos dados institucionais e contatos (`/mock/institucional.json`).
 */
export async function getInstitucional(options = {}) {
  const payload = await requestJson(ENDPOINTS.institucional, options);
  return {
    contactStatus: {
      ...fallbackSiteContent.contactStatus,
      ...(payload?.contactStatus || {}),
    },
    aboutContent: {
      ...fallbackSiteContent.aboutContent,
      ...(payload?.aboutContent || {}),
    },
    homeContent: {
      ...fallbackSiteContent.homeContent,
      ...(payload?.homeContent || {}),
    },
  };
}

/**
 * Agrega todas as chamadas assíncronas do Portal Público usando `Promise.allSettled`.
 * Se um endpoint da API Flask falhar isoladamente na Entrega 2, os demais continuam
 * funcionando normalmente e apenas o que falhou usa o fallback seguro.
 */
export async function fetchSiteContent({ forceRefresh = false, signal } = {}) {
  if (!forceRefresh && cachedContentPromise) {
    return cachedContentPromise;
  }

  const requestPromise = (async () => {
    const [galeriaResult, apoiadoresResult, institucionalResult] =
      await Promise.allSettled([
        getGaleria({ signal }),
        getApoiadores({ signal }),
        getInstitucional({ signal }),
      ]);

    if (galeriaResult.status === "rejected") {
      console.warn(
        "[API] Falha ao buscar /galeria, aplicando fallback local:",
        galeriaResult.reason
      );
    }
    if (apoiadoresResult.status === "rejected") {
      console.warn(
        "[API] Falha ao buscar /apoiadores, aplicando fallback local:",
        apoiadoresResult.reason
      );
    }
    if (institucionalResult.status === "rejected") {
      console.warn(
        "[API] Falha ao buscar /institucional, aplicando fallback local:",
        institucionalResult.reason
      );
    }

    const institucional =
      institucionalResult.status === "fulfilled"
        ? institucionalResult.value
        : {
            contactStatus: fallbackSiteContent.contactStatus,
            aboutContent: fallbackSiteContent.aboutContent,
            homeContent: fallbackSiteContent.homeContent,
          };

    return {
      ...institucional,
      galleryItems:
        galeriaResult.status === "fulfilled"
          ? galeriaResult.value
          : fallbackSiteContent.galleryItems,
      supporters:
        apoiadoresResult.status === "fulfilled"
          ? apoiadoresResult.value
          : fallbackSiteContent.supporters,
    };
  })();

  cachedContentPromise = requestPromise;
  return requestPromise;
}

export function clearSiteContentCache() {
  cachedContentPromise = null;
}
