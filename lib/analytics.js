export function number(value) {
  return Number(value || 0);
}

export function engagementRate(video) {
  const views = Math.max(number(video.views), 1);
  return ((number(video.likes) + number(video.comments) * 2 + number(video.shares) * 3) / views) * 100;
}

export function viralScore(video, baseline = {}) {
  const views = number(video.views);
  const er = engagementRate(video);
  const retention = number(video.retention);
  const completion = number(video.completion);
  const viewBaseline = Math.max(number(baseline.viewsMedian), 1);
  const velocity = Math.min(150, (views / viewBaseline) * 35);
  const score =
    Math.min(35, velocity) +
    Math.min(25, er * 2.5) +
    Math.min(25, retention * 0.25) +
    Math.min(15, completion * 0.15);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function revenueEstimate(video, rpms = {}) {
  const rpm = {
    "YouTube Shorts": Number(rpms.youtube ?? process.env.NEXT_PUBLIC_YOUTUBE_RPM_EUR ?? 0.04),
    "TikTok": Number(rpms.tiktok ?? process.env.NEXT_PUBLIC_TIKTOK_RPM_EUR ?? 0.02),
    "Instagram Reels": Number(rpms.instagram ?? process.env.NEXT_PUBLIC_INSTAGRAM_RPM_EUR ?? 0),
  }[video.platform] || 0;
  return (number(video.views) / 1000) * rpm;
}

export function extractHook(title = "") {
  const clean = title.replace(/^dossier\s*n?[°ºo.]?\s*\d+\s*[-–—:]?\s*/i, "").trim();
  return clean || title;
}

export function bestPublishingHour(videos = []) {
  const buckets = new Map();
  videos.forEach(v => {
    const d = new Date(v.publishedAt || v.date);
    if (Number.isNaN(d.getTime())) return;
    const hour = d.getHours();
    const current = buckets.get(hour) || {views:0,count:0};
    current.views += number(v.views);
    current.count += 1;
    buckets.set(hour, current);
  });
  const ranked = [...buckets.entries()]
    .map(([hour, x]) => ({hour, avgViews: x.views / x.count, count:x.count}))
    .sort((a,b) => b.avgViews - a.avgViews);
  return ranked[0] || null;
}
