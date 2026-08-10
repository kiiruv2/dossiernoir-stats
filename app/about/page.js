export const metadata = {
  title: "Dossier Noir Stats — Analytics Dashboard",
  description:
    "Dossier Noir Stats is a private analytics dashboard used to review the performance of Dossier Noir videos across social platforms.",
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="eyebrow">DOSSIER NOIR • ANALYTICS</p>
        <h1>Dossier Noir Stats</h1>
        <p className="about-lead">
          A private analytics dashboard used by Dossier Noir to review video performance,
          compare content results, and improve future publications.
        </p>
        <div className="about-actions">
          <a className="primary about-primary" href="/tiktok">Connect with TikTok</a>
          <a className="about-secondary" href="/">Open dashboard</a>
        </div>
      </section>

      <section className="about-grid" aria-label="About Dossier Noir Stats">
        <article className="about-card">
          <span>01</span>
          <h2>What the app does</h2>
          <p>
            Dossier Noir Stats centralizes authorized performance data for Dossier Noir videos
            and presents it in a private dashboard with views, engagement, retention indicators,
            comparisons, and internal performance analysis.
          </p>
        </article>

        <article className="about-card">
          <span>02</span>
          <h2>How TikTok is used</h2>
          <p>
            The app connects only after the TikTok account owner explicitly authorizes access.
            Authorized TikTok data is used to display the account&apos;s video information and
            available performance statistics inside the dashboard.
          </p>
        </article>

        <article className="about-card">
          <span>03</span>
          <h2>Who uses it</h2>
          <p>
            The service is currently intended for the Dossier Noir team and its authorized
            account. It is not a public social network, advertising platform, or data resale service.
          </p>
        </article>
      </section>

      <section className="about-info">
        <div>
          <p className="eyebrow">DATA & PRIVACY</p>
          <h2>Authorization first. Analytics only.</h2>
        </div>
        <p>
          Dossier Noir Stats does not request a TikTok password and does not access private
          messages. TikTok data is processed only for the analytics functions described above
          and is not sold or rented.
        </p>
      </section>

      <footer className="about-footer">
        <strong>DOSSIER NOIR STATS</strong>
        <nav aria-label="Legal links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/tiktok">TikTok connection</a>
        </nav>
      </footer>
    </main>
  );
}
