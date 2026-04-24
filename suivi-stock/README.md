# Suivi Stock - Application de Gestion de Stock

Application React pour la gestion de stock des techniciens avec interface admin et technicien.

## Fonctionnalités

- **Authentification persistante** : Connexion sauvegardée dans le navigateur
- **Navigation par URL** : Routes distinctes pour chaque vue
- **Interface technicien** : Gestion du stock personnel en temps réel
- **Interface admin** : Vue complète de tous les stocks et gestion des techniciens
- **Synchronisation temps réel** : Mises à jour automatiques via Supabase

## Routes

- `/` - Page de connexion
- `/tech` - Interface technicien (protégée)
- `/admin` - Interface administrateur (protégée)

## Technologies

- React 19
- Vite
- React Router DOM
- Supabase (base de données)
- Zustand (gestion d'état)

## Scripts

```bash
npm install          # Installation des dépendances
npm run dev          # Démarrage du serveur de développement
npm run build        # Construction pour la production
npm run preview      # Aperçu de la version de production
npm run lint         # Vérification du code avec ESLint
```

## Déploiement

L'application est configurée pour Netlify avec le fichier `netlify.toml` à la racine du projet.
