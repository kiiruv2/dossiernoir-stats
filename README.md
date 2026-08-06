# Dossier Noir Stats V3

## Inclus
- Graphiques animés Recharts
- Miniatures YouTube automatiques
- Analyse IA avec repli local si aucune clé OpenAI
- Score de viralité heuristique
- Calcul descriptif de la meilleure heure de publication
- Calendrier
- Estimation de revenus configurable
- Classement des hooks
- Alertes internes
- Cron Vercel horaire
- Schéma Supabase
- Saisie manuelle TikTok/Instagram en attendant l'approbation de leurs API

## Important
Certaines fonctions sont prêtes techniquement mais exigent des autorisations externes :
- Instagram : application Meta + permissions Insights
- TikTok : application développeur + Display API/Login Kit
- Notifications externes : canal email, Discord ou Telegram à choisir
- Données privées YouTube (rétention exacte, abonnés gagnés par vidéo) : OAuth YouTube Analytics, pas seulement une clé publique

## Mise à jour depuis la V2
Remplace le contenu du dépôt GitHub par celui de ce ZIP, commit sur `main`, puis Vercel redéploiera automatiquement.

## Variables minimales
- YOUTUBE_API_KEY
- YOUTUBE_CHANNEL_ID

## Variables recommandées
- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- CRON_SECRET

Consulte `INSTALLATION-V3.txt` et `supabase/schema.sql`.
