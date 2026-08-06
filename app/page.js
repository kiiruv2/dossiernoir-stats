'use client';

import { useEffect, useMemo, useState } from 'react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { notation: n > 999999 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(Number(n || 0));
const pct = (a,b) => b ? ((a/b)*100).toFixed(1) : '0.0';

function PlatformBadge({name}) {
  const key = name.toLowerCase().replaceAll(' ','-');
  return <span className={`platform ${key}`}>{name}</span>;
}

function Metric({label, value, detail, red=false}) {
  return <article className={`metric ${red ? 'metric-red' : ''}`}>
    <p>{label}</p><strong>{value}</strong><small>{detail}</small>
  </article>;
}

function Bar({label, value, max}) {
  return <div className="bar-row">
    <div className="bar-label">{label}</div>
    <div className="bar-track"><div className="bar-fill" style={{width:`${max ? Math.max(3, value/max*100) : 3}%`}} /></div>
    <div className="bar-number">{fmt(value)}</div>
  </div>
}

export default function Home() {
  const [youtube, setYoutube] = useState({status:'loading', channel:null, videos:[], message:''});
  const [manual, setManual] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetch('/api/youtube')
      .then(r => r.json())
      .then(d => setYoutube(d))
      .catch(() => setYoutube({status:'error', channel:null, videos:[], message:"Connexion YouTube indisponible"}));
    try { setManual(JSON.parse(localStorage.getItem('dn-manual-v2') || '[]')); } catch {}
  }, []);

  const all = useMemo(() => {
    const yt = (youtube.videos || []).map(v => ({
      id:v.id, dossier:v.dossier || '—', title:v.title, platform:'YouTube Shorts',
      views:+v.views, likes:+v.likes, comments:+v.comments, shares:0, date:v.publishedAt,
      thumbnail:v.thumbnail
    }));
    return [...yt, ...manual];
  }, [youtube, manual]);

  const totals = useMemo(() => all.reduce((a,x) => ({
    views:a.views+x.views, likes:a.likes+x.likes, comments:a.comments+x.comments,
    shares:a.shares+(x.shares||0)
  }), {views:0,likes:0,comments:0,shares:0}), [all]);

  const grouped = useMemo(() => {
    const out = {'TikTok':0,'YouTube Shorts':0,'Instagram Reels':0};
    all.forEach(x => out[x.platform] = (out[x.platform]||0)+x.views);
    return out;
  }, [all]);

  const best = [...all].sort((a,b)=>b.views-a.views)[0];
  const maxPlatform = Math.max(...Object.values(grouped),1);

  return <div className="site-shell">
    <div className="noise" />
    <header className="header">
      <a className="logo" href="/">
        <span className="logo-folder">DN</span>
        <span><b>DOSSIER</b> <em>NOIR</em><small>STATISTIQUES PUBLIQUES</small></span>
      </a>
      <nav>
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Vue d’ensemble</button>
        <button className={tab==='videos'?'active':''} onClick={()=>setTab('videos')}>Dossiers</button>
        <a href="/admin">Administration</a>
      </nav>
    </header>

    <main>
      <section className="hero">
        <div>
          <p className="kicker">CENTRE D’ANALYSE · DOSSIER NOIR</p>
          <h1>Les chiffres derrière<br/><span>chaque enquête.</span></h1>
          <p className="hero-copy">Performances publiques de Dossier Noir sur YouTube Shorts, TikTok et Instagram Reels.</p>
        </div>
        <div className="hero-seal">
          <span>RAPPORT</span><b>LIVE</b><small>MIS À JOUR AUTOMATIQUEMENT</small>
        </div>
      </section>

      {tab === 'overview' && <>
        <section className="metrics">
          <Metric label="Vues cumulées" value={fmt(totals.views)} detail={`${all.length} entrées analysées`} />
          <Metric label="Interactions" value={fmt(totals.likes+totals.comments+totals.shares)} detail={`${pct(totals.likes+totals.comments+totals.shares, totals.views)} % des vues`} />
          <Metric label="Commentaires" value={fmt(totals.comments)} detail="Toutes plateformes" />
          <Metric red label="Dossier le plus vu" value={best ? `N°${best.dossier}` : '—'} detail={best ? `${fmt(best.views)} vues · ${best.platform}` : 'En attente de données'} />
        </section>

        <section className="dashboard-grid">
          <article className="panel performance">
            <div className="panel-title"><div><p>RÉPARTITION</p><h2>Vues par plateforme</h2></div><span className="live-dot">LIVE</span></div>
            <div className="bars">
              {Object.entries(grouped).map(([k,v]) => <Bar key={k} label={k} value={v} max={maxPlatform}/>)}
            </div>
          </article>

          <article className="panel connection">
            <div className="panel-title"><div><p>CONNEXIONS</p><h2>État des sources</h2></div></div>
            <div className="connection-row"><PlatformBadge name="YouTube Shorts"/><span className={youtube.status==='ok'?'ok':'pending'}>{youtube.status==='ok'?'Connecté':'À configurer'}</span></div>
            <div className="connection-row"><PlatformBadge name="TikTok"/><span className="pending">Validation API requise</span></div>
            <div className="connection-row"><PlatformBadge name="Instagram Reels"/><span className="pending">Connexion Meta requise</span></div>
            {youtube.message && <p className="api-note">{youtube.message}</p>}
          </article>
        </section>

        <section className="panel latest">
          <div className="panel-title"><div><p>ARCHIVES RÉCENTES</p><h2>Derniers dossiers publiés</h2></div><button onClick={()=>setTab('videos')}>Tout afficher →</button></div>
          <div className="video-grid">
            {all.slice(0,6).map((v,i)=><article className="video-card" key={`${v.platform}-${v.id || i}`}>
              <div className="thumb" style={v.thumbnail ? {backgroundImage:`url(${v.thumbnail})`} : {}}>
                {!v.thumbnail && <span>📁</span>}<b>DOSSIER N°{v.dossier}</b>
              </div>
              <div className="card-body">
                <PlatformBadge name={v.platform}/>
                <h3>{v.title}</h3>
                <div className="card-stats"><span>{fmt(v.views)} vues</span><span>{fmt(v.likes)} j’aime</span></div>
              </div>
            </article>)}
            {!all.length && <div className="empty"><span>📁</span><h3>Aucune statistique pour le moment</h3><p>La première synchronisation apparaîtra ici.</p></div>}
          </div>
        </section>
      </>}

      {tab === 'videos' && <section className="panel archive">
        <div className="panel-title"><div><p>BASE DE DONNÉES</p><h2>Tous les dossiers</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Dossier</th><th>Plateforme</th><th>Vues</th><th>J’aime</th><th>Commentaires</th><th>Date</th></tr></thead>
        <tbody>{all.map((v,i)=><tr key={i}><td><b>N°{v.dossier}</b><span>{v.title}</span></td><td><PlatformBadge name={v.platform}/></td><td>{fmt(v.views)}</td><td>{fmt(v.likes)}</td><td>{fmt(v.comments)}</td><td>{v.date ? new Date(v.date).toLocaleDateString('fr-FR') : '—'}</td></tr>)}</tbody></table></div>
      </section>}
    </main>

    <footer><span>DOSSIER NOIR © 2026</span><span>Les données publiques peuvent différer légèrement des plateformes.</span></footer>
  </div>
}
