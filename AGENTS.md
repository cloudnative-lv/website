# AGENTS.md

Rules and conventions for AI agents working on this codebase.

## Tech Stack

- **Framework**: React 19 with Vite 7
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Testing**: Playwright for E2E tests
- **Linting**: ESLint 9 with flat config
- **i18n**: Custom language context (EN/LV)
- **QR Codes**: qrcode.react

## Tailwind CSS v4

- Use **Tailwind CSS v4** utility class names:
  - `bg-linear-to-*` instead of `bg-gradient-to-*` (e.g., `bg-linear-to-r`, `bg-linear-to-b`)
  - `grow` instead of `flex-grow`, `shrink` instead of `flex-shrink`
- Custom theme colors defined in `src/index.css` via `@theme`:
  - `rose-50` through `rose-900` (custom palette)
  - `burgundy` (`#8b1538`) - primary dark color
  - `pink` (`#d4567c`) - primary accent color
  - `pink-light` (`#fdf2f4`) - background color
- Font: Noto Sans (`--font-sans`)

## Project Structure

```
src/
├── components/
│   ├── layout/           # Layout components (Container, Section)
│   ├── AnimatedBackground.jsx
│   ├── Button.jsx
│   ├── CTASection.jsx
│   ├── EventCard.jsx
│   ├── EventQRCode.jsx   # QR code generation
│   ├── FeatureCard.jsx
│   ├── Footer.jsx
│   ├── JsonLd.jsx        # SEO structured data
│   ├── LanguageSwitcher.jsx
│   ├── Navbar.jsx
│   ├── PageHeader.jsx
│   ├── SEO.jsx           # Meta tags management
│   ├── SocialIcons.jsx
│   └── SubscribeModal.jsx
├── data/
│   ├── events/           # YAML event files
│   └── events.js         # Event data loader
├── i18n/
│   ├── LanguageContext.jsx
│   └── translations.js   # EN/LV translations
├── pages/
│   ├── Events.jsx
│   ├── EventDetail.jsx
│   ├── Home.jsx
│   ├── Speakers.jsx
│   ├── Sponsors.jsx
│   ├── Swag.jsx
│   └── Team.jsx
└── index.css             # Tailwind theme
public/
├── images/
│   ├── logo.svg          # Icon-only logo
│   ├── logo-full.svg     # Logo with text
│   ├── og/               # Open Graph images
│   ├── stickers/         # Swag images
│   └── team/             # Team photos
└── favicon.svg
```

## Component Conventions

### Layout Components
Use `Container`, `Section`, `SectionHeading` from `src/components/layout/`:
```jsx
import { Container, Section, SectionHeading } from '../components/layout';

<Container className="py-12">
  <Section>
    <SectionHeading>Title</SectionHeading>
    {/* content */}
  </Section>
</Container>
```

### Page Structure
All pages follow this pattern:
```jsx
<div className="min-h-screen bg-pink-light">
  <SEO title="..." description="..." path="/..." />
  <JsonLdComponent ... />
  <PageHeader title="..." subtitle="..." />
  <Container className="py-12">
    <Section>...</Section>
  </Container>
</div>
```

### Reusable Components
- **Button**: Use for all CTA buttons (`href` for links, `to` for router links)
- **FeatureCard**: Icon + title + description cards
- **CTASection**: White rounded card with centered content
- **PageHeader**: Gradient header with title/subtitle
- **EventQRCode**: QR code with download functionality

## Internationalization (i18n)

- Languages: English (en), Latvian (lv)
- Use `useLanguage()` hook: `const { t, language, setLanguage } = useLanguage();`
- Translations in `src/i18n/translations.js`
- Add translations for both languages when adding new text

## SEO

### Meta Tags
Use `SEO` component on every page:
```jsx
<SEO 
  title="Page Title"
  description="Page description"
  keywords={['keyword1', 'keyword2']}
  path="/page-path"
  image="/images/og/page.png"
/>
```

### JSON-LD Structured Data
Use appropriate schema component from `JsonLd.jsx`:
- `WebPageJsonLd` - Generic pages
- `EventsListJsonLd` - Events listing
- `EventJsonLd` - Single event
- `SpeakersPageJsonLd` - Speakers page
- `TeamPageJsonLd` - Team/about page
- `SponsorsPageJsonLd` - Sponsors page
- `ProductListJsonLd` - Products/swag

## Events Data

Events are defined in YAML files in `src/data/events/`:
```yaml
id: "meetup-1"
slug: "meetup-1"
title: "Meetup #1: Topic"
date: "2025-01-15"
time: "18:00"
endTime: "21:00"
status: "past"  # or "upcoming"
venue:
  name: "Venue Name"
  address: "Address, Riga"
eventbriteUrl: "https://..."
cncfUrl: "https://..."
tags: ["Kubernetes", "DevOps"]
talks:
  - title: "Talk Title"
    speaker: "Speaker Name"
    description: "Talk description"
```

## Social Links

All social touchpoints (update in Footer.jsx, JsonLd.jsx, index.html):
- LinkedIn: https://www.linkedin.com/company/cloud-native-latvia
- CNCF Community: https://community.cncf.io/cloud-native-latvia/
- Bluesky: https://bsky.app/profile/cloudnative.lv
- Eventbrite: https://www.eventbrite.com/o/cloud-native-latvia-95498498498
- GitHub: https://github.com/cloud-native-latvia
- Email: hello@cloudnative.lv

## Code Style

- ES Modules (`"type": "module"`)
- JSX for React components
- ESLint rule: `no-unused-vars` ignores variables starting with uppercase or underscore
- Use functional components with hooks
- Prefer named exports for utility components, default exports for pages

## Commands

- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright tests
- `npm run test:e2e:ui` - Playwright UI mode
- `npm run test:e2e:headed` - Run tests in headed browser

## CI/CD

- **Deploy**: `.github/workflows/deploy.yml` - Deploys to GitHub Pages on push to main
- **E2E Tests**: `.github/workflows/e2e.yml` - Runs Playwright tests on push/PR to main

## Brand Colors (for reference)

- Cloud fill: `#fce4ec`
- Cloud/cube stroke: `#c2185b`
- Cube left face: `#f48fb1`
- Cube right face: `#880e4f`
- Text "CLOUD NATIVE": `#c2185b`
- Text "LATVIA": `#880e4f`
