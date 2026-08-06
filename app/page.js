'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { demoTrend, demoVideos } from "../lib/demo";
import { bestPublishingHour, engagementRate, extractHook, revenueEstimate, viralScore } from "../lib/analytics";

const fmt = n => new Intl.NumberFormat("fr-FR", {notation:Number(n)>999999?"compact":"standard", maximumFractionDigits:1}).format(Number(n||0));
const euro = n => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(Number(n||0));

function Badge({children, tone=""}) { return <span className={`badge ${tone}`}>{children}</span>; }
function Kpi({label,value,detail,accent=""}) {
  return <article className={`kpi ${accent}`}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}
function Score({value}) {
  return <div className="score-ring" style={{"--score":`${value*3.6}deg`}}><span>{value}</span><small>/100</small></div>;
}
function Platform({name}) {
  const tone = name.includes("YouTube")?"yt":name.includes("TikTok")?"tt":"ig";
  return <Badge tone={tone}>{name}</Badge>;
}

export default function Home() {
  const [youtube,setYoutube] = useState({status:"loading",videos:[],message:""});
  const [manual,setManual] = useState([]);
  const [analysis,setAnalysis] = useState("");
  const [analyzing,setAnalyzing] = useState(false);
  const [demoMode,setDemoMode] = useState(true);
  const [view,setView] = useState("dashboard");

  useEffect(()=>{
    fetch("/api/youtube").then(r=>r.json()).then(setYoutube).catch(()=>setYoutube({status:"error",videos:[],message:"Erreur YouTube"}));
    try { setManual(JSON.parse(localStorage.getItem("dn-manual-v3")||"[]")); } catch {}
  },[]);

  const liveVideos = useMemo(()=>[...(youtube.videos||[]),...manual],[youtube,manual]);
  const videos = demoMode && !liveVideos.length ? demoVideos : liveVideos;
  const baseline = useMemo(()=>{
    const views = videos.map(v=>Number(v.views||0)).sort((a,b)=>a-b);
    return {viewsMedian:views.length?views[Math.floor(views.length/2)]:1};
  },[videos]);

  const enriched = useMemo(()=>videos.map(v=>({
    ...v,
    hook:v.hook||extractHook(v.title),
    score:viralScore(v,baseline),
    revenue:revenueEstimate(v),
    er:engagementRate(v)
  })),[videos,baseline]);

  const totals = useMemo(()=>enriched.reduce((a,v)=>({
    views:a.views+Number(v.views||0), likes:a.likes+Number(v.likes||0),
    comments:a.comments+Number(v.comments||0), shares:a.shares+Number(v.shares||0),
    followers:a.followers+Number(v.followers||0), revenue:a.revenue+Number(v.revenue||0)
  }),{views:0,likes:0,comments:0,shares:0,followers:0,revenue:0}),[enriched]);

  const best = [...enriched].sort((a,b)=>b.score-a.score)[0];
  const bestHour = bestPublishingHour(enriched);
  const hookRanking = [...enriched].sort((a,b)=>b.score-a.score);
  const platformData = ["TikTok","YouTube Shorts","Instagram Reels"].map(platform=>({
    platform,
    views:enriched.filter(v=>v.platform===platform).reduce((s,v)=>s+Number(v.views||0),0)
  }));
  const trend = demoMode && !liveVideos.length ? demoTrend : enriched.map((v,i)=>({label:`Vidéo ${i+1}`,views:Number(v.views||0)}));
  const calendar = [...enriched].sort((a,b)=>new Date(a.publishedAt||a.date)-new Date(b.publishedAt||b.date));

  async function runAnalysis(){
    setAnalyzing(true);
    const r = await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({videos:enriched})});
    const d = await r.json();
    setAnalysis(d.analysis||"Analyse indisponible.");
    setAnalyzing(false);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/"><span>DN</span><div><b>DOSSIER <em>NOIR</em></b><small>CONTROL CENTER V3</small></div></a>
      <nav>
        {[
          ["dashboard","Vue d'ensemble","◫"],["videos","Vidéos","▶"],["ai","Analyse IA","✦"],
          ["calendar","Calendrier","▦"],["hooks","Hooks","⌁"],["alerts","Alertes","!"]
        ].map(([id,label,icon])=><button key={id} className={view===id?"active":""} onClick={()=>setView(id)}><span>{icon}</span>{label}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <label className="demo-switch"><input type="checkbox" checked={demoMode} onChange={e=>setDemoMode(e.target.checked)}/><span></span>Mode démo</label>
        <a href="/admin">Administration</a>
      </div>
    </aside>

    <main className="content">
      <header className="topbar">
        <div><p className="eyebrow">DOSSIER NOIR · ANALYTICS</p><h1>{{
          dashboard:"Vue d'ensemble",videos:"Performances vidéo",ai:"Analyse IA",
          calendar:"Calendrier",hooks:"Classement des hooks",alerts:"Centre d'alertes"
        }[view]}</h1></div>
        <div className="top-actions">
          <Badge tone={youtube.status==="ok"?"success":"warn"}>{youtube.status==="ok"?"YouTube connecté":"YouTube en attente"}</Badge>
          <span className="live"><i></i> Synchronisation horaire</span>
        </div>
      </header>

      {view==="dashboard" && <>
        <section className="kpis">
          <Kpi label="Vues cumulées" value={fmt(totals.views)} detail={`${enriched.length} entrées analysées`} />
          <Kpi label="Interactions" value={fmt(totals.likes+totals.comments+totals.shares)} detail={`${totals.views?((totals.likes+totals.comments+totals.shares)/totals.views*100).toFixed(1):0}% des vues`} />
          <Kpi label="Abonnés gagnés" value={`+${fmt(totals.followers)}`} detail="Toutes plateformes" />
          <Kpi label="Revenus estimés" value={euro(totals.revenue)} detail="Estimation, pas un revenu réel" accent="red" />
        </section>

        <section className="grid-main">
          <article className="panel chart-panel">
            <div className="panel-head"><div><p>ÉVOLUTION</p><h2>Vues dans le temps</h2></div><Badge tone="success">LIVE</Badge></div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e53935" stopOpacity=".45"/><stop offset="100%" stopColor="#e53935" stopOpacity="0"/></linearGradient></defs>
                  <CartesianGrid stroke="#272727" vertical={false}/>
                  <XAxis dataKey="label" stroke="#777" tickLine={false} axisLine={false}/>
                  <YAxis stroke="#777" tickLine={false} axisLine={false} width={42}/>
                  <Tooltip contentStyle={{background:"#111",border:"1px solid #333",borderRadius:8}}/>
                  <Area type="monotone" dataKey="views" stroke="#e53935" fill="url(#redFill)" strokeWidth={3} isAnimationActive/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel best-card">
            <div className="panel-head"><div><p>PERFORMANCE</p><h2>Score de viralité</h2></div></div>
            {best ? <>
              <Score value={best.score}/>
              <h3>Dossier N°{best.dossier}</h3>
              <p>{best.title}</p>
              <div className="mini-stats"><span>{fmt(best.views)} vues</span><span>{best.er.toFixed(1)}% engagement</span></div>
            </>:<div className="empty">Aucune donnée</div>}
          </article>
        </section>

        <section className="grid-secondary">
          <article className="panel">
            <div className="panel-head"><div><p>PLATEFORMES</p><h2>Répartition des vues</h2></div></div>
            <div className="chart-box small">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical">
                  <CartesianGrid stroke="#272727" horizontal={false}/>
                  <XAxis type="number" hide/>
                  <YAxis dataKey="platform" type="category" width={115} stroke="#aaa" axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"#111",border:"1px solid #333"}}/>
                  <Bar dataKey="views" fill="#e53935" radius={[0,6,6,0]} isAnimationActive/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel insight-card">
            <div className="panel-head"><div><p>OPTIMISATION</p><h2>Meilleure heure</h2></div></div>
            <strong>{bestHour ? `${String(bestHour.hour).padStart(2,"0")}h00` : "—"}</strong>
            <p>{bestHour ? `${fmt(bestHour.avgViews)} vues moyennes sur ${bestHour.count} publication(s).` : "Publie plusieurs vidéos pour calculer cette donnée."}</p>
            <small>Corrélation descriptive uniquement.</small>
          </article>

          <article className="panel alert-card">
            <div className="panel-head"><div><p>ALERTE</p><h2>Vidéo en accélération</h2></div></div>
            {best && best.score>=70 ? <><Badge tone="danger">POTENTIEL VIRAL</Badge><h3>{best.title}</h3><p>Son score dépasse le seuil configuré de 70/100.</p></> : <div className="empty compact">Aucune alerte active</div>}
          </article>
        </section>

        <section className="panel ranking">
          <div className="panel-head"><div><p>CLASSEMENT</p><h2>Meilleures vidéos</h2></div><button onClick={()=>setView("videos")}>Voir tout →</button></div>
          <div className="rank-list">
            {hookRanking.slice(0,5).map((v,i)=><div className="rank-row" key={`${v.platform}-${v.id}`}>
              <b>#{i+1}</b><div className="fake-thumb">{v.thumbnail?<img src={v.thumbnail} alt=""/>:<span>DN</span>}</div>
              <div className="rank-title"><strong>Dossier {v.dossier} · {v.title}</strong><Platform name={v.platform}/></div>
              <span>{fmt(v.views)} vues</span><Score value={v.score}/>
            </div>)}
          </div>
        </section>
      </>}

      {view==="videos" && <section className="panel">
        <div className="panel-head"><div><p>CATALOGUE</p><h2>Toutes les performances</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Dossier</th><th>Plateforme</th><th>Vues</th><th>Engagement</th><th>Rétention</th><th>Viralité</th><th>Revenu estimé</th></tr></thead>
        <tbody>{enriched.map(v=><tr key={`${v.platform}-${v.id}`}><td><b>N°{v.dossier}</b><span>{v.title}</span></td><td><Platform name={v.platform}/></td><td>{fmt(v.views)}</td><td>{v.er.toFixed(1)}%</td><td>{v.retention||0}%</td><td><strong className={v.score>=70?"hot":""}>{v.score}/100</strong></td><td>{euro(v.revenue)}</td></tr>)}</tbody></table></div>
      </section>}

      {view==="ai" && <section className="ai-layout">
        <article className="panel ai-panel">
          <div className="panel-head"><div><p>ASSISTANT STRATÉGIQUE</p><h2>Analyse de la chaîne</h2></div><Badge tone={process.env.NEXT_PUBLIC_OPENAI_ENABLED?"success":"warn"}>IA / LOCAL</Badge></div>
          <button className="primary" onClick={runAnalysis} disabled={analyzing}>{analyzing?"Analyse en cours...":"Analyser mes performances"}</button>
          <div className="analysis-output">{analysis || "Lance l'analyse pour obtenir un diagnostic basé sur les statistiques disponibles."}</div>
        </article>
        <article className="panel checklist">
          <div className="panel-head"><div><p>MÉTHODE</p><h2>Ce que l'analyse vérifie</h2></div></div>
          <ul><li>Hook et potentiel d'arrêt du scroll</li><li>Rétention et taux de complétion</li><li>Engagement par plateforme</li><li>Heure et fréquence de publication</li><li>Limites statistiques et tests à réaliser</li></ul>
        </article>
      </section>}

      {view==="calendar" && <section className="panel calendar-panel">
        <div className="panel-head"><div><p>PLANIFICATION</p><h2>Calendrier des publications</h2></div><a href="/calendar">Ouvrir la vue complète →</a></div>
        <div className="calendar-grid">{calendar.map(v=><article key={`${v.platform}-${v.id}`}><time>{new Date(v.publishedAt||v.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"})}</time><strong>Dossier {v.dossier}</strong><span>{new Date(v.publishedAt||v.date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span><Platform name={v.platform}/></article>)}</div>
      </section>}

      {view==="hooks" && <section className="panel">
        <div className="panel-head"><div><p>COPYWRITING</p><h2>Classement des meilleurs hooks</h2></div></div>
        <div className="hook-list">{hookRanking.map((v,i)=><article key={`${v.platform}-${v.id}`}><b>#{i+1}</b><div><h3>“{v.hook}”</h3><p>{v.platform} · {fmt(v.views)} vues · {v.er.toFixed(1)}% engagement</p></div><Score value={v.score}/></article>)}</div>
      </section>}

      {view==="alerts" && <section className="alerts-grid">
        <article className="panel">
          <div className="panel-head"><div><p>NOTIFICATIONS</p><h2>Règles actives</h2></div></div>
          <div className="rule"><span>Score de viralité ≥ 70</span><Badge tone="success">ACTIF</Badge></div>
          <div className="rule"><span>Vues × 2 en moins de 3 h</span><Badge tone="success">ACTIF</Badge></div>
          <div className="rule"><span>Commentaires anormalement élevés</span><Badge tone="success">ACTIF</Badge></div>
          <p className="muted">Les notifications externes exigent un canal configuré. Cette V3 prépare les alertes dans la base ; email/Discord/Telegram pourront être ajoutés ensuite.</p>
        </article>
        <article className="panel">
          <div className="panel-head"><div><p>DERNIÈRE DÉTECTION</p><h2>Centre d'alertes</h2></div></div>
          {best&&best.score>=70?<div className="big-alert"><span>🔥</span><h3>Dossier {best.dossier} accélère</h3><p>Score actuel : {best.score}/100</p></div>:<div className="empty">Aucune alerte active</div>}
        </article>
      </section>}

      {youtube.message && !demoMode && <div className="system-message">{youtube.message}</div>}
    </main>
  </div>
}
