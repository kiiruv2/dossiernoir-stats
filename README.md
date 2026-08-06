# Dossier Noir Stats V2

Dashboard public prêt pour Vercel.

## Ce qui fonctionne immédiatement
- Site public responsive
- Design Dossier Noir
- Page d'administration pour saisir TikTok et Instagram manuellement
- Stockage manuel dans le navigateur
- Synchronisation automatique YouTube dès que les variables Vercel sont configurées
- Actualisation YouTube toutes les 5 minutes

## Déploiement Vercel
1. Crée un dépôt GitHub vide nommé `dossiernoir-stats`.
2. Décompresse ce dossier et envoie tous les fichiers dans le dépôt.
3. Sur Vercel : Add New > Project > Import Git Repository.
4. Choisis le dépôt `dossiernoir-stats`.
5. Clique Deploy. Next.js est détecté automatiquement.
6. Dans Project Settings > Environment Variables, ajoute :
   - YOUTUBE_API_KEY
   - YOUTUBE_CHANNEL_ID
7. Redéploie.

## Activer YouTube automatiquement
1. Ouvre Google Cloud Console.
2. Crée un projet.
3. Active “YouTube Data API v3”.
4. Crée une API key.
5. Copie l’identifiant de ta chaîne YouTube.
6. Ajoute les deux valeurs dans Vercel.

## Instagram et TikTok
Le tableau est préparé pour eux, mais leur connexion automatique exige :
- une application Meta et les permissions Instagram Insights ;
- une application TikTok développeur et les autorisations accordées/validées.
En attendant, la page `/admin` permet de saisir leurs statistiques.

## Important
La page `/admin` de cette version utilise le stockage local du navigateur. Pour une véritable administration privée partagée entre appareils, ajoute ensuite une base de données (Vercel Postgres/Supabase) et une authentification.
