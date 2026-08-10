import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) {
    return NextResponse.json({
      status: "setup",
      channel: null,
      videos: [],
      message: "Ajoute YOUTUBE_API_KEY et YOUTUBE_CHANNEL_ID dans Vercel."
    });
  }

  try {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", key);

    const channelResponse = await fetch(channelUrl, { next: { revalidate: 300 } });
    const channelPayload = await channelResponse.json();

    if (!channelResponse.ok || !channelPayload.items?.length) {
      throw new Error(channelPayload.error?.message || "Chaîne YouTube introuvable.");
    }

    const channel = channelPayload.items[0];
    const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylist) {
      return NextResponse.json({
        status: "ok",
        channel: { title: channel.snippet.title, ...channel.statistics },
        videos: [],
        message: "La playlist d'uploads n'est pas encore disponible."
      });
    }

    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "snippet,contentDetails");
    playlistUrl.searchParams.set("playlistId", uploadsPlaylist);
    playlistUrl.searchParams.set("maxResults", "50");
    playlistUrl.searchParams.set("key", key);

    const playlistResponse = await fetch(playlistUrl, { next: { revalidate: 300 } });
    const playlistPayload = await playlistResponse.json();

    if (!playlistResponse.ok) {
      const reason = playlistPayload.error?.errors?.[0]?.reason;
      if (reason === "playlistNotFound") {
        return NextResponse.json({
          status: "ok",
          channel: { title: channel.snippet.title, ...channel.statistics },
          videos: [],
          message: "La chaîne n'a pas encore de playlist publique active. Réessaie après la première publication."
        });
      }
      throw new Error(playlistPayload.error?.message || "Playlist YouTube indisponible.");
    }

    const ids = (playlistPayload.items || []).map((item) => item.contentDetails.videoId);

    if (!ids.length) {
      return NextResponse.json({
        status: "ok",
        channel: { title: channel.snippet.title, ...channel.statistics },
        videos: [],
        message: "Aucune vidéo publique pour le moment."
      });
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics");
    videosUrl.searchParams.set("id", ids.join(","));
    videosUrl.searchParams.set("key", key);

    const videosResponse = await fetch(videosUrl, { next: { revalidate: 300 } });
    const videosPayload = await videosResponse.json();

    if (!videosResponse.ok) {
      throw new Error(videosPayload.error?.message || "Statistiques YouTube indisponibles.");
    }

    function identifyDossier(title = "") {
      const normalized = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      // Priorité absolue à un numéro explicitement précédé du mot « dossier ».
      const explicit = normalized.match(/dossier\s*(?:n(?:umero)?\s*)?[°ºo.:-]*\s*(\d{1,3})\b/i);
      if (explicit) return explicit[1].padStart(3, "0");

      // Mapping éditorial verrouillé : aucun nombre isolé du titre ne peut créer un dossier.
      if (/dyatlov|randonneur|col\s+dyatlov/.test(normalized)) return "001";
      if (/mh\s*370|vol\s+mh|avion|239\s+personnes/.test(normalized)) return "002";
      if (/mary\s+celeste|navire|bateau\s+fantome|bateau.*vide/.test(normalized)) return "003";
      if (/flannan|iles?\s+flannan|phare|gardiens?.*(?:phare|dispar)|(?:trois|3)\s+gardiens/.test(normalized)) return "004";

      return null;
    }

    // L'ordre de l'API YouTube est inversé (plus récent d'abord), donc on ne l'utilise
    // jamais pour numéroter les dossiers. Les vidéos non reconnues restent hors série.
    const videos = videosPayload.items.map((video) => {
      const dossier = identifyDossier(video.snippet.title);
      return {
        id: video.id,
        dossier: dossier || "HORS-SERIE",
        title: video.snippet.title,
        hook: video.snippet.title,
        platform: "YouTube Shorts",
        views: Number(video.statistics.viewCount || 0),
        likes: Number(video.statistics.likeCount || 0),
        comments: Number(video.statistics.commentCount || 0),
        shares: 0,
        retention: 0,
        completion: 0,
        followers: 0,
        publishedAt: video.snippet.publishedAt,
        thumbnail:
          video.snippet.thumbnails?.maxres?.url ||
          video.snippet.thumbnails?.high?.url ||
          video.snippet.thumbnails?.medium?.url ||
          ""
      };
    });

    return NextResponse.json({
      status: "ok",
      channel: {
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
      message: error instanceof Error ? error.message : "Erreur YouTube inconnue."
    }, { status: 500 });
  }
}
