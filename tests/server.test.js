import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildMysqlPoolConfig,
  isDatabaseConfigured,
  isOriginAllowed,
} from "../server/db-config.js";
import {
  buildMidiasWhereClause,
  computeYearsActive,
  parsePositiveId,
} from "../server/validation.js";
import { classifyDbError, createApiApp } from "../server/app.js";

test("isDatabaseConfigured rejects empty or placeholder DATABASE_URL", () => {
  assert.equal(isDatabaseConfigured({}), false);
  assert.equal(
    isDatabaseConfigured({
      DATABASE_URL: "mysql://USUARIO:SENHA@HOST:4000/mafe_db",
    }),
    false
  );
  assert.equal(
    isDatabaseConfigured({
      DATABASE_URL:
        "mysql://admin:secret123@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/mafe_db",
    }),
    true
  );
});

test("buildMysqlPoolConfig handles TLS, quotes, and passwords with unencoded @ and # characters", () => {
  const tidbConfig = buildMysqlPoolConfig({
    DATABASE_URL:
      '"mysql://user1:p@ss#123@gateway01.prod.aws.tidbcloud.com:4000/mafe_db"',
  });
  assert.equal(tidbConfig.host, "gateway01.prod.aws.tidbcloud.com");
  assert.equal(tidbConfig.port, 4000);
  assert.equal(tidbConfig.user, "user1");
  assert.equal(tidbConfig.password, "p@ss#123");
  assert.equal(tidbConfig.database, "mafe_db");
  assert.equal(tidbConfig.ssl?.minVersion, "TLSv1.2");

  const localConfig = buildMysqlPoolConfig({
    DATABASE_URL: "mysql://root:pass@127.0.0.1:3306/mafe_db?ssl=false",
  });
  assert.equal(localConfig.ssl, undefined);
});

test("classifyDbError returns safe actionable codes without exposing credentials", () => {
  assert.equal(classifyDbError({ code: "ER_ACCESS_DENIED_ERROR" }).code, "DB_AUTH_ERROR");
  assert.equal(classifyDbError({ code: "ER_BAD_DB_ERROR" }).code, "DB_UNKNOWN_DATABASE");
  assert.equal(classifyDbError({ code: "ER_NO_SUCH_TABLE" }).code, "DB_MISSING_TABLE");
  assert.equal(classifyDbError({ code: "HANDSHAKE_SSL_ERROR" }).code, "DB_TLS_ERROR");
  assert.equal(classifyDbError({ code: "ENOTFOUND" }).code, "DB_NETWORK_ERROR");
});

test("isOriginAllowed enforces FRONTEND_URL in production and allows localhost in dev", () => {
  const prodEnv = {
    NODE_ENV: "production",
    FRONTEND_URL: "https://mafe-site.onrender.com",
  };
  assert.equal(isOriginAllowed("https://mafe-site.onrender.com", prodEnv), true);
  assert.equal(isOriginAllowed("https://evil.example.com", prodEnv), false);
  assert.equal(isOriginAllowed(undefined, prodEnv), true);

  const devEnv = { NODE_ENV: "development", FRONTEND_URL: "" };
  assert.equal(isOriginAllowed("http://localhost:3000", devEnv), true);
});

test("parsePositiveId and buildMidiasWhereClause prevent invalid inputs and always filter ativo = TRUE", () => {
  assert.equal(parsePositiveId("15"), 15);
  assert.equal(parsePositiveId("0"), null);
  assert.equal(parsePositiveId("-3"), null);
  assert.equal(parsePositiveId("1; DROP TABLE midias"), null);

  const built = buildMidiasWhereClause({
    categoria_id: "2",
    tipo_midia: "video",
    ano: "2026",
    busca: "saque",
  });
  assert.equal(
    built.whereSql,
    "m.ativo = TRUE AND m.categoria_id = ? AND m.tipo_midia = ? AND m.ano = ? AND LOWER(m.titulo) LIKE LOWER(?)"
  );
  assert.deepEqual(built.params, [2, "video", 2026, "%saque%"]);

  assert.throws(() => buildMidiasWhereClause({ tipo_midia: "audio" }), {
    statusCode: 400,
  });
  assert.equal(computeYearsActive(2019, 2026), 7);
});

test("server/db.js executes only SELECT and the two authorized view-count UPDATE queries", async () => {
  const dbSource = await fs.readFile(path.resolve("server/db.js"), "utf-8");
  const forbidden = /\b(INSERT|DELETE|CREATE|ALTER|DROP|TRUNCATE|REPLACE)\b/i;
  assert.equal(forbidden.test(dbSource), false);

  const updateMatches = dbSource.match(/\bUPDATE\b/gi) || [];
  assert.equal(updateMatches.length, 2);
  assert.ok(
    dbSource.includes(
      "UPDATE midias SET visualizacoes = visualizacoes + 1 WHERE id = ? AND ativo = TRUE"
    )
  );
  assert.ok(
    dbSource.includes(
      "UPDATE apoiadores SET visualizacoes = visualizacoes + 1 WHERE id = ? AND ativo = TRUE"
    )
  );
});

test("API routes return expected payloads and validate PATCH view increments", async () => {
  const fakeDb = {
    queryPublicMidias: async () => [
      { id: 1, titulo: "Treino", tipo_midia: "foto", visualizacoes: 10 },
    ],
    queryRecentMidias: async () => [
      { id: 2, titulo: "Recente", tipo_midia: "video", visualizacoes: 3 },
    ],
    queryPublicCategorias: async () => [{ id: 1, nome: "Treinos Semanais" }],
    queryPublicApoiadores: async () => [
      { id: 4, nome_empresa: "Parceiro A", visualizacoes: 5 },
    ],
    queryPublicEstatisticas: async () => ({
      id: 1,
      quantidade_participantes: 48,
      quantidade_torneios: 14,
      ano_fundacao: 2019,
      anos_de_atuacao: 7,
    }),
    incrementMidiaVisualizacao: async (id) =>
      id === 1 ? { id: 1, visualizacoes: 11 } : null,
    incrementApoiadorVisualizacao: async (id) =>
      id === 4 ? { id: 4, visualizacoes: 6 } : null,
  };

  const app = createApiApp(fakeDb);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });

  try {
    const { port } = server.address();
    const base = `http://127.0.0.1:${port}`;

    const statusRes = await fetch(`${base}/api/status`);
    assert.equal(statusRes.status, 200);
    const statusBody = await statusRes.json();
    assert.equal(statusBody.status, "ok");

    const midiasRes = await fetch(`${base}/api/public/midias`);
    assert.equal(midiasRes.status, 200);
    assert.equal((await midiasRes.json()).midias.length, 1);

    const patchBad = await fetch(`${base}/api/public/midias/abc/visualizacao`, {
      method: "PATCH",
    });
    assert.equal(patchBad.status, 400);

    const patchMissing = await fetch(`${base}/api/public/midias/999/visualizacao`, {
      method: "PATCH",
    });
    assert.equal(patchMissing.status, 404);

    const patchOk = await fetch(`${base}/api/public/midias/1/visualizacao`, {
      method: "PATCH",
    });
    assert.equal(patchOk.status, 200);
    assert.deepEqual(await patchOk.json(), { id: 1, visualizacoes: 11 });

    const patchSupporterOk = await fetch(
      `${base}/api/public/apoiadores/4/visualizacao`,
      { method: "PATCH" }
    );
    assert.equal(patchSupporterOk.status, 200);
    assert.deepEqual(await patchSupporterOk.json(), {
      id: 4,
      visualizacoes: 6,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
