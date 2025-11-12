# UI/UX Styling Guide

This guide outlines the principles and tools for maintaining a consistent and aesthetically pleasing user interface for the Pokémon Generation application.

## Core Principles

*   **Modern & Clean:** Prioritize a clean, minimalist, and modern design that is visually appealing and easy to navigate.
*   **Intuitive:** User interactions should be intuitive and self-explanatory.
*   **Responsive:** The application must be fully responsive and provide an optimal experience across various screen sizes (mobile, tablet, desktop).
*   **Accessible:** Adhere to accessibility best practices (e.g., ARIA attributes, sufficient color contrast, keyboard navigation).
*   **Branded:** Incorporate elements that align with the "Pokémon" theme without infringing on existing intellectual property, focusing on vibrant colors and playful, yet professional, typography.

## Technologies

*   **Tailwind CSS:** All styling will be implemented using Tailwind CSS utility classes. This ensures rapid development, consistency, and a component-driven approach to styling.
*   **Lucide React:** Icons will be sourced exclusively from the `lucide-react` library. Choose icons that clearly convey their purpose and integrate seamlessly with the overall design.

## Typography

*   **Font Family:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif` (as defined in `index.html`).
*   **Headings:** Use strong, legible font sizes and weights for titles (`text-3xl font-extrabold text-indigo-700` for `h1` as seen in `App.tsx`).
*   **Body Text:** Maintain readability with appropriate font sizes and line heights for content.

## Color Palette

Leverage the default Tailwind CSS color palette, with a focus on:
*   **Primary/Accent:** `indigo-600` for primary actions, `indigo-700` for headings, `indigo-400` for focus states.
*   **Backgrounds:** Light gradients (`from-purple-100 to-indigo-200` for body) and clean whites/light grays (`bg-white`, `bg-gray-50`) for content areas.
*   **Alerts:**
    *   `bg-red-500` for errors.
    *   `bg-green-500` for success messages.
    *   `bg-blue-500` for informational messages.
    *   `bg-yellow-500` for warnings.
*   **Text:** `text-gray-800` for primary text, `text-gray-500` for secondary/placeholder text.

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
*   **Input Fields:**
    *   Consistent border, rounded corners, and focus styles (`border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400`).
*   **Lists (e.g., Pokémon Collection):**
    *   Use cards or list items with shadows and clear separation.
    *   Include relevant details (name, rarity, image, timestamp).
    *   Actions (e.g., "Sell" button) should be clearly identifiable.

## Animations & Transitions

*   Use subtle animations for user feedback and improved aesthetics (e.g., button hovers, modal transitions, item additions/deletions).
*   Examples: `transition-colors duration-200`, `animate-fade-in`, `animate-scale-in`, `animate-fade-in-up`.

## Accessibility (A11y)

*   All interactive elements (buttons, inputs) must have appropriate `aria-label` attributes.
*   Modals must be keyboard navigable and escapable.
*   Ensure sufficient color contrast for text and interactive elements.
*   Provide visual focus indicators for keyboard users.
