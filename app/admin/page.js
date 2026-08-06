'use client';
import { useEffect, useState } from "react";

const blank = {dossier:"001",title:"",hook:"",platform:"TikTok",views:0,likes:0,comments:0,shares:0,retention:0,completion:0,followers:0,publishedAt:new Date().toISOString().slice(0,16)};

export default function Admin(){
  const [entries,setEntries]=useState([]);
  const [form,setForm]=useState(blank);
  useEffect(()=>{try{setEntries(JSON.parse(localStorage.getItem("dn-manual-v3")||"[]"))}catch{}},[]);
  const save=next=>{setEntries(next);localStorage.setItem("dn-manual-v3",JSON.stringify(next));};
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=e=>{e.preventDefault();save([{...form,id:crypto.randomUUID(),views:+form.views,likes:+form.likes,comments:+form.comments,shares:+form.shares,retention:+form.retention,completion:+form.completion,followers:+form.followers},...entries]);setForm(blank);};
  return <main className="standalone">
    <a className="back" href="/">← Retour au dashboard</a>
    <header><p className="eyebrow">ESPACE ADMIN</p><h1>Ajouter des statistiques</h1><p>Utilise cette page pour TikTok et Instagram tant que leurs API n'ont pas été approuvées.</p></header>
    <section className="panel">
      <form className="admin-form" onSubmit={submit}>
        {[
          ["dossier","Dossier","text"],["title","Titre","text"],["hook","Hook","text"],["views","Vues","number"],
          ["likes","Likes","number"],["comments","Commentaires","number"],["shares","Partages","number"],
          ["retention","Rétention (%)","number"],["completion","Complétion (%)","number"],["followers","Abonnés gagnés","number"]
        ].map(([name,label,type])=><label key={name}>{label}<input name={name} type={type} value={form[name]} onChange={change}/></label>)}
        <label>Plateforme<select name="platform" value={form.platform} onChange={change}><option>TikTok</option><option>Instagram Reels</option></select></label>
        <label>Date et heure<input name="publishedAt" type="datetime-local" value={form.publishedAt} onChange={change}/></label>
        <button className="primary">Enregistrer</button>
      </form>
    </section>
    <section className="panel admin-list">
      <h2>Entrées locales</h2>
      {entries.map(x=><div className="admin-row" key={x.id}><span>Dossier {x.dossier} · {x.platform} · {x.views} vues</span><button onClick={()=>save(entries.filter(e=>e.id!==x.id))}>Supprimer</button></div>)}
    </section>
  </main>
}
