'use client';
import { useEffect, useState } from 'react';

export default function Admin(){
  const [entries,setEntries]=useState([]);
  const [form,setForm]=useState({dossier:'001',title:'Le mystère du col Dyatlov',platform:'TikTok',views:0,likes:0,comments:0,shares:0,date:new Date().toISOString().slice(0,10)});
  useEffect(()=>{try{setEntries(JSON.parse(localStorage.getItem('dn-manual-v2')||'[]'))}catch{}},[]);
  const save=(next)=>{setEntries(next);localStorage.setItem('dn-manual-v2',JSON.stringify(next));};
  const submit=e=>{e.preventDefault();save([{...form,id:crypto.randomUUID(),views:+form.views,likes:+form.likes,comments:+form.comments,shares:+form.shares},...entries]);};
  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  return <main className="admin-page">
    <a className="back" href="/">← Retour au dashboard</a>
    <div className="admin-head"><p className="kicker">ESPACE PRIVÉ</p><h1>Administration</h1><p>Ajoute manuellement TikTok et Instagram en attendant l’activation de leurs API officielles.</p></div>
    <section className="panel admin-panel">
      <form onSubmit={submit} className="admin-form">
        <label>Dossier<input name="dossier" value={form.dossier} onChange={update}/></label>
        <label>Titre<input name="title" value={form.title} onChange={update}/></label>
        <label>Plateforme<select name="platform" value={form.platform} onChange={update}><option>TikTok</option><option>Instagram Reels</option></select></label>
        <label>Date<input type="date" name="date" value={form.date} onChange={update}/></label>
        <label>Vues<input type="number" name="views" value={form.views} onChange={update}/></label>
        <label>J’aime<input type="number" name="likes" value={form.likes} onChange={update}/></label>
        <label>Commentaires<input type="number" name="comments" value={form.comments} onChange={update}/></label>
        <label>Partages<input type="number" name="shares" value={form.shares} onChange={update}/></label>
        <button>Enregistrer</button>
      </form>
    </section>
    <section className="panel admin-list">
      <h2>Entrées manuelles</h2>
      {entries.map(x=><div className="admin-row" key={x.id}><span>Dossier {x.dossier} · {x.platform} · {x.views} vues</span><button onClick={()=>save(entries.filter(e=>e.id!==x.id))}>Supprimer</button></div>)}
    </section>
  </main>
}
