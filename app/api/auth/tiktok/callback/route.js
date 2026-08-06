import { NextResponse } from "next/server";
import {
  COOKIE_OPTIONS,
  exchangeCode,
  setTokenCookies,
} from "../../../../../lib/tiktok";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const expectedState = request.cookies.get("dn_tiktok_state")?.value;
  const verifier = request.cookies.get("dn_tiktok_verifier")?.value;
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const target = new URL("/tiktok", request.url);
    target.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(target);
  }

  if (!code || !verifier || !expectedState || returnedState !== expectedState) {
    const target = new URL("/tiktok", request.url);
    target.searchParams.set("error", "État OAuth invalide ou expiré.");
    return NextResponse.redirect(target);
  }

  try {
    const tokens = await exchangeCode(code, verifier);
    const response = NextResponse.redirect(new URL("/tiktok?connected=1", request.url));

    setTokenCookies(response, tokens);
    response.cookies.set("dn_tiktok_state", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    response.cookies.set("dn_tiktok_verifier", "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return response;
  } catch (errorObject) {
    const target = new URL("/tiktok", request.url);
    target.searchParams.set(
      "error",
      errorObject instanceof Error ? errorObject.message : "Connexion TikTok impossible."
    );
    return NextResponse.redirect(target);
  }
}
