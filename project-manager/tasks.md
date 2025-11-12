# Project Tasks

This document tracks all tasks for the Pokémon generation application.
Tasks are categorized by their status: Done, On Progress, and Planned.

## Done

- [x] Initial React application skeleton with IndexedDB
- [x] Basic CRUD operations for IndexedDB items (add, get all, delete)
- [x] Reusable Button component with loading states and icons
- [x] Generic Modal component for alerts and messages
- [x] UI for displaying IndexedDB items and adding new ones
- [x] Error handling and loading indicators for IndexedDB operations
- [x] Bootstrap `project-manager/tasks.md`
- [x] Bootstrap `project-manager/general-objectives.md`
- [x] Bootstrap `project-manager/styling-guide.md`
- [x] Update `AGENT.md` to enforce new task management guidelines
- [x] Implement API service for Pokémon generation (`services/pokemonApiService.ts`)
- [x] Refactor `indexedDbService.ts` to use `Pokemon` and `UserSetting` types
- [x] Update `types.ts` for Pokémon and token management
- [x] Integrate token management (initial 100 tokens, cost 10 per generation, +5 per sale)
- [x] Implement "Generate Pokémon" functionality (call API, decrement tokens, store in DB)
- [x] Implement "Sell Pokémon" functionality (delete from DB, credit tokens)
- [x] User interface for token balance display
- [x] User interface for Pokémon collection display (images, name, rarity, generated_at)
- [x] Update App.tsx to reflect Pokémon generation theme
- [x] Add loading states and error handling for API calls (initial implementation done, refined error messages for connectivity)
- [x] Investigate and provide guidance for 'Failed to fetch' API errors (client-side implementation is correct, issue is external to client code)
- [x] Re-confirm client-side code correctness for 'Failed to fetch' error (client-side code remains correct, issue is external)
- [x] Continued troubleshooting guidance for 'Failed to fetch' error (reiterating external nature of issue, no client-side code fix possible)
- [x] Added diagnostic logging for Authorization header in API service.
- [x] Enhanced error handling for 401 Unauthorized responses from API.
- [x] Confirmed client-side `Authorization: Bearer EPSI` header construction is correct based on documentation, ruling out client-side code as the source of 401.
- [x] Investigate external reasons for persistent 'Failed to fetch' error (server status, network, CORS). - *Resolved by adapting to `GET` method and `https` protocol as per updated API docs.*
- [x] Adapt API interaction in `pokemonApiService.ts` to new `GET` method and response structure from `docs/api.md`.
- [x] Ensure application responsiveness and accessibility
- [x] Enhance UI/UX for a more engaging "Pokémon generation" experience
- [x] Add visual feedback for token changes (e.g., animations when tokens are gained/spent)
- [x] Implement functionality to sort pokemons by generated date and rarity
- [x] Implement functionality to filter pokemons by rarity
- [x] Implement UI elements (dropdowns/buttons) to control sort and filter options above the collection grid
- [x] Add information icon next to the rarity filter dropdown with a tooltip explaining the rarity scale.
- [x] Implement a "Details" view for individual Pokémon (optional)
- [x] Fix: Address scrolling issue where top elements remain fixed by adjusting `index.html` body/root and `App.tsx` root div styling. (Re-applied)
- [x] Implement dynamic selling prices based on Pokémon rarity.
- [x] Implement Pokedex scoring system based on owned and sold Pokémon by rarity.
- [x] Display Pokedex score in the UI header.

## On Progress

## Planned

- [ ] Implement local storage for user tokens and initial setup (partially done via IndexedDB, but ensure robust first-time user experience)
- [ ] Add a "Rename Pokémon" feature (optional)
- [ ] Add unit/integration tests
- [ ] Optimize image loading and display for large collections
- [ ] Consider adding a prompt input for specific Pokémon generation (if API supports it in the future)