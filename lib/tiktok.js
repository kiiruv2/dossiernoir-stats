import crypto from "node:crypto";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export function base64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function randomToken(size = 32) {
  return base64Url(crypto.randomBytes(size));
}

export function pkceChallenge(verifier) {
  return base64Url(crypto.createHash("sha256").update(verifier).digest());
}

export function redirectUri(project = "dossier") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dossiernoir-stats.vercel.app";
  if (project === "marge") {
    return process.env.TIKTOK_MARGE_REDIRECT_URI || `${base}/api/auth/tiktok-marge/callback`;
  }
  return process.env.TIKTOK_REDIRECT_URI || `${base}/api/auth/tiktok/callback`;
}

export async function exchangeCode(code, verifier, project = "dossier") {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri(project),
    code_verifier: verifier,
  });

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error_description ||
      payload.message ||
      payload.error ||
      "TikTok a refusé la connexion."
    );
  }

  return payload;
}

export async function refreshToken(refreshTokenValue) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
  });

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error_description ||
      payload.message ||
      payload.error ||
      "Impossible de renouveler TikTok."
    );
  }

  return payload;
}

export function cookiePrefix(project = "dossier") {
  return project === "marge" ? "marge_tiktok" : "dn_tiktok";
}

export function setTokenCookies(response, tokens, project = "dossier") {
  const prefix = cookiePrefix(project);
  const accessMaxAge = Math.max(Number(tokens.expires_in || 86400) - 60, 60);
  const refreshMaxAge = Math.max(Number(tokens.refresh_expires_in || 31536000) - 60, 60);

  response.cookies.set(`${prefix}_access`, tokens.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: accessMaxAge,
  });
  response.cookies.set(`${prefix}_refresh`, tokens.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: refreshMaxAge,
  });
  response.cookies.set(
    `${prefix}_expires`,
    String(Date.now() + accessMaxAge * 1000),
    { ...COOKIE_OPTIONS, maxAge: accessMaxAge }
  );
}

export function clearTokenCookies(response, project = "dossier") {
  const prefix = cookiePrefix(project);
  for (const name of [
    `${prefix}_access`,
    `${prefix}_refresh`,
    `${prefix}_expires`,
    `${prefix}_state`,
    `${prefix}_verifier`,
  ]) {
    response.cookies.set(name, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }
}
