import { NextResponse } from "next/server";

export async function GET(request) {
  const authorization = request.headers.get("authorization");

  if (process.env.CRON_SECRET && authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Cron V3 actif. La persistance Supabase sera activée après configuration."
  });
}
