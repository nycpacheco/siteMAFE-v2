const PLACEHOLDER_HOSTS = new Set(["host", "my_host", "example.com"]);

function stripQuotes(value) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function parseDatabaseUrl(rawInput) {
  const raw = stripQuotes(rawInput);
  if (!raw) return null;

  const schemeMatch = raw.match(/^(mysql2?|tidb):\/\/(.*)$/i);
  if (!schemeMatch) return null;

  const rest = schemeMatch[2];
  const atIndex = rest.lastIndexOf("@");
  const authPart = atIndex === -1 ? "" : rest.slice(0, atIndex);
  const targetPart = atIndex === -1 ? rest : rest.slice(atIndex + 1);

  if (!targetPart) return null;

  try {
    const parsedTarget = new URL(`mysql://${targetPart}`);
    if (!parsedTarget.hostname) return null;

    let user = "";
    let password = "";
    if (authPart) {
      const colonIndex = authPart.indexOf(":");
      const rawUser = colonIndex === -1 ? authPart : authPart.slice(0, colonIndex);
      const rawPass = colonIndex === -1 ? "" : authPart.slice(colonIndex + 1);
      const safeDecode = (str) => {
        try {
          return decodeURIComponent(str);
        } catch {
          return str;
        }
      };
      user = safeDecode(rawUser);
      password = safeDecode(rawPass);
    }

    return {
      host: parsedTarget.hostname,
      port: Number(parsedTarget.port || 4000),
      user,
      password,
      database: parsedTarget.pathname.replace(/^\/+/, "") || "mafe_db",
      searchParams: parsedTarget.searchParams,
    };
  } catch {
    return null;
  }
}

export function isDatabaseConfigured(env = process.env) {
  const parsed = parseDatabaseUrl(env.DATABASE_URL);
  if (!parsed) return false;
  if (PLACEHOLDER_HOSTS.has(parsed.host.toLowerCase())) {
    return false;
  }
  if (
    parsed.user.toUpperCase() === "USUARIO" &&
    parsed.password.toUpperCase() === "SENHA"
  ) {
    return false;
  }
  return true;
}

export function buildMysqlPoolConfig(env = process.env) {
  const parsed = parseDatabaseUrl(env.DATABASE_URL);
  if (!parsed || !isDatabaseConfigured(env)) {
    const err = new Error(
      "Conexão com o banco de dados ainda não configurada. Verifique a variável DATABASE_URL no .env do backend e reinicie o servidor."
    );
    err.code = "DB_NOT_CONFIGURED";
    throw err;
  }

  const sslParam = (
    parsed.searchParams.get("ssl") ||
    parsed.searchParams.get("sslmode") ||
    parsed.searchParams.get("sslaccept") ||
    ""
  ).toLowerCase();

  let sslConfig;
  if (sslParam === "false" || sslParam === "disable" || env.DB_SSL === "false") {
    sslConfig = undefined;
  } else {
    let rejectUnauthorized = env.DB_SSL_REJECT_UNAUTHORIZED !== "false";
    if (sslParam.startsWith("{")) {
      try {
        const jsonSsl = JSON.parse(parsed.searchParams.get("ssl") || "{}");
        if (typeof jsonSsl.rejectUnauthorized === "boolean") {
          rejectUnauthorized = jsonSsl.rejectUnauthorized;
        }
      } catch {
        // Keep secure default
      }
    }
    sslConfig = {
      minVersion: "TLSv1.2",
      rejectUnauthorized,
    };
  }

  return {
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
  };
}

export function parseFrontendOrigins(env = process.env) {
  const raw = stripQuotes(env.FRONTEND_URL || "");
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function isOriginAllowed(origin, env = process.env) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/+$/, "");
  const configuredOrigins = parseFrontendOrigins(env);
  if (configuredOrigins.includes(normalizedOrigin)) {
    return true;
  }

  if (env.APP_URL && env.APP_URL.replace(/\/+$/, "") === normalizedOrigin) {
    return true;
  }

  const isProd = env.NODE_ENV === "production";
  if (!isProd) {
    try {
      const url = new URL(normalizedOrigin);
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".run.app")
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}
