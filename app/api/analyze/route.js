import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const videos = body.videos || [];
  if (!videos.length) return NextResponse.json({analysis:"Ajoute au moins une vidéo pour lancer l'analyse."});

  const fallback = () => {
    const sorted = [...videos].sort((a,b)=>Number(b.views||0)-Number(a.views||0));
    const best = sorted[0];
    const avgRetention = videos.reduce((s,v)=>s+Number(v.retention||0),0)/videos.length;
    const avgViews = videos.reduce((s,v)=>s+Number(v.views||0),0)/videos.length;
    return [
      `Meilleure performance : ${best.title} sur ${best.platform} avec ${best.views} vues.`,
      `Rétention moyenne enregistrée : ${avgRetention.toFixed(1)} %.`,
      `Vues moyennes par entrée : ${Math.round(avgViews)}.`,
      "Conseil : raccourcis encore le hook, conserve les sous-titres lisibles et compare au moins 10 publications avant de tirer une conclusion.",
    ].join("\n\n");
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({analysis:fallback(), mode:"local"});
  }

  try {
    const prompt = `Tu es analyste de contenu court pour la chaîne française Dossier Noir.
Analyse ces statistiques sans inventer de causalité. Donne :
1) ce qui semble fonctionner,
2) ce qui doit être testé,
3) une recommandation concrète pour la prochaine vidéo,
4) les limites des données.
Réponse concise en français.
Données : ${JSON.stringify(videos)}`;

    const res = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL || "gpt-5.6-mini",
        input:prompt
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Analyse IA indisponible.");
    const text = data.output_text || data.output?.flatMap(x=>x.content||[]).map(x=>x.text||"").join("\n") || fallback();
    return NextResponse.json({analysis:text, mode:"ai"});
  } catch (error) {
    return NextResponse.json({analysis:fallback(), mode:"local", warning:error.message});
  }
}
