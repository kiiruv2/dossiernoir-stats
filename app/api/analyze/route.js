import { NextResponse } from "next/server";
const n=(v)=>v===null||v===undefined?null:Number(v);
function localAnalysis(dossiers=[],targets={}) {
 if(!dossiers.length) return "Ajoute au moins un dossier pour lancer l'analyse.";
 const latest=dossiers[dossiers.length-1], prev=dossiers[dossiers.length-2];
 const hook=n(latest.scrollStop), retention=n(latest.retention), completion=n(latest.completion);
 const lines=[`DOSSIER ${latest.dossier} — DIAGNOSTIC`];
 if(retention!==null&&retention>=85) lines.push(`Montage : excellent (${retention.toFixed(1)} % de rétention). Ne change pas le rythme général.`);
 else if(retention!==null) lines.push(`Montage : ${retention.toFixed(1)} % de rétention. Le rythme reste un levier d'amélioration.`);
 else lines.push("Montage : rétention non renseignée.");
 if(hook!==null&&hook<50) lines.push(`Hook : priorité n°1. ${hook.toFixed(1)} % ont continué à regarder. Travaille surtout les 1–2 premières secondes.`);
 else if(hook!==null) lines.push(`Hook : solide à ${hook.toFixed(1)} %.`);
 else lines.push("Hook : taux « ont continué à regarder » non renseigné.");
 if(completion===null) lines.push("Fin : complétion non renseignée, donc aucune conclusion fiable sur l'outro.");
 else lines.push(`Fin : ${completion.toFixed(1)} % de complétion.`);
 if(prev){const dv=((latest.views-prev.views)/Math.max(prev.views,1))*100;lines.push(`Diffusion : ${latest.views} vues, soit ${dv>=0?"+":""}${dv.toFixed(0)} % par rapport au Dossier ${prev.dossier}.`);}
 lines.push(`MISSION DOSSIER ${targets.dossier||"suivant"} : viser au moins ${targets.scrollStop||50} % d'arrêt du scroll tout en conservant environ ${targets.retention||80} % ou plus de rétention.`);
 lines.push("Test recommandé : change le hook, pas tout le montage. Une seule variable majeure à la fois.");
 lines.push("Limite : ces métriques décrivent la performance observée ; elles ne prouvent pas à elles seules la cause de la diffusion.");
 return lines.join("\n\n");
}
export async function POST(request){
 const {videos=[],dossiers=[],targets={}}=await request.json();
 const fallback=localAnalysis(dossiers,targets);
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({analysis:fallback,mode:"strategic-local"});
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({
   model:process.env.OPENAI_MODEL||"gpt-5.4-mini",
   input:`Tu es l'assistant stratégique de Dossier Noir. Analyse dossier par dossier. Sépare strictement hook (ont continué à regarder), montage (rétention), fin (complétion), diffusion (vues/engagement). Une métrique absente ne doit jamais être interprétée comme 0. Si rétention >=85% et hook <50%, dis que le montage est excellent et que la priorité est uniquement les 1–2 premières secondes. Compare au dossier précédent. Recommande UNE modification prioritaire. Ne confonds jamais corrélation et causalité. Réponds en français, court et opérationnel.\nDossiers:${JSON.stringify(dossiers)}\nObjectifs:${JSON.stringify(targets)}`
  })});
  const payload=await response.json(); if(!response.ok)throw new Error(payload.error?.message||"Analyse IA indisponible.");
  return NextResponse.json({analysis:payload.output_text||fallback,mode:"ai"});
 }catch(error){return NextResponse.json({analysis:fallback,mode:"strategic-local",warning:error instanceof Error?error.message:"Erreur IA."});}
}