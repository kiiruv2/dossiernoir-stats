export function toNumber(value) {
  return Number(value || 0);
}

export function engagementRate(video) {
  const views = Math.max(toNumber(video.views), 1);
  return ((toNumber(video.likes) + toNumber(video.comments) * 2 + toNumber(video.shares) * 3) / views) * 100;
}

export function viralScore(video, medianViews = 1) {
  const relativeViews = Math.min(35, (toNumber(video.views) / Math.max(medianViews, 1)) * 18);
  const engagement = Math.min(25, engagementRate(video) * 2.2);
  const retention = Math.min(25, toNumber(video.retention) * 0.25);
  const completion = Math.min(15, toNumber(video.completion) * 0.15);
  return Math.round(Math.min(100, relativeViews + engagement + retention + completion));
}

export function estimateRevenue(video) {
  const rpms = {
    "YouTube Shorts": Number(process.env.NEXT_PUBLIC_YOUTUBE_RPM_EUR || 0.04),
    "TikTok": Number(process.env.NEXT_PUBLIC_TIKTOK_RPM_EUR || 0.02),
    "Instagram Reels": Number(process.env.NEXT_PUBLIC_INSTAGRAM_RPM_EUR || 0),
  };
  return (toNumber(video.views) / 1000) * (rpms[video.platform] || 0);
}

export function bestHour(videos) {
  const buckets = {};
  for (const video of videos) {
    const date = new Date(video.publishedAt || video.date);
    if (Number.isNaN(date.getTime())) continue;
    const hour = date.getHours();
    buckets[hour] ??= { views: 0, count: 0 };
    buckets[hour].views += toNumber(video.views);
    buckets[hour].count += 1;
  }
  return Object.entries(buckets)
    .map(([hour, value]) => ({ hour: Number(hour), average: value.views / value.count, count: value.count }))
    .sort((a, b) => b.average - a.average)[0] || null;
}
