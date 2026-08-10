import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const handle = (process.env.YOUTUBE_MARGE_HANDLE || "Margeoff").replace(/^@/, "");

  if (!key) {
    return NextResponse.json({
      status: "setup",
      channel: null,
      videos: [],
      message: "Ajoute YOUTUBE_API_KEY dans Vercel. Le compte MARGE. est résolu automatiquement avec @Margeoff."
    });
  }

  try {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    channelUrl.searchParams.set("forHandle", handle);
    channelUrl.searchParams.set("key", key);

    const channelResponse = await fetch(channelUrl, { next: { revalidate: 300 } });
    const channelPayload = await channelResponse.json();

    if (!channelResponse.ok || !channelPayload.items?.length) {
      throw new Error(channelPayload.error?.message || `Chaîne YouTube @${handle} introuvable.`);
    }

    const channel = channelPayload.items[0];
    const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylist) {
      return NextResponse.json({
        status: "ok",
        channel: { id: channel.id, handle: `@${handle}`, title: channel.snippet.title, ...channel.statistics },
        videos: [],
        message: "La playlist d'uploads MARGE. n'est pas encore disponible."
      });
    }

    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "snippet,contentDetails");
    playlistUrl.searchParams.set("playlistId", uploadsPlaylist);
    playlistUrl.searchParams.set("maxResults", "50");
    playlistUrl.searchParams.set("key", key);

    const playlistResponse = await fetch(playlistUrl, { next: { revalidate: 300 } });
    const playlistPayload = await playlistResponse.json();

    let ids = [];

    if (playlistResponse.ok) {
      ids = (playlistPayload.items || []).map((item) => item.contentDetails?.videoId).filter(Boolean);
    } else {
      const reason = playlistPayload.error?.errors?.[0]?.reason;
      const publicVideoCount = Number(channel.statistics?.videoCount || 0);

      // Une chaîne toute neuve peut exposer son ID de playlist "uploads" avant que
      // cette playlist soit réellement disponible. Ce n'est pas une déconnexion :
      // on garde YouTube MARGE. en état connecté et on attend la 1re publication.
      if (reason === "playlistNotFound" && publicVideoCount === 0) {
        return NextResponse.json({
          status: "ok",
          channel: {
            id: channel.id,
            handle: `@${handle}`,
            title: channel.snippet.title,
            thumbnail: channel.snippet.thumbnails?.high?.url || "",
            ...channel.statistics
          },
          videos: [],
          message: "YouTube MARGE. connecté · en attente de la première vidéo publique."
        });
      }

      // Filet de sécurité : si YouTube annonce déjà des vidéos publiques mais que
      // la playlist d'uploads n'est pas lisible, on récupère les vidéos par channelId.
      // search.list est plus coûteux en quota, donc il n'est utilisé qu'en fallback.
      if (reason === "playlistNotFound" && publicVideoCount > 0) {
        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("channelId", channel.id);
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("order", "date");
        searchUrl.searchParams.set("maxResults", "25");
        searchUrl.searchParams.set("key", key);

        const searchResponse = await fetch(searchUrl, { next: { revalidate: 900 } });
        const searchPayload = await searchResponse.json();
        if (!searchResponse.ok) {
          throw new Error(searchPayload.error?.message || "Vidéos YouTube MARGE. indisponibles.");
        }
        ids = (searchPayload.items || []).map((item) => item.id?.videoId).filter(Boolean);
      } else if (reason !== "playlistNotFound") {
        throw new Error(playlistPayload.error?.message || "Uploads YouTube MARGE. indisponibles.");
      }
    }
    if (!ids.length) {
      return NextResponse.json({
        status: "ok",
        channel: { id: channel.id, handle: `@${handle}`, title: channel.snippet.title, thumbnail: channel.snippet.thumbnails?.high?.url || "", ...channel.statistics },
        videos: [],
        message: "Aucune vidéo publique MARGE. pour le moment."
      });
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics");
    videosUrl.searchParams.set("id", ids.join(","));
    videosUrl.searchParams.set("key", key);
    const videosResponse = await fetch(videosUrl, { next: { revalidate: 300 } });
    const videosPayload = await videosResponse.json();
    if (!videosResponse.ok) throw new Error(videosPayload.error?.message || "Statistiques YouTube MARGE. indisponibles.");

    const chronological = [...(videosPayload.items || [])].sort(
      (a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt)
    );

    const videos = chronological.map((video, index) => {
      const explicit = (video.snippet.title || "").match(/marge\s*[.#:_-]?\s*(\d{1,3})\b/i);
      const number = explicit ? explicit[1].padStart(3, "0") : String(index + 1).padStart(3, "0");
      return {
        id: video.id,
        _source: "youtube-marge",
        project: "MARGE.",
        dossier: number,
        title: video.snippet.title,
        hook: video.snippet.title,
        platform: "YouTube Shorts",
        views: Number(video.statistics.viewCount || 0),
        likes: Number(video.statistics.likeCount || 0),
        comments: Number(video.statistics.commentCount || 0),
        shares: 0,
        retention: null,
        completion: null,
        followers: 0,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || ""
      };
    });

    return NextResponse.json({
      status: "ok",
      channel: {
        id: channel.id,
        handle: `@${handle}`,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.high?.url || "",
        ...channel.statistics
      },
      videos,
      message: ""
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      channel: null,
      videos: [],
      message: error instanceof Error ? error.message : "Erreur YouTube MARGE. inconnue."
    }, { status: 500 });
  }
}
