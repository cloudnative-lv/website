# AGENTS.md

Rules and conventions for AI agents working on this codebase.

## Tech Stack

- **Framework**: React 19 with Vite 7
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Testing**: Playwright for E2E tests
- **Linting**: ESLint 9 with flat config

## Tailwind CSS

- This project uses **Tailwind CSS v4**. Use the new utility class names:
  - `bg-linear-to-*` instead of `bg-gradient-to-*` (e.g., `bg-linear-to-r`, `bg-linear-to-b`)
  - `grow` instead of `flex-grow`, `shrink` instead of `flex-shrink`
- Custom theme colors defined in `src/index.css` via `@theme`:
  - `rose-50` through `rose-900` (custom palette)
  - `burgundy` (`#8b1538`)
  - `pink` (`#d4567c`)
  - `pink-light` (`#fdf2f4`)
- Font: Noto Sans (`--font-sans`)

## Project Structure

- **Components**: `src/components/` - Reusable UI components
- **Pages**: `src/pages/` - Route-level page components
- **Data**: `src/data/` - Static data and event definitions (YAML files in `src/data/events/`)
- **Assets**: `src/assets/` and `public/images/`

## Code Style

- ES Modules (`"type": "module"`)
- JSX for React components
- ESLint rule: `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`)

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright tests
- `npm run test:e2e:ui` - Playwright UI mode
- `npm run test:e2e:headed` - Run tests in headed browser
