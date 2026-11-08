import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { getBlogDatabase } from "../database.ts";
import { BlogError } from "../errors.ts";
import { isPasswordHash, verifyAdminPassword } from "./password.ts";

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const windowMs = 15 * 60 * 1000;
const maxAttempts = 10;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const equal = (a: string, b: string) => timingSafeEqual(Buffer.from(digest(a), "hex"), Buffer.from(digest(b), "hex"));

export type AdminConfig = { login: string; passwordHash: string; origin: string; secure: boolean; cookieName: string; credentialVersion: string };
export type AdminSession = { login: string; csrfToken: string; expiresAt: number };

export function getAdminConfig(environment: Record<string, string | undefined> = process.env): AdminConfig {
  const login = environment.BLOG_ADMIN_LOGIN?.trim().toLowerCase();
  const passwordHash = environment.BLOG_ADMIN_PASSWORD_HASH ?? "";
  let origin: URL;
  try { origin = new URL(environment.BLOG_ADMIN_ORIGIN ?? ""); }
  catch { throw new BlogError(503, "admin_not_configured", "Administrator access is not configured."); }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (!login || login.length > 254 || !isPasswordHash(passwordHash) || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/" || (origin.protocol !== "https:" && !(origin.protocol === "http:" && loopback))) {
    throw new BlogError(503, "admin_not_configured", "Administrator access is not configured correctly.");
  }
  const secure = origin.protocol === "https:";
  return { login, passwordHash, origin: origin.origin, secure, cookieName: secure ? "__Host-blog_admin" : "blog_admin", credentialVersion: digest(`${login}\0${passwordHash}`) };
}

export function assertAdminOrigin(request: Request, config: AdminConfig) {
  if (request.headers.get("origin") !== config.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new BlogError(403, "invalid_origin", "This action must originate from the administrator site.");
  }
}

export function adminCookie(config: AdminConfig, token: string, clear = false): string {
  return `${config.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : ADMIN_SESSION_SECONDS}${config.secure ? "; Secure" : ""}`;
}

export function requestSessionToken(request: Request, config: AdminConfig): string | undefined {
  const values = (request.headers.get("cookie") ?? "").split(";").map(part => part.trim()).filter(part => part.startsWith(`${config.cookieName}=`));
  return values.length === 1 ? values[0].slice(config.cookieName.length + 1) : undefined;
}

// Avoid multiple memory-intensive scrypt operations per process at the same time.
const processState = globalThis as typeof globalThis & { blogAdminLoginBusy?: boolean };

export function createAdminAuth(database: DatabaseSync, config: AdminConfig, now = Date.now, verify = verifyAdminPassword) {
  function session(token: string | undefined): AdminSession | null {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const row = database.prepare("SELECT * FROM blog_admin_sessions WHERE token_hash = ?").get(digest(token));
    if (!row || Number(row.expires_at) <= now() || row.credential_version !== config.credentialVersion) return null;
    return { login: config.login, csrfToken: String(row.csrf_token), expiresAt: Number(row.expires_at) };
  }

  return {
    session,
    require(request: Request, mutation = false): AdminSession {
      const current = session(requestSessionToken(request, config));
      if (!current) throw new BlogError(401, "admin_unauthorized", "Your session expired. Sign in again in another tab before retrying.");
      if (mutation) {
        assertAdminOrigin(request, config);
        if (!equal(request.headers.get("x-csrf-token") ?? "", current.csrfToken)) throw new BlogError(403, "invalid_csrf", "Invalid request verification token. Reload the administrator page.");
      }
      return current;
    },
    async login(login: string, password: string, previousToken?: string) {
      if (processState.blogAdminLoginBusy) throw new BlogError(429, "login_rate_limited", "Please wait before trying to sign in again.");
      const time = now();
      // This single-account limiter deliberately does not trust forwarded IP headers.
      const limit = database.prepare(`INSERT INTO blog_admin_login_limits (bucket, attempts, window_start) VALUES ('login', 1, ?)
        ON CONFLICT(bucket) DO UPDATE SET attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
        window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END RETURNING attempts`).get(time, time - windowMs, time - windowMs);
      if (Number(limit?.attempts) > maxAttempts) throw new BlogError(429, "login_rate_limited", "Too many sign-in attempts. Try again in 15 minutes.");
      processState.blogAdminLoginBusy = true;
      try {
        // Always verify the hash, even for an unknown identifier.
        const passwordMatches = await verify(password, config.passwordHash);
        if (!equal(login.trim().toLowerCase(), config.login) || !passwordMatches) throw new BlogError(401, "invalid_credentials", "Invalid username/email or password.");
        database.prepare("DELETE FROM blog_admin_login_limits WHERE bucket = 'login'").run();
        database.prepare("DELETE FROM blog_admin_sessions WHERE expires_at <= ? OR credential_version != ?").run(time, config.credentialVersion);
        if (previousToken) database.prepare("DELETE FROM blog_admin_sessions WHERE token_hash = ?").run(digest(previousToken));
        const token = randomBytes(32).toString("base64url");
        const csrfToken = randomBytes(32).toString("hex");
        database.prepare("INSERT INTO blog_admin_sessions (token_hash, credential_version, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(digest(token), config.credentialVersion, csrfToken, time, time + ADMIN_SESSION_SECONDS * 1000);
        database.prepare("DELETE FROM blog_admin_sessions WHERE token_hash IN (SELECT token_hash FROM blog_admin_sessions ORDER BY created_at DESC, rowid DESC LIMIT -1 OFFSET 10)").run();
        return { token, session: session(token)! };
      } finally { processState.blogAdminLoginBusy = false; }
    },
    logout(token: string | undefined) {
      if (token) database.prepare("DELETE FROM blog_admin_sessions WHERE token_hash = ?").run(digest(token));
    },
  };
}

export function getAdminAuth(config = getAdminConfig()) { return createAdminAuth(getBlogDatabase(), config); }
