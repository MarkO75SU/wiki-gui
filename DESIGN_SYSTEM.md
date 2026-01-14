# WikiGUI Design System & Railguards

This document defines the visual and functional standards for the WikiGUI project. Adherence to these rules ensures a "High-Trust Professional" aesthetic inspired by institutional standards (e.g., Deutsche Bahn, Deutsche Bank).

## 1. Visual Language
- **Aesthetic:** "Academic Authority." Clean, structured, high-contrast, and purposeful.
- **Palette:** 
    - **Background:** Deep Slate/Black (`#020617`).
    - **Surface:** Dark Navy (`#0f172a`).
    - **Accent/Primary:** Corporate Blue (`#2563eb`).
    - **Typography:** Pure White (`#ffffff`) for headings, Slate (`#94a3b8`) for secondary text.
- **Borders:** Subtle but defined (`#334155`). Use 2px solid accents for active headers.
- **Corners:** Professional sharp/medium (`radius-sm: 4px`, `radius-md: 8px`). Avoid overly rounded "bubbly" shapes.

## 2. Typography
- **Font Stack:** `Inter`, -apple-system, sans-serif.
- **Labels:** 0.75rem, font-weight 700, uppercase, letter-spacing 0.05em.
- **Headings:** Bold, letter-spacing -0.02em.
- **Hierarchy:** Clear distinction between functional labels and instructional text.

## 3. Layout & UX Logic
- **Structured Flow:** Group parameters into logical "Steps" (e.g., Concept, Context, Technical).
- **Accordions:**
    - Use the `.search-group.active` class to handle visibility.
    - Headers must show a distinct active state (e.g., blue bottom border).
    - Avoid inline `display: block/none` styles; let CSS handle transitions.
- **Grids:** Use 1fr/1fr grids for modifiers to maintain balance.
- **Alignment:** Left-aligned headings and descriptions for an institutional "report" feel.

## 4. Component Rules
- **Buttons:** 
    - Primary actions: Full-width, high-contrast blue, uppercase bold text.
    - Secondary/Clear: Transparent with borders.
- **Inputs:** 
    - Background must be darker than the surface (`#020617`).
    - Focus state: 1px solid blue with a subtle glow.
- **Multi-select:** Use "Chips" (hidden checkboxes with styled labels) for Namespaces and Filetypes.
- **Toggles:** Use the "Corporate Switch" (rounded rectangle slider) for binary modes (Advanced/Simple).

## 5. Coding Standards (UI)
- **NO INLINE STYLES:** All layout and decorative logic must reside in `src/css/style.css`.
- **Naming:** Follow BEM-lite or descriptive functional naming (e.g., `.btn-primary`, `.journal-controls`).
- **Tooltips:** Use the `.info-icon` component with `data-info-id` for all parameter explanations.
