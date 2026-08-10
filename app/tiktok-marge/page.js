"use client";
import { useEffect, useState } from "react";
export default function TikTokMargeConnectionPage(){
 const [data,setData]=useState({status:"loading",user:null,videos:[],message:""});
 useEffect(()=>{fetch("/api/tiktok-marge",{cache:"no-store"}).then(r=>r.json()).then(setData).catch(()=>setData({status:"error",user:null,videos:[],message:"Impossible de charger TikTok MARGE."}))},[]);
 return <main className="standalone project-marge"><a className="back-link" href="/">← Retour au Content Lab</a><header><p className="eyebrow">MARGE. · CONNEXION OFFICIELLE</p><h1>TikTok MARGE.</h1><p>Connecte @MARGE. à la même application TikTok afin d'importer automatiquement les vues, likes, commentaires et partages.</p></header><section className="panel">
 {data.status==="loading"&&<p>Vérification de la connexion…</p>}
 {data.status==="disconnected"&&<div className="tiktok-connect-card"><h2>Compte MARGE. non connecté</h2><p>Utilise le compte TikTok MARGE. sur l'écran d'autorisation TikTok.</p><a className="primary tiktok-auth-button" href="/api/auth/tiktok-marge/start">Connecter TikTok MARGE.</a></div>}
 {data.status==="connected"&&<div className="tiktok-connect-card"><p className="eyebrow">COMPTE CONNECTÉ</p><h2>{data.user?.display_name||"MARGE."}</h2><p>{data.user?.follower_count||0} abonnés · {data.user?.likes_count||0} J’aime · {data.videos.length} vidéo(s) synchronisée(s)</p><div className="tiktok-actions"><a className="primary" href="/">Ouvrir MARGE. Control Center</a><a className="tiktok-secondary" href="/api/auth/tiktok-marge/disconnect">Déconnecter</a></div></div>}
 {data.status==="error"&&<div className="tiktok-connect-card"><h2>Connexion impossible</h2><p>{data.message}</p><a className="primary" href="/api/auth/tiktok-marge/start">Réessayer</a></div>}
 </section></main>
}
