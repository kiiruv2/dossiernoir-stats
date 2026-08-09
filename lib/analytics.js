
export function normalizeDossier(video = {}) {
  const text = `${video.title || ""} ${video.hook || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/dyatlov|randonneur|col\s+dyatlov/.test(text)) return "001";
  if (/mh\s*370|vol\s+mh|avion|239\s+personnes/.test(text)) return "002";
  if (/mary\s+celeste|navire|bateau\s+fantome|bateau.*vide/.test(text)) return "003";

  const raw = String(video.dossier || "").trim();
  if (/^\d{1,3}$/.test(raw)) return raw.padStart(3, "0");
  return "HORS-SERIE";
}

export function toNumber(value) {
  return Number(value || 0);
}

export function engagementRate(video) {
  const views = Math.max(toNumber(video.views), 1);
  return ((toNumber(video.likes) + toNumber(video.comments) * 2 + toNumber(video.shares) * 3) / views) * 100;
}

export function viralScore(video, medianViews = 1) {
  const relativeViews = Math.min(28, (toNumber(video.views) / Math.max(medianViews, 1)) * 15);
  const engagement = Math.min(20, engagementRate(video) * 1.8);
  const retention = Math.min(24, toNumber(video.retention) * 0.24);
  const completion = Math.min(13, toNumber(video.completion) * 0.13);
  const scrollStop = Math.min(15, toNumber(video.scrollStop) * 0.15);
  return Math.round(Math.min(100, relativeViews + engagement + retention + completion + scrollStop));
}

export function estimateRevenue(video) {
  const rpms = {
    "YouTube Shorts": Number(process.env.NEXT_PUBLIC_YOUTUBE_RPM_EUR || 0.04),
    TikTok: Number(process.env.NEXT_PUBLIC_TIKTOK_RPM_EUR || 0.02),
    "Instagram Reels": Number(process.env.NEXT_PUBLIC_INSTAGRAM_RPM_EUR || 0)
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

export function groupByDossier(videos) {
  const groups = new Map();
  videos.forEach((video) => {
    const key = normalizeDossier(video);
    if (key === "HORS-SERIE") return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...video, dossier: key });
  });

  return [...groups.entries()].map(([dossier, items]) => {
    const views = items.reduce((sum, item) => sum + toNumber(item.views), 0);
    const weight = Math.max(views, 1);
    const weighted = (field) => items.reduce((sum, item) => sum + toNumber(item[field]) * toNumber(item.views), 0) / weight;
    const interactions = items.reduce((sum, item) => sum + toNumber(item.likes) + toNumber(item.comments) + toNumber(item.shares), 0);
    const scores = items.map((item) => toNumber(item.score));
    return {
      dossier,
      title: items[0]?.title || `Dossier ${dossier}`,
      hook: items[0]?.hook || "",
      views,
      interactions,
      retention: weighted("retention"),
      completion: weighted("completion"),
      scrollStop: weighted("scrollStop"),
      engagement: items.reduce((sum, item) => sum + engagementRate(item) * toNumber(item.views), 0) / weight,
      score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      platforms: items.length,
      publishedAt: items[0]?.publishedAt,
      items
    };
  }).sort((a, b) => Number(a.dossier) - Number(b.dossier));
}

export function diagnosticFor(dossier) {
  if (!dossier) return { label: "Données insuffisantes", tone: "warning", message: "Ajoute les premières statistiques pour lancer le diagnostic." };
  if (dossier.scrollStop && dossier.scrollStop < 50) return { label: "HOOK À RENFORCER", tone: "danger", message: `Seulement ${dossier.scrollStop.toFixed(1)} % continuent à regarder. Le montage après 2 secondes est solide, mais l'ouverture perd trop de monde.` };
  if (dossier.retention && dossier.retention < 75) return { label: "RYTHME À RESSERRER", tone: "warning", message: `La rétention moyenne est de ${dossier.retention.toFixed(1)} %. Coupe les respirations et accélère les changements de plans.` };
  if (dossier.completion && dossier.completion < 60) return { label: "FIN À OPTIMISER", tone: "warning", message: `La complétion est de ${dossier.completion.toFixed(1)} %. Raccourcis la résolution et rapproche l'outro.` };
  return { label: "STRUCTURE SOLIDE", tone: "success", message: "Le hook et la rétention sont équilibrés. Conserve cette structure et teste seulement une ouverture plus agressive." };
}

export function nextTargets(dossiers) {
  if (!dossiers.length) return { dossier: "001", scrollStop: 50, retention: 80, completion: 60, views: 1000 };
  const latest = dossiers[dossiers.length - 1];
  const bestViews = Math.max(...dossiers.map((item) => item.views));
  const bestRetention = Math.max(...dossiers.map((item) => item.retention || 0));
  const bestScroll = Math.max(...dossiers.map((item) => item.scrollStop || 0));
  const bestCompletion = Math.max(...dossiers.map((item) => item.completion || 0));
  return {
    dossier: String(Number(latest.dossier) + 1).padStart(3, "0"),
    views: Math.ceil(bestViews * 1.15 / 100) * 100,
    retention: Math.min(100, Math.ceil(bestRetention + 2)),
    scrollStop: Math.min(100, Math.ceil(bestScroll + 5)),
    completion: Math.min(100, Math.ceil(bestCompletion + 3))
  };
}
