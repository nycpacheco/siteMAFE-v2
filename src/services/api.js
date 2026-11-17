import { calculateYearsActive, sanitizeExternalUrl } from "@/lib/media-utils";

const rawApiUrl =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  "";

export const API_BASE_URL = String(rawApiUrl).trim().replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 10000;

export const ENDPOINTS = {
  status: `${API_BASE_URL}/api/status`,
  midias: `${API_BASE_URL}/api/public/midias`,
  midiasRecentes: `${API_BASE_URL}/api/public/midias/recentes`,
  categorias: `${API_BASE_URL}/api/public/categorias`,
  apoiadores: `${API_BASE_URL}/api/public/apoiadores`,
  estatisticas: `${API_BASE_URL}/api/public/estatisticas`,
  midiaVisualizacao: (id) => `${API_BASE_URL}/api/public/midias/${id}/visualizacao`,
  apoiadorVisualizacao: (id) =>
    `${API_BASE_URL}/api/public/apoiadores/${id}/visualizacao`,
};

async function requestJson(
  url,
  { method = "GET", timeoutMs = DEFAULT_TIMEOUT_MS, signal } = {}
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (signal) {
    signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        data?.error || `Erro HTTP ${response.status} ao acessar a API.`
      );
      error.status = response.status;
      error.code = data?.code || "HTTP_ERROR";
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", onExternalAbort);
    }
  }
}

export function normalizeMidia(item) {
  const tipo = String(item?.tipo_midia || "foto").toLowerCase() === "video"
    ? "video"
    : "foto";

  return {
    id: Number(item.id),
    categoria_id: Number(item.categoria_id),
    categoria_nome: String(item.categoria_nome || ""),
    titulo: String(item.titulo || ""),
    descricao: item.descricao ? String(item.descricao) : "",
    url_midia: String(item.url_midia || ""),
    tipo_midia: tipo,
    ano: Number(item.ano),
    visualizacoes: Number(item.visualizacoes || 0),
    ativo: Boolean(item.ativo ?? true),
    criado_em: item.criado_em || null,
  };
}

export function normalizeCategoria(item) {
  return {
    id: Number(item.id),
    nome: String(item.nome || ""),
  };
}

export function normalizeApoiador(item) {
  return {
    id: Number(item.id),
    nome_empresa: String(item.nome_empresa || ""),
    descricao: item.descricao ? String(item.descricao) : "",
    logo_url: String(item.logo_url || ""),
    site_url: sanitizeExternalUrl(item.site_url),
    visualizacoes: Number(item.visualizacoes || 0),
    ativo: Boolean(item.ativo ?? true),
  };
}

export function normalizeEstatisticas(item) {
  if (!item) return null;
  const anoFundacao = Number(item.ano_fundacao);
  return {
    id: Number(item.id),
    quantidade_participantes: Number(item.quantidade_participantes),
    quantidade_torneios: Number(item.quantidade_torneios),
    ano_fundacao: anoFundacao,
    anos_de_atuacao:
      item.anos_de_atuacao !== undefined && item.anos_de_atuacao !== null
        ? Number(item.anos_de_atuacao)
        : calculateYearsActive(anoFundacao),
  };
}

export async function getMidias(filters = {}, options = {}) {
  const params = new URLSearchParams();
  if (filters.categoria_id && filters.categoria_id !== "Todas") {
    params.set("categoria_id", String(filters.categoria_id));
  }
  if (filters.tipo_midia && filters.tipo_midia !== "Ambos") {
    params.set("tipo_midia", String(filters.tipo_midia));
  }
  if (filters.ano && filters.ano !== "Todos") {
    params.set("ano", String(filters.ano));
  }
  if (filters.busca && filters.busca.trim()) {
    params.set("busca", filters.busca.trim());
  }

  const query = params.toString();
  const url = query ? `${ENDPOINTS.midias}?${query}` : ENDPOINTS.midias;
  const payload = await requestJson(url, options);
  const list = Array.isArray(payload) ? payload : payload?.midias;
  if (!Array.isArray(list)) {
    throw new Error("Formato inválido no retorno de /api/public/midias.");
  }
  return list.map(normalizeMidia);
}

export async function getMidiasRecentes(options = {}) {
  const payload = await requestJson(ENDPOINTS.midiasRecentes, options);
  const list = Array.isArray(payload) ? payload : payload?.midias;
  if (!Array.isArray(list)) {
    throw new Error("Formato inválido no retorno de /api/public/midias/recentes.");
  }
  return list.slice(0, 5).map(normalizeMidia);
}

export async function getCategorias(options = {}) {
  const payload = await requestJson(ENDPOINTS.categorias, options);
  const list = Array.isArray(payload) ? payload : payload?.categorias;
  if (!Array.isArray(list)) {
    throw new Error("Formato inválido no retorno de /api/public/categorias.");
  }
  return list.map(normalizeCategoria);
}

export async function getApoiadores(options = {}) {
  const payload = await requestJson(ENDPOINTS.apoiadores, options);
  const list = Array.isArray(payload) ? payload : payload?.apoiadores;
  if (!Array.isArray(list)) {
    throw new Error("Formato inválido no retorno de /api/public/apoiadores.");
  }
  return list.map(normalizeApoiador);
}

export async function getEstatisticas(options = {}) {
  const payload = await requestJson(ENDPOINTS.estatisticas, options);
  const stats =
    payload && "estatisticas" in payload ? payload.estatisticas : payload;
  return normalizeEstatisticas(stats);
}

export async function registrarVisualizacaoMidia(id, options = {}) {
  const payload = await requestJson(ENDPOINTS.midiaVisualizacao(id), {
    ...options,
    method: "PATCH",
  });
  return {
    id: Number(payload?.id ?? id),
    visualizacoes: Number(payload?.visualizacoes ?? 0),
  };
}

export async function registrarVisualizacaoApoiador(id, options = {}) {
  const payload = await requestJson(ENDPOINTS.apoiadorVisualizacao(id), {
    ...options,
    method: "PATCH",
  });
  return {
    id: Number(payload?.id ?? id),
    visualizacoes: Number(payload?.visualizacoes ?? 0),
  };
}
