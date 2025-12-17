# UI/UX Styling Guide

This guide outlines the principles and tools for maintaining a consistent and aesthetically pleasing user interface for the Pokémon Generator application.

## Core Principles

*   **Playful & Engaging:** The design should evoke a sense of fun and adventure, reminiscent of the Pokémon universe.
*   **Intuitive:** User interactions, especially generation and collection management, should be intuitive and easy to grasp.
*   **Responsive:** The application must be fully responsive and provide an optimal experience across various screen sizes (mobile, tablet, desktop).
*   **Accessible:** Adhere to accessibility best practices (e.g., ARIA attributes, sufficient color contrast, keyboard navigation).
*   **Vibrant & Dynamic:** Use a vibrant color palette and subtle animations to bring the application to life.

## Technologies

*   **Tailwind CSS:** All styling will be implemented using Tailwind CSS utility classes. This ensures rapid development, consistency, and a component-driven approach to styling.
*   **Lucide React:** Icons will be sourced exclusively from the `lucide-react` library. Choose icons that clearly convey their purpose and integrate seamlessly with the overall Pokémon theme.

## Typography

*   **Font Family:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif` (as defined in `index.html`).
*   **Headings:** Use strong, legible font sizes and weights for titles (e.g., `text-4xl font-extrabold text-indigo-700`).
*   **Body Text:** Maintain readability with appropriate font sizes and line heights for content.

## Color Palette

Leverage the default Tailwind CSS color palette, with a focus on:
*   **Primary/Accent:** `indigo-600` for primary actions and highlights, `indigo-700` for headings, `indigo-400` for focus states.
*   **Backgrounds:** A gradient (`from-blue-200 via-purple-300 to-pink-200`) for the overall body, with `bg-white` for the main content container. Lighter shades like `bg-indigo-50` for interactive sections.
*   **Pokémon Rarity Colors:**
    *   `Common`: `text-gray-500`
    *   `Uncommon`: `text-green-600`
    *   `Rare`: `text-blue-600`
    *   `Epic`: `text-purple-600`
    *   `Legendary`: `text-yellow-600`
*   **Alerts:**
    *   `bg-red-500` for errors.
    *   `bg-green-500` for success messages.
    *   `bg-blue-500` for informational messages.
    *   `bg-yellow-500` for warnings.
*   **Tokens:** Highlight with `text-yellow-500` for visual impact.

## Component Specifics

*   **Buttons:**
    *   Defined in `components/Button.tsx`.
    *   Variants: `primary` (indigo), `secondary` (gray), `danger` (red).
    *   Sizes: `sm`, `md`, `lg`.
    *   Always include clear hover states and focus rings.
    *   Loading state with spinner.
*   **Modals:**
    *   Defined in `components/Modal.tsx`.
    *   Should have a clear backdrop, smooth entrance/exit animations (`animate-fade-in`, `animate-scale-in`).
    *   Header color should reflect the `AlertType` of the message.
    *   Clear close button (`X` icon).
*   **Pokémon Cards:**
    *   Display Pokémon image (`pixelated` where appropriate for retro feel), name, rarity, score, and creation date.
    *   Use distinct colors for rarity text.
    *   Include a "Sell" button.
*   **Header:** Feature the app title prominently, potentially flanked by Pokémon icons (e.g., Pikachu).

## Animations & Transitions

*   **Token Pulse:** Animate token count changes with a subtle pulsing effect (`animate-token-pulse`).
*   **New Pokémon Reveal:** Add a reveal animation when a new Pokémon is generated (`animate-new-pokemon-reveal`).
*   **Temporary Ring Pulse:** Use a temporary ring pulse for focus or highlight states (`animate-temporary-ring`).
*   Use subtle animations for user feedback and improved aesthetics (e.g., button hovers, modal transitions).

## Accessibility (A11y)

*   All interactive elements (buttons, inputs) must have appropriate `aria-label` attributes.
*   Modals must be keyboard navigable and escapable.
*   Ensure sufficient color contrast for text and interactive elements.
*   Provide visual focus indicators for keyboard users.