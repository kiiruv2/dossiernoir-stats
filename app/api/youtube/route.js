import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) {
    return NextResponse.json({ status:"setup", videos:[], channel:null, message:"YouTube n'est pas encore configuré." });
  }

  try {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", key);

    const channelRes = await fetch(channelUrl, { next:{revalidate:300} });
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items?.length) {
      throw new Error(channelData.error?.message || "Chaîne YouTube introuvable.");
    }

    const channel = channelData.items[0];
    const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) {
      return NextResponse.json({
        status:"ok",
        channel:{title:channel.snippet.title, ...channel.statistics},
        videos:[],
        message:"La playlist d'uploads n'est pas encore disponible. Publie une première vidéo puis recharge."
      });
    }

    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "snippet,contentDetails");
    playlistUrl.searchParams.set("playlistId", uploads);
    playlistUrl.searchParams.set("maxResults", "50");
    playlistUrl.searchParams.set("key", key);

    const playlistRes = await fetch(playlistUrl, { next:{revalidate:300} });
    const playlistData = await playlistRes.json();

    if (!playlistRes.ok) {
      const reason = playlistData.error?.errors?.[0]?.reason;
      if (reason === "playlistNotFound") {
        return NextResponse.json({
          status:"ok",
          channel:{title:channel.snippet.title, ...channel.statistics},
          videos:[],
          message:"Playlist YouTube vide ou pas encore initialisée. Réessaie après la première publication."
        });
      }
      throw new Error(playlistData.error?.message || "Playlist YouTube indisponible.");
    }

    const ids = (playlistData.items || []).map(x => x.contentDetails.videoId);
    if (!ids.length) {
      return NextResponse.json({status:"ok",channel:{title:channel.snippet.title,...channel.statistics},videos:[],message:"Aucune vidéo publique pour le moment."});
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    videosUrl.searchParams.set("id", ids.join(","));
    videosUrl.searchParams.set("key", key);
    const videosRes = await fetch(videosUrl, { next:{revalidate:300} });
    const videosData = await videosRes.json();
    if (!videosRes.ok) throw new Error(videosData.error?.message || "Statistiques YouTube indisponibles.");

    const videos = videosData.items.map((v,index) => {
      const match = v.snippet.title.match(/(?:dossier\s*(?:n[°ºo.]*)?\s*)?(\d{1,4})/i);
      return {
        id:v.id,
        dossier:match?.[1]?.padStart(3,"0") || String(index+1).padStart(3,"0"),
        title:v.snippet.title,
        platform:"YouTube Shorts",
        publishedAt:v.snippet.publishedAt,
        thumbnail:v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || "",
        views:Number(v.statistics.viewCount || 0),
        likes:Number(v.statistics.likeCount || 0),
        comments:Number(v.statistics.commentCount || 0),
        shares:0,
        retention:0,
        completion:0,
        followers:0,
      };
    });

    return NextResponse.json({
      status:"ok",
      channel:{title:channel.snippet.title,thumbnail:channel.snippet.thumbnails?.high?.url,...channel.statistics},
      videos,
      message:""
    });
  } catch (error) {
    return NextResponse.json({status:"error",videos:[],channel:null,message:error.message},{status:500});
  }
}
