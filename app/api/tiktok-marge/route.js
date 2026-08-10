import { NextResponse } from "next/server";
import { clearTokenCookies, refreshToken, setTokenCookies } from "../../../lib/tiktok";

const USER_FIELDS = ["open_id","union_id","avatar_url","display_name","bio_description","profile_deep_link","is_verified","follower_count","following_count","likes_count","video_count"].join(",");
const VIDEO_FIELDS = ["id","create_time","cover_image_url","share_url","video_description","duration","title","like_count","comment_count","share_count","view_count"].join(",");

async function requestTikTok(url, token, options = {}) {
  return fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) }, cache: "no-store" });
}
function failed(response, payload) { return !response.ok || (payload?.error?.code && payload.error.code !== "ok"); }

async function loadData(token) {
  const userUrl = new URL("https://open.tiktokapis.com/v2/user/info/"); userUrl.searchParams.set("fields", USER_FIELDS);
  const videosUrl = new URL("https://open.tiktokapis.com/v2/video/list/"); videosUrl.searchParams.set("fields", VIDEO_FIELDS);
  const [userResponse, videosResponse] = await Promise.all([
    requestTikTok(userUrl, token),
    requestTikTok(videosUrl, token, { method: "POST", body: JSON.stringify({ max_count: 20 }) })
  ]);
  const userPayload = await userResponse.json(); const videosPayload = await videosResponse.json();
  if (failed(userResponse, userPayload)) throw new Error(userPayload?.error?.message || "Profil TikTok MARGE. indisponible.");
  if (failed(videosResponse, videosPayload)) throw new Error(videosPayload?.error?.message || "Vidéos TikTok MARGE. indisponibles.");
  return { user: userPayload.data?.user || null, videos: videosPayload.data?.videos || [] };
}

function normalize(videos) {
  const chronological = [...videos].sort((a,b)=>Number(a.create_time||0)-Number(b.create_time||0));
  return chronological.map((video,index)=>({
    id: video.id,
    _source: "tiktok-marge",
    project: "MARGE.",
    dossier: String(index+1).padStart(3,"0"),
    title: video.title || video.video_description || `MARGE ${String(index+1).padStart(3,"0")}`,
    hook: video.title || video.video_description || `MARGE ${String(index+1).padStart(3,"0")}`,
    platform: "TikTok",
    views: Number(video.view_count||0), likes: Number(video.like_count||0), comments: Number(video.comment_count||0), shares: Number(video.share_count||0),
    retention: null, completion: null, followers: 0,
    publishedAt: new Date(Number(video.create_time||0)*1000).toISOString(), thumbnail: video.cover_image_url||"", shareUrl: video.share_url||""
  }));
}

export async function GET(request) {
  let accessToken = request.cookies.get("marge_tiktok_access")?.value;
  const refreshTokenValue = request.cookies.get("marge_tiktok_refresh")?.value;
  const expiresAt = Number(request.cookies.get("marge_tiktok_expires")?.value || 0);
  let renewedTokens = null;
  if (!accessToken && !refreshTokenValue) return NextResponse.json({ status:"disconnected", user:null, videos:[], message:"TikTok MARGE. n’est pas connecté." });
  try {
    if ((!accessToken || Date.now() >= expiresAt) && refreshTokenValue) { renewedTokens = await refreshToken(refreshTokenValue); accessToken = renewedTokens.access_token; }
    const data = await loadData(accessToken);
    const response = NextResponse.json({ status:"connected", user:data.user, videos:normalize(data.videos), message:"" });
    if (renewedTokens) setTokenCookies(response, renewedTokens, "marge");
    return response;
  } catch (error) {
    const response = NextResponse.json({ status:"error", user:null, videos:[], message:error instanceof Error?error.message:"TikTok MARGE. indisponible." }, { status:401 });
    clearTokenCookies(response, "marge");
    return response;
  }
}
