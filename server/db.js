import dotenv from "dotenv";
import path from "node:path";
import mysql from "mysql2/promise";
import { buildMysqlPoolConfig, isDatabaseConfigured } from "./db-config.js";
import { buildMidiasWhereClause, computeYearsActive } from "./validation.js";

let pool = null;
let lastUrl = "";

export function getPool() {
  if (!isDatabaseConfigured(process.env)) {
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  }

  const currentUrl = (process.env.DATABASE_URL || "").trim();
  if (!isDatabaseConfigured(process.env)) {
    const err = new Error(
      "Banco de dados não configurado. Defina DATABASE_URL no ambiente do backend."
    );
    err.code = "DB_NOT_CONFIGURED";
    throw err;
  }

  if (!pool || lastUrl !== currentUrl) {
    if (pool) {
      pool.end().catch(() => {});
    }
    const config = buildMysqlPoolConfig(process.env);
    pool = mysql.createPool(config);
    lastUrl = currentUrl;
  }

  return pool;
}

const MIDIAS_SELECT_BASE = `
  SELECT
    m.id,
    m.categoria_id,
    c.nome AS categoria_nome,
    m.titulo,
    m.descricao,
    m.url_midia,
    m.tipo_midia,
    m.ano,
    m.visualizacoes,
    m.ativo,
    m.criado_em
  FROM midias m
  INNER JOIN categorias_galeria c ON m.categoria_id = c.id
`;

export async function queryPublicMidias(filters = {}) {
  const db = getPool();
  const { whereSql, params } = buildMidiasWhereClause(filters);
  const sql = `
    ${MIDIAS_SELECT_BASE}
    WHERE ${whereSql}
    ORDER BY m.visualizacoes DESC, m.criado_em DESC, m.id DESC
  `;
  const [rows] = await db.execute(sql, params);
  return rows;
}

export async function queryRecentMidias() {
  const db = getPool();
  const sql = `
    ${MIDIAS_SELECT_BASE}
    WHERE m.ativo = TRUE
    ORDER BY m.criado_em DESC, m.id DESC
    LIMIT 5
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

export async function queryPublicCategorias() {
  const db = getPool();
  const sql = `
    SELECT id, nome
    FROM categorias_galeria
    ORDER BY nome ASC
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

export async function queryPublicApoiadores() {
  const db = getPool();
  const sql = `
    SELECT
      id,
      nome_empresa,
      descricao,
      logo_url,
      site_url,
      visualizacoes,
      ativo
    FROM apoiadores
    WHERE ativo = TRUE
    ORDER BY id ASC
  `;
  const [rows] = await db.execute(sql);
  return rows;
}

export async function queryPublicEstatisticas() {
  const db = getPool();
  const sql = `
    SELECT
      id,
      quantidade_participantes,
      quantidade_torneios,
      ano_fundacao
    FROM estatisticas_grupo
    ORDER BY id ASC
    LIMIT 1
  `;
  const [rows] = await db.execute(sql);
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return {
    id: row.id,
    quantidade_participantes: Number(row.quantidade_participantes),
    quantidade_torneios: Number(row.quantidade_torneios),
    ano_fundacao: Number(row.ano_fundacao),
    anos_de_atuacao: computeYearsActive(row.ano_fundacao),
  };
}

export async function incrementMidiaVisualizacao(id) {
  const db = getPool();
  const [result] = await db.execute(
    "UPDATE midias SET visualizacoes = visualizacoes + 1 WHERE id = ? AND ativo = TRUE",
    [id]
  );
  if (!result || result.affectedRows === 0) {
    return null;
  }
  const [rows] = await db.execute(
    "SELECT id, visualizacoes FROM midias WHERE id = ? AND ativo = TRUE LIMIT 1",
    [id]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function incrementApoiadorVisualizacao(id) {
  const db = getPool();
  const [result] = await db.execute(
    "UPDATE apoiadores SET visualizacoes = visualizacoes + 1 WHERE id = ? AND ativo = TRUE",
    [id]
  );
  if (!result || result.affectedRows === 0) {
    return null;
  }
  const [rows] = await db.execute(
    "SELECT id, visualizacoes FROM apoiadores WHERE id = ? AND ativo = TRUE LIMIT 1",
    [id]
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
