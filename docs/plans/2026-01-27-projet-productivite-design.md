# Projet productivite - design

## Objectif
Creer une web app mobile-first de productivite personnelle basee sur un tableur editable, avec une vue Kanban. Stockage 100% local, sans compte, sans synchronisation, et fonctionnement offline.

## Portee du MVP
- Vues: Tableur + Kanban (onglets en haut)
- Colonnes: Nom, Statut, Echeance, Projet/Etiquette, Notes
- Statuts: A faire, En cours, Bloque, Termine
- Recherche texte et filtres rapides (statut, echeance)
- Drag-and-drop pour changer le statut dans le Kanban
- Stockage local via IndexedDB

Hors scope: comptes, sync, multi-projets, import/export, formules type tableur.

## Architecture
- Frontend: React + Vite, UI mobile-first
- Persistance: IndexedDB via une couche data (CRUD + migrations simples)
- Etat global: React Context + reducer
- Components: Table, Kanban, Tabs, Filters, TaskForm, EmptyState
- Screens: TableView, KanbanView

Flux:
1) Au chargement, lecture des taches depuis IndexedDB.
2) Le store charge en memoire la liste des taches et l'etat des filtres.
3) Toute modification met a jour le store, puis persiste via la couche data.

## Modele de donnees
Task:
- id: string (uuid)
- name: string
- status: 'A faire' | 'En cours' | 'Bloque' | 'Termine'
- dueDate: string | null (ISO)
- label: string | null
- notes: string | null
- createdAt: string (ISO)
- updatedAt: string (ISO)
- order: number | null (tri manuel optionnel)

## UX et interactions
Tableur:
- Edition inline: tap pour editer, enter pour valider, esc pour annuler.
- Date picker mobile-friendly pour Echeance.
- Selects simples pour Statut et Projet/Etiquette.
- Notes editees via un panneau/modal sur mobile.
- Table scrollable horizontalement, colonnes importantes en tete.

Kanban:
- 4 colonnes avec compteur.
- Cartes compactes (Nom, Echeance, Etiquette).
- Drag-and-drop met a jour status.
- Fallback mobile: menu "Changer de statut" si drag difficile.

Filtres:
- Recherche texte (Nom + Notes).
- Filtre Statut.
- Filtre Echeance: en retard, cette semaine, sans date.

CTA:
- Bouton "Nouvelle tache" (formulaire plein ecran sur mobile).

## Gestion des erreurs
- Si IndexedDB indisponible, bascule en mode memoire non persistant.
- Affiche un bandeau non bloquant en cas d'erreur de sauvegarde.

## Tests
- Unitaires: filtrage, tri, groupement Kanban.
- Integration: creation tache, edition inline, changement de statut, filtres.

## Limites et decisions
- Le "tableur" est un tableau editable, pas un tableur a formules.
- Pas de multi-projets ni d'import/export dans le MVP.
- Drag-and-drop degrade sur certains mobiles, avec fallback.

## Prochaines etapes
- Initialiser le projet React/Vite.
- Implementer la couche IndexedDB.
- Construire la vue Tableur et les filtres.
- Construire la vue Kanban + drag-and-drop.
- Ajouter tests de base.
