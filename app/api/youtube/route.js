import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) {
    return NextResponse.json({
      status: 'setup',
      channel: null,
      videos: [],
      message: 'Ajoute YOUTUBE_API_KEY et YOUTUBE_CHANNEL_ID dans Vercel pour activer la synchronisation automatique.'
    });
  }

  try {
    const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    channelUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
    channelUrl.searchParams.set('id', channelId);
    channelUrl.searchParams.set('key', key);

    const channelRes = await fetch(channelUrl, { next: { revalidate: 300 } });
    const channelData = await channelRes.json();
    if (!channelRes.ok || !channelData.items?.length) throw new Error(channelData.error?.message || 'Chaîne introuvable');

    const channel = channelData.items[0];
    const uploads = channel.contentDetails.relatedPlaylists.uploads;

    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    playlistUrl.searchParams.set('part', 'snippet,contentDetails');
    playlistUrl.searchParams.set('playlistId', uploads);
    playlistUrl.searchParams.set('maxResults', '50');
    playlistUrl.searchParams.set('key', key);

    const playlistRes = await fetch(playlistUrl, { next: { revalidate: 300 } });
    const playlistData = await playlistRes.json();
    if (!playlistRes.ok) throw new Error(playlistData.error?.message || 'Vidéos indisponibles');

    const ids = playlistData.items.map(x => x.contentDetails.videoId);
    if (!ids.length) return NextResponse.json({status:'ok',channel:{title:channel.snippet.title,...channel.statistics},videos:[],message:''});

    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
    videosUrl.searchParams.set('id', ids.join(','));
    videosUrl.searchParams.set('key', key);

    const videosRes = await fetch(videosUrl, { next: { revalidate: 300 } });
    const videosData = await videosRes.json();
    if (!videosRes.ok) throw new Error(videosData.error?.message || 'Statistiques indisponibles');

    const videos = videosData.items.map((v,index) => {
      const match = v.snippet.title.match(/(?:dossier\s*(?:n[°ºo.]*)?\s*)?(\d{1,4})/i);
      return {
        id:v.id,
        dossier:match?.[1]?.padStart(3,'0') || String(index+1).padStart(3,'0'),
        title:v.snippet.title,
        publishedAt:v.snippet.publishedAt,
        thumbnail:v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
        views:Number(v.statistics.viewCount || 0),
        likes:Number(v.statistics.likeCount || 0),
        comments:Number(v.statistics.commentCount || 0)
      };
    });

    return NextResponse.json({
      status:'ok',
      channel:{title:channel.snippet.title,thumbnail:channel.snippet.thumbnails?.high?.url,...channel.statistics},
      videos,
      message:''
    });
  } catch (error) {
    return NextResponse.json({status:'error',channel:null,videos:[],message:error.message},{status:500});
  }
}
