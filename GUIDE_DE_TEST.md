# Guide de test — ERP VICAS alpha

Durée : 20 à 30 minutes par testeur. Données fictives : on peut tout cliquer.
Notez chaque remarque avec : écran, profil utilisé, ce que vous attendiez, ce qui s'est passé.

## 1. Président / DG — « tout voir en un coup d'œil »
1. Ouvrir **Cockpit Président**. Pouvez-vous dire en moins d'une minute : quel marché est en difficulté, combien
   de trésorerie est disponible, combien d'engins sont immobilisés, ce qui attend votre décision ?
2. Cliquer sur un marché « À surveiller » ou « Critique » : la fiche explique-t-elle pourquoi ?
3. **Requêtes et validations** → valider le paiement de 95 M (RQ-1041), rejeter une autre demande avec un motif.
4. **Factures** → valider la facture fournisseur de 28,7 M (circuit au niveau DG).

## 2. DAF / RAF
1. Changer le profil en **Directeur administratif et financier**.
2. Valider les requêtes qui vous attendent ; vérifier qu'elles passent ensuite au DG quand le montant l'exige.
3. **Factures › Clients** : encaisser une facture échue ONAS. Le cockpit et la fiche projet se mettent-ils à jour ?
4. **Trésorerie** : rapprocher deux mouvements, ajouter une prévision (ex. échéance fiscale).
5. **Paramètres** : modifier un seuil (ex. S1 = 300 000) et observer le changement de circuit.

## 3. Chef de projet / Directeur technique
1. Profil **Chef de projet** : ouvrir le marché STBV de Thiès, mettre à jour l'avancement, demander un avenant.
2. Suivre l'avenant : profils DT → DAF → DG. Le montant et la date de fin du marché changent-ils à la fin ?
3. **Factures** : attester le « service fait » sur la facture FA-0921.

## 4. Chef de parc / Exploitation
1. **Parc et flotte** : passer HC-03 de « En panne » à « Disponible », relever un compteur.
2. **Vidange à la demande** : créer une demande (le prix se calcule-t-il bien ?), la planifier sur un camion,
   la démarrer, la terminer, l'encaisser. Le statut du camion suit-il ?

## 5. Commercial
1. **Offres** : marquer une offre « Soumise » puis « Gagnée », créer le marché correspondant.

## 6. Agent
1. Profil **Agent** : créer une demande de fournitures à 5 000 FCFA (exécution directe, N0) puis un achat à
   600 000 FCFA (circuit N2) et lire le circuit annoncé avant de soumettre.

## Questions à remonter
- Quels indicateurs manquent au cockpit ? Lesquels sont inutiles ?
- Les seuils proposés (25 k / 250 k / 1 M / 5 M FCFA, factures DG > 2 M) correspondent-ils à la pratique VICAS ?
- Quels types de requêtes ajouter ? Quels champs manquent dans les fiches ?
- L'affichage sur téléphone est-il utilisable sur le terrain ?
