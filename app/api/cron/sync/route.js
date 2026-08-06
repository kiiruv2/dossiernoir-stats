import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", {status:401});
  }

  // V3 scaffold:
  // 1. Fetch YouTube / Instagram / TikTok.
  // 2. Upsert videos and snapshots into Supabase.
  // 3. Compare velocity with previous snapshots.
  // 4. Insert an alert when a video exceeds the configured viral threshold.
  //
  // This endpoint is already scheduled hourly by vercel.json.
  // Activate it after Supabase and social API tokens are configured.

  return NextResponse.json({
    ok:true,
    timestamp:new Date().toISOString(),
    message:"Cron actif. Ajoute Supabase et les jetons sociaux pour persister les synchronisations."
  });
}
