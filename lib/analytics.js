
export function normalizeDossier(video = {}) {
  const text = `${video.title || ""} ${video.hook || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/dyatlov|randonneur|col\s+dyatlov/.test(text)) return "001";
  if (/mh\s*370|vol\s+mh|avion|239\s+personnes/.test(text)) return "002";
  if (/mary\s+celeste|navire|bateau\s+fantome|bateau.*vide/.test(text)) return "003";
  if (/flannan|iles?\s+flannan|phare|gardiens?.*(?:phare|dispar)|(?:trois|3)\s+gardiens/.test(text)) return "004";
  if (/hinterkaifeck|6\s+morts|six\s+morts|cette\s+ferme/.test(text)) return "005";
  if (/emile|haut[-\s]?vernet|ossements|deplace.*ossements|zone de recherches/.test(text)) return "006";

  const raw = String(video.dossier || "").trim();
  if (/^\d{1,3}$/.test(raw)) return raw.padStart(3, "0");
  return "HORS-SERIE";
}

export const historicalStudioMetrics = {
  "001": {
    "YouTube Shorts": { views:329, scrollStop:47.8, retention:87.5, avgWatch:35, duration:40 },
    "TikTok": { views:843, retention:20.0, completion:3.8, avgWatch:7.8, duration:39, followers:1, likes:7, comments:1, shares:2, saves:2, fyp:95.1 }
  },
  "002": {
    "YouTube Shorts": { views:1500, scrollStop:42.7, retention:56.25, avgWatch:18, duration:32 },
    "TikTok": { views:1025, retention:22.6, completion:7.7, avgWatch:7.0, duration:31, followers:1, likes:5, comments:0, shares:3, saves:1, fyp:84.9 }
  },
  "003": {
    "YouTube Shorts": { views:1500, scrollStop:45.5, retention:89.7, avgWatch:26, duration:29, followers:4 },
    "TikTok": { views:781, retention:31.2, completion:12.1, avgWatch:8.74, duration:28, followers:4, likes:14, comments:0, shares:4, saves:5, fyp:96.8 }
  },
  "004": {
    "YouTube Shorts": { views:926, scrollStop:42.6, retention:70.6, avgWatch:24, duration:34 },
    "TikTok": { views:286, retention:23.6, completion:9.5, avgWatch:7.79, duration:33, followers:1, likes:10, comments:1, shares:0, saves:1, fyp:95.3 }
  },
  "005": {
    "YouTube Shorts": { views:707, scrollStop:34.4, retention:55.9, avgWatch:19, duration:34 },
    "TikTok": { views:812, retention:24.2, completion:8.2, avgWatch:7.98, duration:33, followers:7, likes:22, comments:0, shares:1, saves:4, fyp:98.2 }
  }
};

export const editorialMetrics = Object.fromEntries(Object.entries(historicalStudioMetrics).map(([id,rows])=>[id,{scrollStop:rows["YouTube Shorts"]?.scrollStop??null,retention:rows["YouTube Shorts"]?.retention??null,completion:null,source:"Studio historique vérifié"}]));

// Les API publiques ne donnent pas toutes les métriques Studio. On complète uniquement
// avec les valeurs historiques vérifiées, et on garde les données absentes à null (jamais 0 par défaut).
export function applyEditorialMetrics(video = {}) {
  const dossier = normalizeDossier(video);
  const platform = String(video.platform || "");
  const studio = historicalStudioMetrics[dossier]?.[platform];
  if (!studio) return { ...video, dossier };
  return { ...video, dossier, ...studio, scrollStop: studio.scrollStop ?? video.scrollStop ?? null, retention: studio.retention ?? video.retention ?? null, completion: studio.completion ?? video.completion ?? null };
}
export function metricValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
    const weightedKnown = (field) => {
      const known = items.filter(item => metricValue(item[field]) !== null && metricValue(item[field]) > 0);
      if (!known.length) return null;
      const knownViews = known.reduce((sum,item)=>sum + Math.max(toNumber(item.views),1),0);
      return known.reduce((sum,item)=>sum + metricValue(item[field]) * Math.max(toNumber(item.views),1),0) / knownViews;
    };
    const editorial = editorialMetrics[dossier] || {};
    const retention = weightedKnown("retention") ?? metricValue(editorial.retention);
    const completion = weightedKnown("completion") ?? metricValue(editorial.completion);
    const scrollStop = weightedKnown("scrollStop") ?? metricValue(editorial.scrollStop);
    const interactions = items.reduce((sum, item) => sum + toNumber(item.likes) + toNumber(item.comments) + toNumber(item.shares), 0);
    const scores = items.map((item) => toNumber(item.score));
    return { dossier, title: items[0]?.title || `Dossier ${dossier}`, hook: items[0]?.hook || "", views, interactions,
      retention, completion, scrollStop,
      engagement: items.reduce((sum,item)=>sum+engagementRate(item)*toNumber(item.views),0)/Math.max(views,1),
      score: scores.length ? Math.round(scores.reduce((x,y)=>x+y,0)/scores.length) : 0,
      platforms: items.length, publishedAt: items[0]?.publishedAt, metricSource: editorial.source || null, items };
  }).sort((a,b)=>Number(a.dossier)-Number(b.dossier));
}

export function diagnosticFor(dossier) {
  if (!dossier) return { label:"DONNÉES INSUFFISANTES",tone:"warning",message:"Ajoute les premières statistiques pour lancer le diagnostic." };
  const hook=metricValue(dossier.scrollStop), retention=metricValue(dossier.retention), completion=metricValue(dossier.completion);
  if (hook !== null && hook < 50 && retention !== null && retention >= 85)
    return { label:"HOOK À RENFORCER",tone:"danger",message:`Montage excellent : ${retention.toFixed(1)} % de rétention. Le frein principal est l'ouverture : ${hook.toFixed(1)} % ont continué à regarder. Pour le prochain dossier, conserve le rythme et concentre les changements sur les 1–2 premières secondes.` };
  if (hook !== null && hook < 50) return {label:"HOOK À RENFORCER",tone:"danger",message:`${hook.toFixed(1)} % ont continué à regarder. Le premier levier est l'ouverture de la vidéo.`};
  if (retention !== null && retention < 75) return {label:"RYTHME À RESSERRER",tone:"warning",message:`La rétention moyenne est de ${retention.toFixed(1)} %. Le rythme reste un levier d'amélioration.`};
  if (completion !== null && completion < 60) return {label:"FIN À OPTIMISER",tone:"warning",message:`La complétion est de ${completion.toFixed(1)} %. Raccourcis la résolution et rapproche l'outro.`};
  if (hook === null && retention === null) return {label:"MÉTRIQUES À AJOUTER",tone:"warning",message:"Les vues sont synchronisées, mais les métriques Studio du hook et de rétention ne sont pas encore renseignées."};
  return {label:"STRUCTURE SOLIDE",tone:"success",message:"Les métriques disponibles sont solides. Conserve la structure et ne modifie qu'une variable à la fois."};
}

export function nextTargets(dossiers) {
  if (!dossiers.length) return { dossier:"001",scrollStop:50,retention:80,completion:60,views:1000 };
  const latest=dossiers[dossiers.length-1];
  // D005 est le test direct issu du diagnostic D004 : renforcer les 2 premières secondes.
  if (latest?.dossier === "004") return { dossier:"005", scrollStop:50, retention:70, completion:60, views:1000 };
  const known=(field)=>dossiers.map(d=>metricValue(d[field])).filter(v=>v!==null&&v>0);
  const bestViews=Math.max(...dossiers.map(item=>item.views));
  const rv=known("retention"), sv=known("scrollStop"), cv=known("completion");
  const bestRetention=rv.length?Math.max(...rv):80, bestScroll=sv.length?Math.max(...sv):45, bestCompletion=cv.length?Math.max(...cv):60;
  return { dossier:String(Number(latest.dossier)+1).padStart(3,"0"), views:Math.ceil(bestViews*1.15/100)*100,
    retention:Math.min(100,Math.ceil(bestRetention)), scrollStop:Math.min(100,Math.max(50,Math.ceil(bestScroll+5))),
    completion:Math.min(100,Math.ceil(bestCompletion)) };
}
