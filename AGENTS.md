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

Events are defined in YAML files in `src/data/events/`. Filenames are date-prefixed
(`YYYY-MM-DD-meetup-00N.yaml`) so they sort chronologically:
```yaml
id: "2026-02-11-meetup-004"
slug: "meetup-004-gitops-argocd"
previousSlugs: ["meetup-004-coming-soon"]  # former slugs; old URLs redirect (omit if none)
title: "Meetup #004: Topic"
date: "2026-02-11"   # quoted "YYYY-MM-DD"
time: "18:15"        # doors open, quoted "HH:MM"
startTime: "18:30"   # talks start, for promo art; omit -> falls back to time
endTime: "21:00"
eventbriteUrl: "https://..."   # omit if none
cncfUrl: "https://..."         # CNCF community event page
linkedinUrl: "https://www.linkedin.com/events/..."  # LinkedIn event (omit if none)
photosUrl: "https://photos.app.goo.gl/..."  # Google Photos shared album (omit if none)
venue:
  name: "Venue Name"
  address: "Address, Riga"
  mapUrl: "https://www.google.com/maps/dir//..."
description: |
  Multi-line description and agenda.
talks:
  - title: "Solo Talk"
    speaker: "Speaker Name"          # single speaker
    slidesUrl: "/slides/<event-id>/talk-name.pdf"  # deck in public/slides/ (omit if none)
    description: "Talk description"
  - title: "Co-presented Talk"
    speakers:                        # OR multiple speakers
      - "Speaker One"
      - "Speaker Two"
    description: "Talk description"
tags: ["kubernetes", "devops"]
```

YAML is converted to JS at build time by `@rollup/plugin-yaml` (configured in
`vite.config.js`), so no YAML parser ships to the browser.

**Status is derived, not stored.** `src/data/events.js` computes `status`
(`upcoming` / `past`) per render from `date` + `endTime`, anchored to the
**Europe/Riga** timezone (so visitors worldwide see the same status). Don't add a
`status:` field to the YAML — it is ignored. Malformed `date`/`endTime` values
throw at module load in dev and are treated as `past` in production.

**Renaming a slug?** Keep the old one in `previousSlugs` — `getEventBySlug`
resolves former slugs and `EventDetail` redirects to the canonical URL, so shared
links and QR codes keep working.

**Photo galleries.** Drop web-sized images (~800px wide) into
`src/assets/events/<event-id>/` and `EventPhotoGallery` shows them on that
event's page automatically (sorted by filename) with a "view all" link to the
event's `photosUrl` (Google Photos shared album). No YAML changes needed.

**Slides.** Talk decks live in `public/slides/<event-id>/` (prefer PDF — it
previews in the browser; PPTX downloads). Reference them from the talk's
`slidesUrl`, which may also be an external link (e.g. Canva, GitLab Pages). Compress big PDFs first: `gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook
-o out.pdf in.pdf`.

**Speaker profiles.** `src/data/speakers.yaml` maps the exact speaker name used
in event talks to optional `title` / `company` / `bio` / `linkedin` / `github` /
`cncf` (a certdirectory.io Kubestronaut profile), shown on event pages and the
Speakers page (`SpeakerSocials` renders whichever links exist). Photos: drop
`<speaker-slug>.jpg` (lowercase, diacritics stripped, e.g. `janis-orlovs.jpg`)
into `src/assets/speakers/` — auto-discovered by `src/data/speakers.js`; initials
avatars are the fallback.

> **Note (June 2026):** CNCF migrated its event-publishing platform. New events live
> on `ocgroups.dev/cncf/group/...` (reached via the old `community.cncf.io` links,
> which now redirect). Older events keep their `community.cncf.io/e/<code>` URLs.

## Event Artifacts (banners, OG, QR, social copy)

Per-event promo artifacts are **generated from the event metadata** — never
hand-edited. The templates are React components (`src/artifacts/templates/`) that
reproduce the Figma banner designs; they are screenshotted to PNG/WebP by
Playwright. One design source powers three things: the downloadable files, the
organizer kit page, and the event-page hero/OG image.

- **Templates & matrix:** `src/artifacts/` — `fields.js` (metadata derivations),
  `artifactSpec.js` (the matrix + `/kit/manifest`), `socialCopy.js` (deterministic
  EN post copy), `templates/*` (banner components). Add or change a banner by
  editing a template + `artifactSpec`.
- **Generate locally:** `npm run dev` then
  `ARTIFACT_BASE=http://localhost:5173 node scripts/generate-artifacts.mjs [slugFilter]`.
  Outputs to `dist/artifacts/<event-id>/` (and `dist/artifacts/brand/` for the
  set-once OCG banners). **Build-time only — not committed**; CI regenerates them
  and publishes to Pages + uploads them as workflow artifacts.
- **Organizer kit (unlisted):** `/kit` (index) and `/kit/:slug` (one event) show
  live previews with per-file + zip download and copy-to-clipboard social text.
  Not in the nav — reach by direct link.
- **On the event page:** the generated `og.png` is the per-event `og:image`, and
  `linkedin-event-speakers.png` is shown as the page hero (both hidden gracefully
  in dev, where the files don't exist yet).
- **Platforms:** banners cover LinkedIn (event 1600×900, post 1280×720, speaker
  1280×720), Eventbrite (2160×1080), Bevy (2560×650, **legacy**), OG (1200×630),
  and OCG — the decorative breadcrumb strip that replaced Bevy (desktop 2428×192 +
  mobile 1220×192 WebP, ≤1 MiB). See the event-publishing runbook in `README.md`.

## Social Links

All social touchpoints (update in Footer.jsx, JsonLd.jsx, index.html):
- LinkedIn: https://www.linkedin.com/company/cloud-native-latvia
- CNCF Community: https://community.cncf.io/cloud-native-latvia/
- Bluesky: https://bsky.app/profile/cloudnativelatvia.bsky.social
- YouTube: https://www.youtube.com/@CloudNativeLatvia
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
