'use client';
import { useEffect, useState } from "react";

const freshForm = () => ({ dossier:"004", title:"", hook:"", platform:"TikTok", views:0, likes:0, comments:0, shares:0, retention:0, completion:0, scrollStop:0, followers:0, publishedAt:new Date().toISOString().slice(0,16) });

export default function AdminPage() {
  const [entries,setEntries] = useState([]);
  const [form,setForm] = useState(freshForm());
  useEffect(()=>{ try { setEntries(JSON.parse(localStorage.getItem("dn-manual-v4") || localStorage.getItem("dn-manual-v3") || "[]")); } catch { setEntries([]); } },[]);
  function save(next){ setEntries(next); localStorage.setItem("dn-manual-v4",JSON.stringify(next)); }
  function submit(event){ event.preventDefault(); const numeric=["views","likes","comments","shares","retention","completion","scrollStop","followers"]; const entry={...form,id:crypto.randomUUID()}; numeric.forEach((key)=>entry[key]=Number(entry[key])); save([entry,...entries]); setForm(freshForm()); }
  return <main className="standalone">
    <a className="back-link" href="/">← Retour au Control Center</a>
    <header><p className="eyebrow">DOSSIER NOIR · V4.1</p><h1>Ajouter des statistiques</h1><p>Renseigne les chiffres de chaque plateforme. Le taux « ont continué à regarder » mesure directement la force du hook.</p></header>
    <section className="panel"><form className="admin-form" onSubmit={submit}>
      {[["dossier","Dossier","text"],["title","Titre","text"],["hook","Hook exact","text"],["views","Vues","number"],["likes","Likes","number"],["comments","Commentaires","number"],["shares","Partages","number"],["scrollStop","Ont continué à regarder (%)","number"],["retention","Rétention moyenne (%)","number"],["completion","Complétion (%)","number"],["followers","Abonnés gagnés","number"]].map(([name,label,type])=><label key={name}>{label}<input name={name} type={type} step={type==="number"?"0.1":undefined} value={form[name]} onChange={(e)=>setForm({...form,[name]:e.target.value})}/></label>)}
      <label>Plateforme<select value={form.platform} onChange={(e)=>setForm({...form,platform:e.target.value})}><option>TikTok</option><option>YouTube Shorts</option><option>Instagram Reels</option></select></label>
      <label>Date et heure<input type="datetime-local" value={form.publishedAt} onChange={(e)=>setForm({...form,publishedAt:e.target.value})}/></label>
      <button className="primary" type="submit">Enregistrer les statistiques</button>
    </form></section>
    <section className="panel admin-list"><h2>Entrées locales</h2>{entries.length===0?<div className="empty-state">Aucune entrée manuelle</div>:entries.map((entry)=><div className="admin-row" key={entry.id}><span>Dossier {entry.dossier} · {entry.platform} · {entry.views} vues · Hook {entry.scrollStop||0}%</span><button type="button" onClick={()=>save(entries.filter((item)=>item.id!==entry.id))}>Supprimer</button></div>)}</section>
  </main>;
}
