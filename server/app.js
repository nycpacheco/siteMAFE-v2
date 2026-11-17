import express from "express";
import cors from "cors";
import { isDatabaseConfigured, isOriginAllowed } from "./db-config.js";
import { parsePositiveId } from "./validation.js";
import * as defaultDb from "./db.js";

export function classifyDbError(err) {
  const code = err?.code || "";

  if (code === "DB_NOT_CONFIGURED") {
    return {
      status: 503,
      code: "DB_NOT_CONFIGURED",
      error:
        "Conexão com o banco de dados não configurada. Defina DATABASE_URL no arquivo .env do backend e reinicie o servidor.",
    };
  }

  if (code === "ER_ACCESS_DENIED_ERROR") {
    return {
      status: 503,
      code: "DB_AUTH_ERROR",
      error:
        "Falha de autenticação no TiDB/MySQL. Confira usuário e senha em DATABASE_URL.",
    };
  }

  if (code === "ER_BAD_DB_ERROR") {
    return {
      status: 503,
      code: "DB_UNKNOWN_DATABASE",
      error:
        "O banco especificado em DATABASE_URL não existe no servidor (verifique se o nome é mafe_db).",
    };
  }

  if (code === "ER_NO_SUCH_TABLE") {
    return {
      status: 503,
      code: "DB_MISSING_TABLE",
      error:
        "Tabela necessária não encontrada no banco de dados. Verifique se as tabelas de mafe_db foram criadas.",
    };
  }

  if (
    code === "HANDSHAKE_SSL_ERROR" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "ERR_TLS_CERT_ALTNAME_INVALID"
  ) {
    return {
      status: 503,
      code: "DB_TLS_ERROR",
      error:
        "Erro de certificado SSL/TLS ao conectar ao TiDB. Verifique os parâmetros SSL de DATABASE_URL ou DB_SSL_REJECT_UNAUTHORIZED.",
    };
  }

  if (
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "PROTOCOL_CONNECTION_LOST"
  ) {
    return {
      status: 503,
      code: "DB_NETWORK_ERROR",
      error:
        "Não foi possível alcançar o servidor TiDB/MySQL pela rede. Verifique host, porta e regras de acesso do cluster.",
    };
  }

  return {
    status: 503,
    code: "DB_UNAVAILABLE",
    error: "Não foi possível consultar o banco de dados no momento.",
  };
}

export function createApiApp(db = defaultDb) {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin(origin, callback) {
        if (isOriginAllowed(origin, process.env)) {
          return callback(null, true);
        }
        const corsErr = new Error("Origem não autorizada pelo CORS.");
        corsErr.statusCode = 403;
        return callback(corsErr);
      },
      methods: ["GET", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Accept"],
    })
  );

  app.use(express.json());

  app.get("/api/status", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "mafe-public-api",
      databaseConfigured: isDatabaseConfigured(process.env),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/public/midias", async (req, res, next) => {
    try {
      const midias = await db.queryPublicMidias(req.query);
      res.status(200).json({ midias });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/public/midias/recentes", async (_req, res, next) => {
    try {
      const midias = await db.queryRecentMidias();
      res.status(200).json({ midias });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/public/categorias", async (_req, res, next) => {
    try {
      const categorias = await db.queryPublicCategorias();
      res.status(200).json({ categorias });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/public/apoiadores", async (_req, res, next) => {
    try {
      const apoiadores = await db.queryPublicApoiadores();
      res.status(200).json({ apoiadores });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/public/estatisticas", async (_req, res, next) => {
    try {
      const estatisticas = await db.queryPublicEstatisticas();
      res.status(200).json({ estatisticas });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/public/midias/:id/visualizacao", async (req, res, next) => {
    try {
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: "ID de mídia inválido." });
      }
      const updated = await db.incrementMidiaVisualizacao(id);
      if (!updated) {
        return res.status(404).json({ error: "Mídia não encontrada ou inativa." });
      }
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  });

  app.patch("/api/public/apoiadores/:id/visualizacao", async (req, res, next) => {
    try {
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: "ID de apoiador inválido." });
      }
      const updated = await db.incrementApoiadorVisualizacao(id);
      if (!updated) {
        return res.status(404).json({ error: "Apoiador não encontrado ou inativo." });
      }
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  });

  app.use((err, _req, res, _next) => {
    if (err?.statusCode === 400 || err?.statusCode === 403) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    const classified = classifyDbError(err);
    console.error(
      `[API] Falha ao consultar TiDB (${classified.code}):`,
      err?.code || "UNKNOWN",
      err?.errno ? `errno=${err.errno}` : ""
    );
    return res.status(classified.status).json({
      error: classified.error,
      code: classified.code,
    });
  });

  return app;
}
