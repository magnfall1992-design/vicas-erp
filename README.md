# ERP VICAS — version alpha

Application web de gestion intégrée de VICAS S.A.R.L., conçue à partir du cahier des charges
**VICAS-DSI-CDC-ERP-001 v1.2**. Cette alpha sert à faire tester l'ergonomie et les circuits par l'équipe ;
toutes les données sont **fictives**.

## Ce que fait l'alpha

| Module | Contenu |
|---|---|
| **Cockpit Président** | En un coup d'œil : carnet de commandes et avancement des marchés (physique / dépensé / délai), trésorerie disponible et projection sur 13 semaines, disponibilité de la flotte, instances (paiements, requêtes, factures, offres) et alertes automatiques. |
| Marchés et projets | Liste, fiche projet, mise à jour de l'avancement, jalons, demande d'avenant (circuit N4), engins affectés, factures et journal. |
| Offres et appels d'offres | Pipeline En préparation → Soumise → Gagnée/Perdue, échéances, création du marché en un clic. |
| Requêtes et validations | Guichet unique, moteur de validation gradué N0–N4 par incidence financière (seuils paramétrables), rejet motivé, complément, traçabilité. |
| Factures | Fournisseurs : circuit chef de projet (service fait) → RAF → DG au-delà du seuil SF, paiement. Clients : émission, encaissement, créances échues. |
| Trésorerie | Soldes par compte (banques, caisse, Wave, Orange Money), mouvements, prévisions, rapprochement bancaire. |
| Parc et flotte | 31 engins, statuts, affectations, compteurs, entretien préventif, immobilisations. |
| Vidange à la demande | Demandes clients, tarif automatique (forfaits + m³ + km, repris de l'appli Flutter AAAS), planification du camion, encaissement. |
| Paramètres | Seuils de validation, seuil d'alerte trésorerie, délai cible, thème. |

Le sélecteur **« Profil de test »** (en haut à droite) simule chaque rôle (Président/DG, DAF, DT, chef de projet,
chef de parc, achats, commercial, RH, agent) pour éprouver les circuits.

## Deux façons de l'ouvrir

1. **Lien claude.ai (recommandé pour les tests d'équipe)** — base de données partagée : ce qu'un testeur valide,
   les autres le voient en direct. Le lien doit être partagé depuis le menu *Partager* de l'artifact.
2. **GitHub Pages** — `https://magnfall1992-design.github.io/vicas-erp/` après publication.
   Ici l'application tourne en **démo locale** : chaque navigateur a ses propres données (pratique pour une
   démonstration, pas pour un test collectif). Le branchement d'une vraie base (Firebase, Supabase ou serveur
   VICAS) est l'étape suivante.

## Publier sur GitHub

Double-cliquer sur `publier-sur-github.command` (macOS). Le script crée le dépôt public `vicas-erp`,
pousse le code et active GitHub Pages. Il utilise l'outil `gh` (installation : `brew install gh`).

## Structure

```
index.html        application complète (générée)
src/style.css     styles (charte VICAS bleu #2b4ec5 / orange #ee7130)
src/seed.js       jeu de données de démonstration
src/app.js        logique : stockage, moteur de validation, calculs, écrans
build.js          node build.js → régénère index.html (et app.html pour claude.ai)
```

Aucune dépendance : JavaScript natif, graphiques SVG dessinés à la main.
