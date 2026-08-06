import { NextResponse } from "next/server";

function localAnalysis(videos) {
  const ranked = [...videos].sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
  const best = ranked[0];
  const averageViews = videos.reduce((sum, video) => sum + Number(video.views || 0), 0) / videos.length;
  const averageRetention = videos.reduce((sum, video) => sum + Number(video.retention || 0), 0) / videos.length;

  return [
    `Meilleure performance actuelle : ${best?.title || "—"} sur ${best?.platform || "—"} avec ${best?.views || 0} vues.`,
    `Moyenne observée : ${Math.round(averageViews)} vues par entrée et ${averageRetention.toFixed(1)} % de rétention renseignée.`,
    "Test recommandé : conserve le même sujet sur plusieurs plateformes, mais compare deux hooks plus courts.",
    "Limite : avec peu de vidéos, ces résultats décrivent les données disponibles mais ne prouvent pas une cause."
  ].join("\n\n");
}

export async function POST(request) {
  const { videos = [] } = await request.json();

  if (!videos.length) {
    return NextResponse.json({ analysis: "Ajoute au moins une vidéo pour lancer l'analyse." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ analysis: localAnalysis(videos), mode: "local" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input:
          "Analyse ces statistiques de vidéos courtes en français. Donne ce qui fonctionne, ce qu'il faut tester, une recommandation concrète et les limites des données. Ne prétends jamais qu'une corrélation prouve une cause. Données : " +
          JSON.stringify(videos)
      })
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || "Analyse IA indisponible.");

    return NextResponse.json({
      analysis: payload.output_text || localAnalysis(videos),
      mode: "ai"
    });
  } catch (error) {
    return NextResponse.json({
      analysis: localAnalysis(videos),
      mode: "local",
      warning: error instanceof Error ? error.message : "Erreur IA."
    });
  }
}
