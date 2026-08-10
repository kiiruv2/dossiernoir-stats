import { NextResponse } from "next/server";
import { clearTokenCookies } from "../../../../../lib/tiktok";
export async function GET(request) {
  const response = NextResponse.redirect(new URL("/tiktok-marge", request.url));
  clearTokenCookies(response, "marge");
  return response;
}
