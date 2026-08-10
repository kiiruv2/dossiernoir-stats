export const metadata = {
  title: "Conditions d’utilisation — Dossier Noir Stats",
  description: "Conditions d’utilisation de l’application Dossier Noir Stats.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <a className="back-link" href="/">← Retour au tableau de bord</a>
      <article className="legal-card">
        <p className="eyebrow">DOSSIER NOIR STATS</p>
        <h1>Conditions d’utilisation</h1>
        <p className="legal-updated">Dernière mise à jour : 6 août 2026</p>

        <p>
          Les présentes conditions encadrent l’utilisation de Dossier Noir Stats, un tableau de
          bord destiné à analyser les performances des contenus publiés par Dossier Noir.
        </p>

        <h2>1. Objet du service</h2>
        <p>
          Le service centralise des données provenant de plateformes sociales autorisées et fournit
          des outils de visualisation, de comparaison et d’aide à la décision.
        </p>

        <h2>2. Accès et autorisations</h2>
        <p>
          L’utilisateur doit être autorisé à connecter les comptes sociaux concernés. Il s’engage à
          ne pas connecter un compte appartenant à un tiers sans son consentement.
        </p>

        <h2>3. Usage autorisé</h2>
        <ul>
          <li>utiliser le service de manière licite ;</li>
          <li>respecter les conditions et politiques des plateformes connectées ;</li>
          <li>ne pas contourner les restrictions techniques ou limites d’API ;</li>
          <li>ne pas utiliser les données pour nuire à autrui ;</li>
          <li>protéger les identifiants, clés et jetons associés au service.</li>
        </ul>

        <h2>4. Exactitude des données</h2>
        <p>
          Les données peuvent différer temporairement de celles affichées dans les applications
          officielles en raison des délais de synchronisation, limitations d’API ou méthodes de calcul.
        </p>

        <h2>5. Scores, prévisions et revenus estimés</h2>
        <p>
          Les scores de viralité, recommandations, heures suggérées et estimations de revenus ne
          constituent aucune promesse de performance ou de rémunération.
        </p>

        <h2>6. Disponibilité</h2>
        <p>
          Le service peut être interrompu, modifié ou rendu temporairement indisponible pour des
          raisons de maintenance, d’hébergement, de quota ou de changement imposé par une plateforme tierce.
        </p>

        <h2>7. Propriété intellectuelle</h2>
        <p>
          L’identité Dossier Noir, l’interface du tableau de bord et les contenus originaux associés
          restent protégés par les droits applicables.
        </p>

        <h2>8. Responsabilité</h2>
        <p>
          Le service est fourni en l’état. Dans les limites permises par la loi, Dossier Noir ne peut
          être tenu responsable d’une perte résultant uniquement d’une estimation, d’un score interne,
          d’une interruption ou d’une donnée fournie par un tiers.
        </p>

        <h2>9. Suspension ou retrait</h2>
        <p>
          L’accès peut être suspendu en cas d’usage abusif, illégal, dangereux ou contraire aux présentes conditions.
        </p>

        <h2>10. Données personnelles</h2>
        <p>
          Le traitement des données est décrit dans la <a href="/privacy">Politique de confidentialité</a>.
        </p>

        <h2>11. Modifications</h2>
        <p>
          Ces conditions peuvent être modifiées pour refléter l’évolution du service.
          La version applicable est celle publiée sur cette page.
        </p>

        <div className="legal-links">
          <a href="/about">À propos de Dossier Noir Stats</a>
          <a href="/privacy">Politique de confidentialité</a>
          <a href="/">Tableau de bord</a>
        </div>
      </article>
    </main>
  );
}
