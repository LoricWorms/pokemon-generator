# General Project Objectives: Pokémon Generator Application

This application aims to provide a fundamental interactive experience for generating, collecting, and managing Pokémon using client-side IndexedDB.

## Core Purpose

The primary goal is to simulate a Pokémon generation and collection game using a React frontend with IndexedDB for local data persistence. It will demonstrate basic CRUD (Create, Read, Update, Delete) operations, resource management (tokens), and a scoring system.

## Key Objectives

1.  **Client-Side Persistence:** Ensure all generated Pokémon and the user's token balance are stored locally using IndexedDB, allowing for offline access and data persistence across sessions.
2.  **Pokémon Generation & Collection:** Allow users to "generate" new Pokémon, each with a name, image, rarity, and score. These Pokémon should be added to the user's collection.
3.  **Resource Management (Tokens):** Implement a token-based economy where users start with 100 tokens, spend 10 tokens per Pokémon generation, and earn tokens for selling Pokémon based on their rarity (Common: 5, Uncommon: 15, Rare: 30, Epic: 60, Legendary: 100).
4.  **Pokédex Scoring:** Calculate and display a cumulative "Pokédex Score" based on the scores of all Pokémon in the user's collection.
5.  **Collection Management:** Provide a user interface for viewing, filtering, sorting, and selling Pokémon from their collection.
6.  **Interactive User Experience:** Offer a fluid and visually appealing interface that aligns with the Pokémon theme.
7.  **Educational Demonstration:** Serve as a practical example of integrating client-side data storage solutions with modern frontend frameworks and external (simulated) API interactions.

## Guiding Principles

*   **User Engagement:** The application should be fun, intuitive, and encourage continuous interaction with the generation and collection mechanics.
*   **Data Integrity:** Ensure reliable storage and retrieval of user data (Pokémon and tokens).
*   **Clarity:** User interface and interactions should be easy to understand, even for new users.
*   **Performance:** Optimize for a smooth user experience during Pokémon generation, collection display, and other data operations.
*   **Responsiveness:** The application should work well across various device sizes (mobile, tablet, desktop).
