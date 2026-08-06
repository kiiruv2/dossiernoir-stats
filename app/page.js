'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { bestHour, engagementRate, estimateRevenue, viralScore } from "../lib/analytics";
import { demoTrend, demoVideos } from "../lib/demo";

const format = (value) =>
  new Intl.NumberFormat("fr-FR", {
    notation: Number(value) > 999999 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(Number(value || 0));

const euros = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(Number(value || 0));

function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function PlatformBadge({ name }) {
  const tone = name.includes("YouTube") ? "youtube" : name.includes("TikTok") ? "tiktok" : "instagram";
  return <Badge tone={tone}>{name}</Badge>;
}

function ScoreRing({ value }) {
  return (
    <div className="score-ring" style={{ "--score-angle": `${value * 3.6}deg` }}>
      <span>{value}</span>
      <small>/100</small>
    </div>
  );
}

function Kpi({ label, value, detail, accent = false }) {
  return (
    <article className={`kpi ${accent ? "accent" : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("dashboard");
  const [youtube, setYoutube] = useState({ status: "loading", videos: [], message: "" });
  const [manualEntries, setManualEntries] = useState([]);
  const [demoMode, setDemoMode] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/youtube")
      .then((response) => response.json())
      .then(setYoutube)
      .catch(() => setYoutube({ status: "error", videos: [], message: "Connexion YouTube impossible." }));

    try {
      setManualEntries(JSON.parse(localStorage.getItem("dn-manual-v3") || "[]"));
    } catch {
      setManualEntries([]);
    }
  }, []);

  const realVideos = useMemo(
    () => [...(youtube.videos || []), ...manualEntries],
    [youtube.videos, manualEntries]
  );

  const videos = demoMode && !realVideos.length ? demoVideos : realVideos;

  const medianViews = useMemo(() => {
    const values = videos.map((video) => Number(video.views || 0)).sort((a, b) => a - b);
    return values.length ? values[Math.floor(values.length / 2)] : 1;
  }, [videos]);

  const enrichedVideos = useMemo(
    () =>
      videos.map((video) => ({
        ...video,
        engagement: engagementRate(video),
        score: viralScore(video, medianViews),
        revenue: estimateRevenue(video)
      })),
    [videos, medianViews]
  );

  const totals = useMemo(
    () =>
      enrichedVideos.reduce(
        (accumulator, video) => ({
          views: accumulator.views + Number(video.views || 0),
          interactions:
            accumulator.interactions +
            Number(video.likes || 0) +
            Number(video.comments || 0) +
            Number(video.shares || 0),
          followers: accumulator.followers + Number(video.followers || 0),
          revenue: accumulator.revenue + Number(video.revenue || 0)
        }),
        { views: 0, interactions: 0, followers: 0, revenue: 0 }
      ),
    [enrichedVideos]
  );

  const ranked = useMemo(
    () => [...enrichedVideos].sort((a, b) => b.score - a.score),
    [enrichedVideos]
  );

  const topVideo = ranked[0];
  const publishingHour = bestHour(enrichedVideos);

  const platformData = ["TikTok", "YouTube Shorts", "Instagram Reels"].map((platform) => ({
    platform,
    views: enrichedVideos
      .filter((video) => video.platform === platform)
      .reduce((sum, video) => sum + Number(video.views || 0), 0)
  }));

  const trendData =
    demoMode && !realVideos.length
      ? demoTrend
      : enrichedVideos.map((video, index) => ({
          label: `Vidéo ${index + 1}`,
          views: Number(video.views || 0)
        }));

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: enrichedVideos })
      });
      const payload = await response.json();
      setAnalysis(payload.analysis || "Analyse indisponible.");
    } finally {
      setAnalyzing(false);
    }
  }

  const titles = {
    dashboard: "Vue d'ensemble",
    videos: "Performances vidéo",
    ai: "Analyse IA",
    calendar: "Calendrier",
    hooks: "Classement des hooks",
    alerts: "Centre d'alertes"
  };

  return (
    <div className="application">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span>DN</span>
          <div>
            <b>DOSSIER <em>NOIR</em></b>
            <small>CONTROL CENTER V3</small>
          </div>
        </a>

        <nav>
          {[
            ["dashboard", "Vue d'ensemble", "◫"],
            ["videos", "Vidéos", "▶"],
            ["ai", "Analyse IA", "✦"],
            ["calendar", "Calendrier", "▦"],
            ["hooks", "Hooks", "⌁"],
            ["alerts", "Alertes", "!"]
          ].map(([id, label, icon]) => (
            <button
              type="button"
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <label className="demo-toggle">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(event) => setDemoMode(event.target.checked)}
            />
            <span />
            Mode démo
          </label>
          <a href="/admin">Administration</a>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">DOSSIER NOIR · ANALYTICS</p>
            <h1>{titles[view]}</h1>
          </div>
          <div className="top-status">
            <Badge tone={youtube.status === "ok" ? "success" : "warning"}>
              {youtube.status === "ok" ? "YouTube connecté" : "YouTube en attente"}
            </Badge>
            <span className="sync-status"><i /> Synchronisation horaire</span>
          </div>
        </header>

        {view === "dashboard" && (
          <>
            <section className="kpi-grid">
              <Kpi label="Vues cumulées" value={format(totals.views)} detail={`${enrichedVideos.length} entrées analysées`} />
              <Kpi label="Interactions" value={format(totals.interactions)} detail="Likes, commentaires et partages" />
              <Kpi label="Abonnés gagnés" value={`+${format(totals.followers)}`} detail="Toutes plateformes" />
              <Kpi label="Revenus estimés" value={euros(totals.revenue)} detail="Estimation, pas un revenu réel" accent />
            </section>

            <section className="main-grid">
              <article className="panel chart-panel">
                <div className="panel-heading">
                  <div><p>ÉVOLUTION</p><h2>Vues dans le temps</h2></div>
                  <Badge tone="success">LIVE</Badge>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e53935" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#e53935" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#282828" vertical={false} />
                      <XAxis dataKey="label" stroke="#777" axisLine={false} tickLine={false} />
                      <YAxis stroke="#777" axisLine={false} tickLine={false} width={45} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#e53935"
                        strokeWidth={3}
                        fill="url(#viewsFill)"
                        isAnimationActive
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel top-video">
                <div className="panel-heading">
                  <div><p>PERFORMANCE</p><h2>Score de viralité</h2></div>
                </div>
                {topVideo ? (
                  <>
                    <ScoreRing value={topVideo.score} />
                    <h3>Dossier N°{topVideo.dossier}</h3>
                    <p>{topVideo.title}</p>
                    <div className="inline-stats">
                      <span>{format(topVideo.views)} vues</span>
                      <span>{topVideo.engagement.toFixed(1)} % engagement</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">Aucune donnée</div>
                )}
              </article>
            </section>

            <section className="secondary-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div><p>PLATEFORMES</p><h2>Répartition des vues</h2></div>
                </div>
                <div className="small-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} layout="vertical">
                      <CartesianGrid stroke="#282828" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="platform"
                        type="category"
                        width={120}
                        stroke="#aaa"
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                      <Bar dataKey="views" fill="#e53935" radius={[0, 6, 6, 0]} isAnimationActive />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel insight-panel">
                <div className="panel-heading">
                  <div><p>OPTIMISATION</p><h2>Meilleure heure</h2></div>
                </div>
                <strong>
                  {publishingHour ? `${String(publishingHour.hour).padStart(2, "0")}h00` : "—"}
                </strong>
                <p>
                  {publishingHour
                    ? `${format(publishingHour.average)} vues moyennes sur ${publishingHour.count} publication(s).`
                    : "Publie plusieurs vidéos pour calculer cette donnée."}
                </p>
                <small>Indication descriptive, pas une preuve de causalité.</small>
              </article>

              <article className="panel alert-panel">
                <div className="panel-heading">
                  <div><p>ALERTE</p><h2>Vidéo en accélération</h2></div>
                </div>
                {topVideo?.score >= 70 ? (
                  <>
                    <Badge tone="danger">POTENTIEL VIRAL</Badge>
                    <h3>{topVideo.title}</h3>
                    <p>Son score dépasse le seuil de 70/100.</p>
                  </>
                ) : (
                  <div className="empty-state compact">Aucune alerte active</div>
                )}
              </article>
            </section>

            <section className="panel ranking-panel">
              <div className="panel-heading">
                <div><p>CLASSEMENT</p><h2>Meilleures vidéos</h2></div>
                <button type="button" onClick={() => setView("videos")}>Voir tout →</button>
              </div>
              <div className="ranking-list">
                {ranked.slice(0, 5).map((video, index) => (
                  <div className="ranking-row" key={`${video.platform}-${video.id}`}>
                    <b>#{index + 1}</b>
                    <div className="thumbnail">
                      {video.thumbnail ? <img src={video.thumbnail} alt="" /> : <span>DN</span>}
                    </div>
                    <div className="ranking-title">
                      <strong>Dossier {video.dossier} · {video.title}</strong>
                      <PlatformBadge name={video.platform} />
                    </div>
                    <span>{format(video.views)} vues</span>
                    <ScoreRing value={video.score} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === "videos" && (
          <section className="panel">
            <div className="panel-heading">
              <div><p>CATALOGUE</p><h2>Toutes les performances</h2></div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Dossier</th>
                    <th>Plateforme</th>
                    <th>Vues</th>
                    <th>Engagement</th>
                    <th>Rétention</th>
                    <th>Viralité</th>
                    <th>Revenu estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedVideos.map((video) => (
                    <tr key={`${video.platform}-${video.id}`}>
                      <td><b>N°{video.dossier}</b><span>{video.title}</span></td>
                      <td><PlatformBadge name={video.platform} /></td>
                      <td>{format(video.views)}</td>
                      <td>{video.engagement.toFixed(1)} %</td>
                      <td>{video.retention || 0} %</td>
                      <td><strong className={video.score >= 70 ? "hot" : ""}>{video.score}/100</strong></td>
                      <td>{euros(video.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "ai" && (
          <section className="two-column">
            <article className="panel">
              <div className="panel-heading">
                <div><p>ASSISTANT STRATÉGIQUE</p><h2>Analyse de la chaîne</h2></div>
              </div>
              <button className="primary" type="button" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? "Analyse en cours..." : "Analyser mes performances"}
              </button>
              <div className="analysis-box">
                {analysis || "Lance l'analyse pour obtenir un diagnostic basé sur les données disponibles."}
              </div>
            </article>
            <article className="panel checklist">
              <div className="panel-heading"><div><p>MÉTHODE</p><h2>Points vérifiés</h2></div></div>
              <ul>
                <li>Hook et arrêt du scroll</li>
                <li>Rétention et complétion</li>
                <li>Engagement par plateforme</li>
                <li>Heure et fréquence</li>
                <li>Limites statistiques</li>
              </ul>
            </article>
          </section>
        )}

        {view === "calendar" && (
          <section className="panel">
            <div className="panel-heading"><div><p>PLANIFICATION</p><h2>Calendrier des publications</h2></div></div>
            <div className="calendar-grid">
              {[...enrichedVideos]
                .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
                .map((video) => (
                  <article key={`${video.platform}-${video.id}`}>
                    <time>
                      {new Date(video.publishedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </time>
                    <strong>Dossier {video.dossier}</strong>
                    <span>
                      {new Date(video.publishedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    <PlatformBadge name={video.platform} />
                  </article>
                ))}
            </div>
          </section>
        )}

        {view === "hooks" && (
          <section className="panel">
            <div className="panel-heading"><div><p>COPYWRITING</p><h2>Classement des hooks</h2></div></div>
            <div className="hook-list">
              {ranked.map((video, index) => (
                <article key={`${video.platform}-${video.id}`}>
                  <b>#{index + 1}</b>
                  <div>
                    <h3>“{video.hook || video.title}”</h3>
                    <p>{video.platform} · {format(video.views)} vues · {video.engagement.toFixed(1)} % engagement</p>
                  </div>
                  <ScoreRing value={video.score} />
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "alerts" && (
          <section className="two-column">
            <article className="panel">
              <div className="panel-heading"><div><p>NOTIFICATIONS</p><h2>Règles actives</h2></div></div>
              {[
                "Score de viralité ≥ 70",
                "Vues ×2 en moins de 3 heures",
                "Commentaires anormalement élevés"
              ].map((rule) => (
                <div className="rule" key={rule}>
                  <span>{rule}</span>
                  <Badge tone="success">ACTIF</Badge>
                </div>
              ))}
              <p className="muted">
                Les notifications externes sur téléphone demanderont ensuite un canal email,
                Telegram ou Discord.
              </p>
            </article>
            <article className="panel">
              <div className="panel-heading"><div><p>DÉTECTION</p><h2>Centre d'alertes</h2></div></div>
              {topVideo?.score >= 70 ? (
                <div className="large-alert">
                  <span>🔥</span>
                  <h3>Dossier {topVideo.dossier} accélère</h3>
                  <p>Score actuel : {topVideo.score}/100</p>
                </div>
              ) : (
                <div className="empty-state">Aucune alerte active</div>
              )}
            </article>
          </section>
        )}

        {!demoMode && youtube.message && <div className="system-message">{youtube.message}</div>}
      </main>
    </div>
  );
}
