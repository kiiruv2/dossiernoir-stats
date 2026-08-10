export const defaultDossierSnapshots = [
  {id:"seed-d005-h1-yt",project:"Dossier Noir",dossier:"005",hours:1,platform:"YouTube Shorts",views:69,likes:null,comments:null,shares:null,scrollStop:39.7,retention:58.8,completion:null,avgViewDuration:20,followers:1,shownInFeed:null,capturedAt:"2026-08-10T20:00:00+02:00"},
  {id:"seed-d005-h1-tt",project:"Dossier Noir",dossier:"005",hours:1,platform:"TikTok",views:331,likes:7,comments:null,shares:null,scrollStop:null,retention:23.0,completion:6.8,avgViewDuration:7.59,followers:2,shownInFeed:null,capturedAt:"2026-08-10T20:00:00+02:00"},
  {id:"seed-d005-h1-ig",project:"Dossier Noir",dossier:"005",hours:1,platform:"Instagram Reels",views:6,likes:0,comments:0,shares:0,scrollStop:null,retention:null,completion:null,avgViewDuration:null,followers:0,shownInFeed:null,capturedAt:"2026-08-10T20:00:00+02:00"},
  {id:"seed-d005-h4-yt",project:"Dossier Noir",dossier:"005",hours:4,platform:"YouTube Shorts",views:647,likes:null,comments:null,shares:null,scrollStop:34.5,retention:52.9,completion:null,avgViewDuration:18,followers:3,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00",engagedViews:205,realtime60m:251,shortsFeed:96.4},
  {id:"seed-d005-h4-tt",project:"Dossier Noir",dossier:"005",hours:4,platform:"TikTok",views:772,likes:18,comments:0,shares:1,scrollStop:null,retention:22.8,completion:7.7,avgViewDuration:7.52,followers:7,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00",saves:3,forYou:98.5},
  {id:"seed-d005-h4-ig",project:"Dossier Noir",dossier:"005",hours:4,platform:"Instagram Reels",views:139,likes:1,comments:0,shares:0,scrollStop:null,retention:null,completion:null,avgViewDuration:null,followers:0,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00",accountsReached:123,nonFollowers:100}
];

export const defaultMargeSnapshots = [
  {id:"seed-m001-h4-yt",project:"MARGE.",dossier:"001",hours:4,platform:"YouTube Shorts",views:627,likes:23,comments:null,shares:null,scrollStop:45.9,retention:38.0,completion:null,avgViewDuration:14,followers:5,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00",engagedViews:278,realtime60m:280,shortsFeed:97.0},
  {id:"seed-m001-h4-tt",project:"MARGE.",dossier:"001",hours:4,platform:"TikTok",views:0,likes:0,comments:0,shares:0,scrollStop:null,retention:null,completion:null,avgViewDuration:null,followers:0,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00"},
  {id:"seed-m001-h4-ig",project:"MARGE.",dossier:"001",hours:4,platform:"Instagram Reels",views:82,likes:null,comments:null,shares:null,scrollStop:null,retention:null,completion:null,avgViewDuration:null,followers:null,shownInFeed:null,capturedAt:"2026-08-10T23:00:00+02:00"}
];

export function mergeSeedSnapshots(saved = [], seeds = []) {
  const key = x => `${x.project || ""}|${x.dossier}|${Number(x.hours)}|${x.platform}`;
  const savedKeys = new Set(saved.map(key));
  return [...saved, ...seeds.filter(x => !savedKeys.has(key(x)))];
}
