import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createApiApp } from "./server/app.js";
import { isDatabaseConfigured } from "./server/db-config.js";

// Carrega .env e, se existir, .env.local (sem sobrescrever variáveis já definidas no ambiente de hospedagem)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = createApiApp();

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    const indexHtmlPath = path.join(distDir, "index.html");

    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
          return next();
        }
        return res.sendFile(indexHtmlPath);
      });
    }
  }

  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "Rota da API não encontrada." });
  });

  app.listen(PORT, HOST, () => {
    console.log(
      `[MAFE] Servidor escutando em http://${HOST}:${PORT} (DATABASE_URL ${
        isDatabaseConfigured(process.env) ? "configurada" : "não configurada"
      })`
    );
  });
}

startServer().catch((err) => {
  console.error("[MAFE] Falha ao iniciar servidor:", err);
  process.exit(1);
});
