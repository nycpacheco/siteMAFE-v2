export function parsePositiveId(raw) {
  if (typeof raw === "number") {
    return Number.isInteger(raw) && raw > 0 ? raw : null;
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

export function normalizeTipoMidiaFilter(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "ambos" || normalized === "todos") return null;
  if (normalized === "foto" || normalized === "fotos") return "foto";
  if (normalized === "video" || normalized === "videos" || normalized === "vídeo" || normalized === "vídeos") {
    return "video";
  }
  return "INVALID";
}

export function buildMidiasWhereClause(query = {}) {
  const conditions = ["m.ativo = TRUE"];
  const params = [];

  if (
    query.categoria_id !== undefined &&
    query.categoria_id !== null &&
    String(query.categoria_id).trim() !== "" &&
    String(query.categoria_id).trim().toLowerCase() !== "todas"
  ) {
    const catId = parsePositiveId(String(query.categoria_id));
    if (!catId) {
      const err = new Error("Parâmetro categoria_id inválido.");
      err.statusCode = 400;
      throw err;
    }
    conditions.push("m.categoria_id = ?");
    params.push(catId);
  }

  const tipo = normalizeTipoMidiaFilter(query.tipo_midia);
  if (tipo === "INVALID") {
    const err = new Error("Parâmetro tipo_midia inválido. Use 'foto' ou 'video'.");
    err.statusCode = 400;
    throw err;
  }
  if (tipo) {
    conditions.push("m.tipo_midia = ?");
    params.push(tipo);
  }

  if (
    query.ano !== undefined &&
    query.ano !== null &&
    String(query.ano).trim() !== "" &&
    String(query.ano).trim().toLowerCase() !== "todos"
  ) {
    const anoNum = parsePositiveId(String(query.ano));
    if (!anoNum || anoNum < 1900 || anoNum > 2200) {
      const err = new Error("Parâmetro ano inválido.");
      err.statusCode = 400;
      throw err;
    }
    conditions.push("m.ano = ?");
    params.push(anoNum);
  }

  const busca = typeof query.busca === "string" ? query.busca.trim() : "";
  if (busca) {
    conditions.push("LOWER(m.titulo) LIKE LOWER(?)");
    params.push(`%${busca}%`);
  }

  return {
    whereSql: conditions.join(" AND "),
    params,
  };
}

export function computeYearsActive(anoFundacao, currentYear = new Date().getFullYear()) {
  const year = Number(anoFundacao);
  if (!Number.isFinite(year) || year <= 0) return null;
  return Math.max(0, currentYear - year);
}
