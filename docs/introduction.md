# Introduction

Cette application propose une expérience ludique de génération et de gestion de **Pokémon** via **IndexedDB** dans une application React. L'utilisateur peut interagir avec l'application pour générer de nouveaux Pokémon, les collectionner, et les revendre, tout en gérant un solde de jetons.

## Concept général

L'application permet à chaque utilisateur de gérer une collection de Pokémon virtuels et un portefeuille de jetons qui reflète ses actions. Le "Score Total" cumulatif des Pokémon de la collection et des profits de revente donne une valeur globale à la progression de l'utilisateur. De plus, les utilisateurs peuvent désormais enregistrer leurs meilleurs "Scores de Session" pour les comparer.

## Fonctionnement du système de jetons

*   Lors de la première connexion, l’utilisateur reçoit **100 jetons**.
*   Chaque génération de Pokémon coûte **10 jetons**.
*   Lorsqu’un Pokémon est revendu, l’utilisateur récupère un nombre de jetons qui varie en fonction de la rareté du Pokémon :
    *   **Common** : 5 jetons
    *   **Uncommon** : 15 jetons
    *   **Rare** : 30 jetons
    *   **Epic** : 60 jetons
    *   **Legendary** : 100 jetons
*   Le solde de jetons ne peut jamais être négatif.

Le solde, les Pokémon et les paramètres utilisateur sont sauvegardés localement pour permettre une expérience **offline**.

### Système de Session Scoring

Le "Score Total" de l'utilisateur (combinaison du score Pokédex actuel et des profits de vente cumulés) peut être sauvegardé manuellement en tant que "Score de Session". Ces scores sont enregistrés localement dans IndexedDB. L'application affiche un "Top 5" des meilleurs scores de session, permettant à l'utilisateur de suivre ses performances au fil du temps. Un score ne peut être sauvegardé que s'il est supérieur à 0.

## Parcours utilisateur

1.  **Accueil et onboarding**
    L’utilisateur découvre son solde initial et accède à une interface simple pour générer des Pokémon.

2.  **Génération d'un Pokémon**
    Une génération de Pokémon démarre et dix (10) jetons sont alors débités immédiatement à la pression du bouton. Un nouveau Pokémon est ensuite créé avec une rareté et un score aléatoires, puis ajouté à la collection locale de l’utilisateur.

3.  **Gestion de la collection**
    Les Pokémon générés peuvent être visualisés dans une collection. Il est possible de les filtrer par rareté et de les trier par date ou par score. Une pagination permet de naviguer dans les collections importantes.

4.  **Revente d'un Pokémon**
    En revendant un Pokémon, l’utilisateur en abandonne la propriété et récupère des jetons sur son solde en fonction de la rareté du Pokémon.

5.  **Score Total et Scores de Session**
    Le score de chaque Pokémon et les profits de revente s'ajoutent au "Score Total". L'utilisateur peut enregistrer ce "Score Total" comme un "Score de Session" et consulter un classement des meilleurs scores.

## Objectifs et principes

*   Offrir une **expérience ludique et engageante** autour de la collection de Pokémon.
*   Garantir une **autonomie utilisateur complète** grâce à la sauvegarde locale et à la résilience offline.
*   Proposer une **économie interne équilibrée** et transparente.
*   Favoriser une interaction continue entre l'action (générer) et la gestion des ressources (jetons, collection).
*   Ajouter un aspect de **gamification** avec le système de high scores de session.

## Perspectives d’évolution

*   Ajout de fonctionnalités d'échange de Pokémon entre utilisateurs (nécessiterait une backend).
*   Implémentation de combats de Pokémon simplifiés.
*   Intégration avec de véritables APIs Pokémon pour des données plus dynamiques.