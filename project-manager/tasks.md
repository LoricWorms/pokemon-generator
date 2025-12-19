# Project Tasks

This document tracks all tasks for the Pokémon Generator application.
Tasks are categorized by their status: Done, On Progress, and Planned.

## Done

- [x] Initial React application skeleton with IndexedDB
- [x] Reusable Button component with loading states and icons
- [x] Generic Modal component for alerts and messages
- [x] Bootstrap `project-manager/tasks.md`
- [x] Bootstrap `project-manager/general-objectives.md`
- [x] Bootstrap `project-manager/styling-guide.md`
- [x] Update `AGENT.md` to enforce new task management guidelines
- [x] Define Pokémon-specific types (`Pokemon`, `PokemonRarity`, `PokemonApiResponse`, `SortOrder`) in `types.ts`
- [x] Create `pokemonApiService.ts` for simulating Pokémon generation, rarity, and score calculation
- [x] Refactor `indexedDbService.ts` to use `Pokemon` objects and `POKEMON_STORE_NAME`
- [x] Integrate token management (initial 100 tokens, GENERATION_COST, RARITY_SALE_VALUES)
- [x] Implement basic Pokémon generation functionality (decrement tokens, store in DB)
- [x] Implement basic Pokémon selling functionality (delete from DB, credit tokens based on rarity)
- [x] Update `App.tsx` to handle `Pokemon` state, use generation/selling logic, and display basic Pokémon cards.
- [x] Update `index.html` to fix importmap and restore Pokémon-themed aesthetics.
- [x] Update `metadata.json` and `docs/introduction.md` for Pokémon theme.
- [x] Add visual feedback for token changes (e.g., animations when tokens are gained/spent)
- [x] Re-introduce Pokédex UI: Display Pokémon score/sale value and cumulative score.
- [x] Implement Pokédex UI: Add rarity filter functionality for Pokémon collection.
- [x] Implement Pokédex UI: Add sort order functionality (date, score) for Pokémon collection.
- [x] Implement Pokédex UI: Add pagination for Pokémon collection.
- [x] Implement Pokédex UI: Add Pokémon details modal for individual Pokémon.
- [x] Implement local storage for user tokens and initial setup (partially done via IndexedDB, but ensure robust first-time user experience)
- [x] Unified scoring system: Merging of Pokédex and Sales scores into a single total score.
- [x] Correction de l'affichage des icônes sur les boutons "icône seulement" en omettant la prop 'children' vide.
- [x] Ajout de l'interface SessionScore et de la constante SESSION_SCORES_STORE_NAME dans types.ts.
- [x] Implémentation de la nouvelle objectStore 'sessionScores' et incrémentation de DB_VERSION dans indexedDbService.ts.
- [x] Ajout des fonctions addSessionScore et getTopSessionScores dans indexedDbService.ts.
- [x] Intégration du système de session scoring dans App.tsx (état, fonctions de sauvegarde/chargement, boutons, modal).
- [x] Mise à jour de docs/introduction.md pour documenter le système de session scoring.
- [x] Réorganisation des boutons de modal/sauvegarde/top scores dans une ligne dédiée entre l'en-tête et la collection de Pokémon.
- [x] Mise à jour de l'interface SessionScore dans types.ts pour inclure un champ de pseudo optionnel.
- [x] Incrémentation de DB_VERSION et mise à jour de addSessionScore dans indexedDbService.ts pour prendre en charge le pseudo.
- [x] Ajout d'un champ de saisie de pseudo dans App.tsx et mise à jour de la logique de sauvegarde du score.
- [x] Affichage du pseudo dans le modal "Top 5 Scores de Session".
- [x] Improved the interface by offering a page navigation menu (footer) to access functionalities (Generation, Pokedex, Ranking).
- [x] Optimized Pokémon loading and display for large collections by adding IndexedDB indexes (rarity, score, date).

## On Progress

## Planned

- [ ] Add unit/integration tests
- [ ] Add animations for switching views and new item discovery
- [ ] Explore external real-time PokeAPI integration for full Pokedex data