import Link from 'next/link';

const features=[
  ['Hook Analysis','Mesure la capacité des premières secondes à arrêter le scroll.'],
  ['Retention Insights','Compare rétention, complétion et décrochage pour comprendre ce qui retient.'],
  ['Performance Score','Centralise les signaux clés dans un score simple pour comparer les contenus.'],
  ['AI Recommendations','Transforme les données observées en actions concrètes pour la prochaine vidéo.'],
  ['Cross-platform Analytics','Regroupe les performances de formats courts sur plusieurs plateformes.'],
  ['Checkpoint Tracking','Suit H+1, H+2, H+4 et H+24 pour lire la dynamique de distribution.']
];
export default function Home(){return <main className="public-site">
  <nav className="public-nav"><Link className="public-brand" href="/"><span>H</span><b>HOOKLY.</b></Link><div><a href="#features">Features</a><a href="#how">How it works</a><Link href="/contact">Contact</Link><Link className="nav-cta" href="/dashboard">Open Dashboard</Link></div></nav>
  <section className="public-hero"><div className="hero-glow"/><p className="public-eyebrow">SHORT-FORM CONTENT INTELLIGENCE</p><h1>Turn short-form data into your <em>next winning video.</em></h1><p className="hero-copy">HOOKLY helps creators understand what happened after publishing — then turns hook, retention, engagement and distribution signals into a clearer next action.</p><div className="hero-actions"><Link className="public-primary" href="/dashboard">Open Dashboard</Link><a className="public-secondary" href="#features">Explore features</a></div><div className="platform-row"><span>YouTube Shorts</span><span>TikTok</span><span>Instagram Reels</span></div></section>
  <section className="proof-strip"><div><b>DATA</b><small>Collect performance signals</small></div><i>→</i><div><b>DIAGNOSIS</b><small>Understand what worked</small></div><i>→</i><div><b>ACTION</b><small>Improve the next video</small></div></section>
  <section id="features" className="public-section"><p className="public-eyebrow">WHAT HOOKLY DOES</p><h2>One control center for short-form performance.</h2><div className="feature-grid">{features.map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
  <section id="how" className="public-section how-section"><div><p className="public-eyebrow">HOW IT WORKS</p><h2>From published video to a better next decision.</h2></div><div className="steps"><p><b>01</b> Connect or import performance data from your short-form content.</p><p><b>02</b> HOOKLY compares hook, retention, engagement and distribution checkpoints.</p><p><b>03</b> Review the diagnosis and use the recommended action for your next upload.</p></div></section>
  <section className="public-cta"><p className="public-eyebrow">CONTENT LAB</p><h2>Stop guessing what to change next.</h2><p>Use your real publishing data to build a repeatable improvement loop.</p><Link className="public-primary" href="/dashboard">Enter HOOKLY</Link></section>
  <footer className="public-footer"><Link className="public-brand" href="/"><span>H</span><b>HOOKLY.</b></Link><p>Short-form analytics and content intelligence.</p><div><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/contact">Contact</Link></div><small>© 2026 HOOKLY. All rights reserved.</small></footer>
</main>}
