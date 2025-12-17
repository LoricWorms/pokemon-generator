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

## On Progress

## Planned

- [ ] Implement Pokédex UI: Add sort order functionality (date, score) for Pokémon collection.
- [ ] Implement Pokédex UI: Add pagination for Pokémon collection.
- [ ] Implement Pokédex UI: Add Pokémon details modal for individual Pokémon.
- [ ] Implement local storage for user tokens and initial setup (partially done via IndexedDB, but ensure robust first-time user experience)
- [ ] Add unit/integration tests
- [ ] Optimize Pokémon loading and display for large collections