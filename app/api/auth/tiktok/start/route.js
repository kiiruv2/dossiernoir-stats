import { NextResponse } from "next/server";
import {
  COOKIE_OPTIONS,
  pkceChallenge,
  randomToken,
  redirectUri,
} from "../../../../../lib/tiktok";

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    return NextResponse.json(
      { error: "TIKTOK_CLIENT_KEY manque dans Vercel." },
      { status: 500 }
    );
  }

  const state = randomToken(24);
  const verifier = randomToken(48);

  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set(
    "scope",
    "user.info.basic,user.info.profile,user.info.stats,video.list"
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", pkceChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(url);
  response.cookies.set("dn_tiktok_state", state, {
    ...COOKIE_OPTIONS,
    maxAge: 600,
  });
  response.cookies.set("dn_tiktok_verifier", verifier, {
    ...COOKIE_OPTIONS,
    maxAge: 600,
  });

  return response;
}
