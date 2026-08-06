export const metadata = {
  title: "Politique de confidentialité — Dossier Noir Stats",
  description: "Politique de confidentialité de l’application Dossier Noir Stats.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <a className="back-link" href="/">← Retour au tableau de bord</a>
      <article className="legal-card">
        <p className="eyebrow">DOSSIER NOIR STATS</p>
        <h1>Politique de confidentialité</h1>
        <p className="legal-updated">Dernière mise à jour : 6 août 2026</p>

        <p>
          Dossier Noir Stats est un tableau de bord privé destiné à regrouper et analyser
          les performances des contenus publiés par Dossier Noir sur différentes plateformes.
          Cette politique explique quelles données peuvent être traitées lorsque le propriétaire
          du compte connecte son compte TikTok à l’application.
        </p>

        <h2>1. Données susceptibles d’être traitées</h2>
        <p>Après autorisation explicite via TikTok Login Kit, l’application peut recevoir :</p>
        <ul>
          <li>l’identifiant du compte TikTok et les informations de profil autorisées ;</li>
          <li>la liste des vidéos autorisées et leurs métadonnées ;</li>
          <li>les statistiques disponibles : vues, mentions J’aime, commentaires et partages ;</li>
          <li>les jetons techniques nécessaires à la connexion sécurisée avec TikTok.</li>
        </ul>
        <p>L’application ne demande pas le mot de passe TikTok et n’accède pas aux messages privés.</p>

        <h2>2. Finalités du traitement</h2>
        <ul>
          <li>afficher les performances des vidéos dans le tableau de bord ;</li>
          <li>produire des graphiques, classements et indicateurs ;</li>
          <li>calculer des estimations et scores internes clairement présentés comme tels ;</li>
          <li>détecter les variations importantes de performance ;</li>
          <li>améliorer la stratégie de publication du compte connecté.</li>
        </ul>

        <h2>3. Base et contrôle de l’utilisateur</h2>
        <p>
          Les données TikTok sont traitées uniquement après l’autorisation du titulaire du compte.
          L’autorisation peut être retirée depuis les paramètres TikTok ou en déconnectant le compte.
        </p>

        <h2>4. Conservation</h2>
        <p>
          Les données sont conservées uniquement pendant la durée nécessaire au fonctionnement
          du tableau de bord et à la création d’un historique de performance. Les jetons d’accès
          sont conservés côté serveur et ne doivent jamais être exposés publiquement dans le code.
          Les données peuvent être supprimées sur demande.
        </p>

        <h2>5. Partage des données</h2>
        <p>
          Les données ne sont ni vendues ni louées. Elles peuvent être traitées par les prestataires
          techniques indispensables au fonctionnement du service, notamment l’hébergeur du site
          et, lorsqu’elle est activée, la base de données.
        </p>

        <h2>6. Analyse automatisée</h2>
        <p>
          Certains indicateurs, comme le score de viralité ou les estimations de revenus, sont des
          calculs internes et ne constituent ni une garantie de résultat ni une donnée officielle
          fournie par TikTok.
        </p>

        <h2>7. Sécurité</h2>
        <p>
          Des mesures raisonnables sont mises en œuvre pour limiter les accès non autorisés.
          Aucun système ne peut toutefois garantir une sécurité absolue.
        </p>

        <h2>8. Droits et suppression</h2>
        <p>
          Le titulaire du compte peut demander l’accès, la rectification ou la suppression des
          données associées en contactant Dossier Noir depuis le compte TikTok officiel ayant
          autorisé l’application.
        </p>

        <h2>9. Services tiers</h2>
        <p>
          L’utilisation de TikTok reste soumise aux propres conditions et politiques de TikTok.
          Dossier Noir Stats est un outil indépendant et n’est ni édité ni approuvé par TikTok.
        </p>

        <h2>10. Modifications</h2>
        <p>
          Cette politique peut évoluer pour refléter les changements techniques, légaux ou
          fonctionnels. La date de mise à jour indiquée en haut de la page sera alors modifiée.
        </p>

        <div className="legal-links">
          <a href="/terms">Conditions d’utilisation</a>
          <a href="/">Tableau de bord</a>
        </div>
      </article>
    </main>
  );
}
