# Suivi Stock - Application de Gestion de Stock

Application React pour la gestion de stock des techniciens avec interface admin et technicien.

## ✨ Fonctionnalités

- **Authentification persistante** : Connexion sauvegardée dans le navigateur
- **Navigation par URL** : Routes distinctes pour chaque vue
- **Interface technicien** : Gestion du stock personnel en temps réel
- **Interface admin** : Vue complète de tous les stocks et gestion des techniciens
- **Synchronisation temps réel** : Mises à jour automatiques via Supabase
- **🔥 PWA (Progressive Web App)** : Installation sur mobile, fonctionnement hors ligne

## 📱 PWA - Application Mobile

L'application peut être installée sur les appareils mobiles comme une vraie application native :

### Installation
- **Sur mobile** : Un bandeau "Installer Stock Techniciens" apparaît automatiquement
- **Sur desktop** : Bouton d'installation dans la barre d'adresse du navigateur
- **Nom** : "Stock Techniciens" sur l'écran d'accueil

### Fonctionnement hors ligne
- **Cache automatique** : L'app fonctionne même sans connexion internet
- **Indicateur visuel** : Point rouge en haut à droite quand hors ligne
- **Message clair** : "Hors ligne — Données non à jour" en bandeau rouge

### Avantages PWA
- **Performance** : Chargement instantané après installation
- **Fiabilité** : Fonctionne hors ligne
- **Engagement** : Apparait comme une vraie app sur l'écran d'accueil
- **Mises à jour** : Se met à jour automatiquement

## Routes

- `/` - Page de connexion
- `/tech` - Interface technicien (protégée)
- `/admin` - Interface administrateur (protégée)

## Technologies

- React 19 + Vite
- React Router DOM (navigation)
- Supabase (base de données temps réel)
- Zustand (gestion d'état)
- Vite PWA (Progressive Web App)
- Workbox (service worker)

## Scripts

```bash
npm install          # Installation des dépendances
npm run dev          # Démarrage du serveur de développement
npm run build        # Construction pour la production
npm run preview      # Aperçu de la version de production
npm run lint         # Vérification du code avec ESLint
```

## Déploiement

L'application est déployée sur Netlify avec configuration automatique :
- **URL** : https://stock-crf-suivi.netlify.app
- **Build command** : `npm run build`
- **Publish directory** : `dist`
- **Déploiement automatique** : À chaque push sur la branche `main`

## PWA - Détails techniques

- **Service Worker** : Cache automatique des ressources statiques
- **Manifest** : Configuration pour l'installation et l'apparence
- **Mode standalone** : S'ouvre comme une app native
- **Orientation portrait** : Optimisée pour les téléphones
- **Thème** : Blanc avec icône bleue personnalisée
