# Mes Taches

Une application de gestion de taches simple et efficace avec categorisation Pro/Perso.

## Fonctionnalites

- **Categorisation Pro/Perso** : Separez vos taches professionnelles et personnelles
- **Persistance locale** : Vos donnees sont stockees dans IndexedDB (aucun serveur)
- **Interface minimaliste** : Design epure et responsive
- **Ajout rapide** : Ajoutez des taches en un clic
- **Completion et suppression** : Gerez facilement vos taches

## Stack technique

- **React 19** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Styles utilitaires
- **IndexedDB** (via idb) - Stockage local
- **Radix UI** - Composants accessibles

## Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd todo-app-simple

# Installer les dependances
npm install

# Lancer en developpement
npm run dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de developpement |
| `npm run build` | Compile l'application pour la production |
| `npm run preview` | Previsualise le build de production |

## Structure du projet

```
src/
├── App.jsx              # Composant principal et UI
├── main.jsx             # Point d'entree
├── index.css            # Styles globaux
├── data/
│   └── db.js            # Couche IndexedDB
├── lib/
│   └── utils.js         # Utilitaires (cn)
└── state/
    └── TasksContext.jsx # Gestion d'etat React Context
```

## Stockage des donnees

Les taches sont stockees localement dans le navigateur via IndexedDB. Si IndexedDB n'est pas disponible, l'application fonctionne en mode memoire (les donnees ne seront pas persistees).

## Licence

MIT
