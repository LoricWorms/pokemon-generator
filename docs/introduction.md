# Introduction

Cette application propose une expérience ludique de génération et de gestion de **Pokémon** via **IndexedDB** dans une application React. L'utilisateur peut interagir avec l'application pour générer de nouveaux Pokémon, les collectionner, et les revendre, tout en gérant un solde de jetons.

## Concept général

L'application permet à chaque utilisateur de gérer une collection de Pokémon virtuels et un portefeuille de jetons qui reflète ses actions. Le "Pokédex Score" cumulatif de tous les Pokémon de la collection donne une valeur à l'ensemble de la collection.

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

## Parcours utilisateur

1.  **Accueil et onboarding**
    L’utilisateur découvre son solde initial et accède à une interface simple pour générer des Pokémon.

2.  **Génération d'un Pokémon**
    Une génération de Pokémon démarre et dix (10) jetons sont alors débités immédiatement à la pression du bouton. Un nouveau Pokémon est ensuite créé avec une rareté et un score aléatoires, puis ajouté à la collection locale de l’utilisateur.

3.  **Gestion de la collection**
    Les Pokémon générés peuvent être visualisés dans une collection. Il est possible de les filtrer par rareté et de les trier par date ou par score. Une pagination permet de naviguer dans les collections importantes.

4.  **Revente d'un Pokémon**
    En revendant un Pokémon, l’utilisateur en abandonne la propriété et récupère des jetons sur son solde en fonction de la rareté du Pokémon.

5.  **Pokédex Score**
    Le score de chaque Pokémon s'ajoute au "Pokédex Score" total, qui représente la valeur cumulée de la collection de l'utilisateur.

## Objectifs et principes

*   Offrir une **expérience ludique et engageante** autour de la collection de Pokémon.
*   Garantir une **autonomie utilisateur complète** grâce à la sauvegarde locale et à la résilience offline.
*   Proposer une **économie interne équilibrée** et transparente.
*   Favoriser une interaction continue entre l'action (générer) et la gestion des ressources (jetons, collection).

## Perspectives d’évolution

*   Ajout de fonctionnalités d'échange de Pokémon entre utilisateurs (nécessiterait une backend).
*   Implémentation de combats de Pokémon simplifiés.
*   Intégration avec de véritables APIs Pokémon pour des données plus dynamiques.
