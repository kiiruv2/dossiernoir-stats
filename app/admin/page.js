'use client';

import { useEffect, useState } from "react";

const initialForm = {
  dossier: "001",
  title: "",
  hook: "",
  platform: "TikTok",
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  retention: 0,
  completion: 0,
  followers: 0,
  publishedAt: new Date().toISOString().slice(0, 16)
};

export default function AdminPage() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    try {
      setEntries(JSON.parse(localStorage.getItem("dn-manual-v3") || "[]"));
    } catch {
      setEntries([]);
    }
  }, []);

  function save(nextEntries) {
    setEntries(nextEntries);
    localStorage.setItem("dn-manual-v3", JSON.stringify(nextEntries));
  }

  function submit(event) {
    event.preventDefault();
    save([
      {
        ...form,
        id: crypto.randomUUID(),
        views: Number(form.views),
        likes: Number(form.likes),
        comments: Number(form.comments),
        shares: Number(form.shares),
        retention: Number(form.retention),
        completion: Number(form.completion),
        followers: Number(form.followers)
      },
      ...entries
    ]);
    setForm(initialForm);
  }

  return (
    <main className="standalone">
      <a className="back-link" href="/">← Retour au dashboard</a>
      <header>
        <p className="eyebrow">ESPACE ADMIN</p>
        <h1>Ajouter des statistiques</h1>
        <p>Utilise cette page pour TikTok et Instagram tant que leurs API ne sont pas connectées.</p>
      </header>

      <section className="panel">
        <form className="admin-form" onSubmit={submit}>
          {[
            ["dossier", "Dossier", "text"],
            ["title", "Titre", "text"],
            ["hook", "Hook", "text"],
            ["views", "Vues", "number"],
            ["likes", "Likes", "number"],
            ["comments", "Commentaires", "number"],
            ["shares", "Partages", "number"],
            ["retention", "Rétention (%)", "number"],
            ["completion", "Complétion (%)", "number"],
            ["followers", "Abonnés gagnés", "number"]
          ].map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={(event) => setForm({ ...form, [name]: event.target.value })}
              />
            </label>
          ))}

          <label>
            Plateforme
            <select
              value={form.platform}
              onChange={(event) => setForm({ ...form, platform: event.target.value })}
            >
              <option>TikTok</option>
              <option>Instagram Reels</option>
            </select>
          </label>

          <label>
            Date et heure
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
            />
          </label>

          <button className="primary" type="submit">Enregistrer</button>
        </form>
      </section>

      <section className="panel admin-list">
        <h2>Entrées locales</h2>
        {entries.map((entry) => (
          <div className="admin-row" key={entry.id}>
            <span>Dossier {entry.dossier} · {entry.platform} · {entry.views} vues</span>
            <button type="button" onClick={() => save(entries.filter((item) => item.id !== entry.id))}>
              Supprimer
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
