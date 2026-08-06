"use client";

import { useEffect, useState } from "react";

export default function TikTokConnectionPage() {
  const [data, setData] = useState({
    status: "loading",
    user: null,
    videos: [],
    message: "",
  });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetch("/api/tiktok", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        setData(payload);

        if (payload.status === "connected") {
          const current = JSON.parse(localStorage.getItem("dn-manual-v3") || "[]");
          const withoutOldTikTok = current.filter((item) => item._source !== "tiktok");
          localStorage.setItem(
            "dn-manual-v3",
            JSON.stringify([...payload.videos, ...withoutOldTikTok])
          );
          setSynced(true);
        }
      })
      .catch(() =>
        setData({
          status: "error",
          user: null,
          videos: [],
          message: "Impossible de charger TikTok.",
        })
      );
  }, []);

  return (
    <main className="standalone">
      <a className="back-link" href="/">← Retour au dashboard</a>

      <header>
        <p className="eyebrow">CONNEXION OFFICIELLE</p>
        <h1>TikTok</h1>
        <p>
          Connecte le compte autorisé pour importer ses vidéos et statistiques
          publiques dans Dossier Noir Stats.
        </p>
      </header>

      <section className="panel">
        {data.status === "loading" && <p>Vérification de la connexion…</p>}

        {data.status === "disconnected" && (
          <div className="tiktok-connect-card">
            <h2>TikTok n’est pas encore connecté</h2>
            <p>
              TikTok affichera un écran d’autorisation pour les scopes validés
              dans ton application développeur.
            </p>
            <a className="primary tiktok-auth-button" href="/api/auth/tiktok/start">
              Connecter TikTok
            </a>
          </div>
        )}

        {data.status === "connected" && (
          <div className="tiktok-connect-card">
            <p className="eyebrow">COMPTE CONNECTÉ</p>
            <h2>{data.user?.display_name || "Compte TikTok"}</h2>
            <p>
              {data.user?.follower_count || 0} abonnés ·{" "}
              {data.user?.likes_count || 0} J’aime ·{" "}
              {data.videos.length} vidéo(s) importée(s)
            </p>

            {synced && (
              <p className="tiktok-success">
                ✓ Les statistiques TikTok ont été enregistrées dans le dashboard.
              </p>
            )}

            <div className="tiktok-actions">
              <a className="primary" href="/">
                Ouvrir le dashboard réel
              </a>
              <a className="tiktok-secondary" href="/api/auth/tiktok/disconnect">
                Déconnecter TikTok
              </a>
            </div>
          </div>
        )}

        {data.status === "error" && (
          <div className="tiktok-connect-card">
            <h2>Connexion impossible</h2>
            <p>{data.message}</p>
            <a className="primary" href="/api/auth/tiktok/start">
              Réessayer
            </a>
          </div>
        )}
      </section>

      <section className="panel tiktok-demo-help">
        <h2>Pour la vidéo de démonstration TikTok</h2>
        <ol>
          <li>Filme cette page.</li>
          <li>Clique sur « Connecter TikTok ».</li>
          <li>Montre l’écran d’autorisation.</li>
          <li>Autorise l’application.</li>
          <li>Montre le retour ici avec le compte et les vidéos importées.</li>
          <li>Ouvre ensuite le dashboard réel.</li>
        </ol>
      </section>
    </main>
  );
}
