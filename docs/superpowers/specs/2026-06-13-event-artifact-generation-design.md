# Event Artifact Generation — Design

**Date:** 2026-06-13
**Status:** Approved (pending written-spec review)
**Repo:** `website/` (the React/Vite site; the git repo)

## Goal

Generate **all per-event promotional artifacts** from the templates (Figma-exported
banner designs) and the existing event metadata, so organizers never hand-edit a
banner. Two consumption tiers:

1. **On-page tier** — artifacts attached to and visible on the live site
   (per-event `og:image`, a hero/share banner on the event page).
2. **Side tier** — artifacts generated but **not linked from the site nav**,
   reachable by direct link: an organizer "kit" page per event to preview and
   download every banner (all or one), the QR code, and copy-paste social text.

## Key constraint that shaped the approach

The 7 Figma SVG exports are **fully flattened** — every text run is outlined to
`<path>` (0 `<text>` elements); only the speaker-photo slots are real `<image>`
elements. They cannot be parametrized by text substitution. The templates are
therefore **re-authored as parametric HTML/CSS** (React components), using the
exports as the visual spec.

## Chosen approach: HTML/CSS components + Playwright screenshot

- Each banner design becomes a React component bound to event/talk metadata.
- A Node script drives **Playwright** (already a dev dependency) to load each
  component full-bleed at exact pixel dimensions and screenshot it to PNG.
- The **same components** render the live organizer "kit" page and the event-page
  hero — one design source, three uses (download PNGs, kit previews, hero).
- Reuses existing infrastructure: Tailwind v4 theme (brand colors in `index.css`),
  the logo SVG, `qrcode.react`. Variable-length talk titles wrap for free.
- Fully reproducible in CI, no external API.

Approaches rejected: **parametric SVG + rsvg** (no text auto-wrap; manual line
measurement for variable titles; harder to match the design) and **Figma API**
(couples generation to Figma file/token/availability; poor for CI regeneration;
flattened exports hide the live layer structure).

## Source of truth

The website's own data: `src/data/events/*.yaml` + `src/data/speakers.yaml` +
`src/assets/speakers/*.jpg`. `event-ops/` stays a stub. When its canonical event
schema (PLAN-OPS § A1) is built later, this generator moves downstream of it with
no template changes — only the data loader swaps.

## Output location & lifecycle — build-time only (not committed)

Generated files are **not committed** to the repo. They are produced by the build
pipeline and consumed two ways:

- **Published to GitHub Pages**: the generation step runs after `vite build` and
  writes into `dist/artifacts/<event-id>/…`, so the files deploy with the site and
  are available as stable direct links (e.g.
  `https://cloudnative.lv/artifacts/2026-06-10-meetup-006/linkedin-event.png`).
- **Pipeline artifacts**: the CI run also uploads `dist/artifacts/` via
  `actions/upload-artifact`, so the team can download the full set from the Actions
  run without visiting the site.

`dist/` is already gitignored, so this needs no `.gitignore` change. Locally,
`npm run generate:artifacts` builds + generates into `dist/artifacts/` on demand.

**Consequence (important):** because PNGs exist only in `dist`, anything shown in
the **dev server** must render the **live React component**, not reference a PNG
file. So:
- The **event-page hero** renders the live banner component (responsive).
- The **`/kit` previews** render live components.
- Only the **deployed `og:image`** and **deployed direct-link PNGs** point at
  `dist/artifacts/…` files (production only; not expected to resolve in dev).

## Artifact matrix (per event)

Two template families:

- **Event-level** — show event number/title/date/logistics, no specific speaker.
- **Talk-level** — show a talk title + its speaker(s); template auto-selected by
  speaker count (1 → single-speaker, 2 → two-speaker layout).

| Variant key | Dimensions | Level | Content | Variants |
|---|---|---|---|---|
| `bevy` | 2560×650 | event | `#N Meetup` + skyline | single — **legacy platform, kept** |
| `eventbrite` | 2160×1080 | event | title + date + logo | `title-only` **+ `with-speakers`** |
| `linkedin-event` | 1600×900 | event | title + date + logo | `title-only` **+ `with-speakers`** |
| `linkedin-post` | 1280×720 | event | date / start-time / venue card | single |
| `speaker` | 1280×720 | **per talk** | talk title + speaker(s) | auto 1- or 2-speaker |
| `og` | 1200×630 | event | title + date (mirrors `linkedin-event`) | single (title-only) |
| `qr` | svg + png | event | encodes `https://cloudnative.lv/events/<slug>` | — |
| `announcement` | .md | event | deterministic text | — |
| `speaker-intro` | .md | **per talk** | deterministic text | — |

**`with-speakers` event variant (new, from decision (d)):** same event-banner
layout as the title-only original, plus a row of small speaker chips
(circular photo + name) for every talk's speaker(s). The original title-only
variant is kept. Applies to `eventbrite` and `linkedin-event`. `bevy` (tiny
header) and `linkedin-post` (logistics card) stay single. `og` stays title-only
to remain legible at small preview sizes.

Worked example — **meetup #006** (2 talks, 2 solo speakers) produces:
`bevy` ×1, `eventbrite` ×2, `linkedin-event` ×2, `linkedin-post` ×1,
`speaker` ×2, `og` ×1 → **9 PNGs**; plus `qr` (svg+png); plus `announcement` ×1
and `speaker-intro` ×2 (text). A `manifest.json` lists them all.

## OCG platform (Open Community Groups) — image model

CNCF migrated event publishing from **Bevy** to **Open Community Groups**
(`ocgroups.dev`; open source: `cncf/open-community-groups`). Old `community.cncf.io`
URLs redirect; event `cncfUrl` values already point at `ocgroups.dev` (see AGENTS.md
note). OCG's image slots, from repo code + schema:

| Slot | Dimensions | Format | Notes |
|---|---|---|---|
| Banner (desktop) | 2428×192 (~12.6:1) | png/jpg/webp/svg, ≤1 MiB | **decorative strip behind the breadcrumb nav — no baked-in text** (title/logo overlaid by the page UI) |
| Banner (mobile) | 1220×192 (~6.4:1) | same | separate `banner_mobile_url` |
| Logo | 360×360 | same | rendered ~96–112px; existing square logo covers this |
| Event photos | 1280×720 | same | gallery (`photos_urls[]`); existing event photos fit |
| OG preview | **1200×630 (enforced)** | png/jpg/webp (no svg) | community/group level; our `og` artifact is already valid here |

Constraints: 1 MiB max upload; file extension must match detected format; banners
**inherit** event → group → community (so a decorative banner is a set-once asset).

### OCG banner — brand asset (decision)

The banner is decorative and inherited, so we generate **one CN Latvia skyline strip**,
not a per-event image:
- `ocg-banner-desktop` — 2428×192, **WebP** (≤1 MiB)
- `ocg-banner-mobile` — 1220×192, **WebP**

Authored as `OcgBanner.jsx` (Riga skyline + brand gradient, **no event text**),
rendered at both sizes by the same Playwright pipeline, screenshot to PNG then
converted to WebP via `sharp`. Set once at the OCG group/community level; all events
inherit it. The legacy `bevy` banner stays in the kit, labelled legacy.

### Brand / platform assets (not per-event)

`artifactSpec.js` gains a small **brand asset** list, generated once and independent
of any event: the two OCG banner strips, emitted to `dist/artifacts/brand/`. The
`/kit` index surfaces them under "Platform assets" alongside the 360×360 logo and the
1200×630 OG image.

## Field mappings & derivations (`fields.js`)

- **Meetup number** — from `id` (`…-meetup-006` → `6`), leading zeros stripped.
- **Clean title** — strip the `Meetup #00N:` prefix from `title` →
  `GPUs and AI Agents`.
- **Date** — `2026-06-10` → `10.06.2026` (DD.MM.YYYY); long form `10th of June`
  for the post card.
- **Speaker line** — look up the talk's speaker name in `speakers.yaml`; compose
  `title` + `company` → `CTO & Co-founder @ Nuoxera` (render whichever exists).
  Photo: `src/assets/speakers/<slug>.jpg` (lowercase, diacritics stripped); fall
  back to initials avatar (reuse `SpeakerAvatar` logic).
- **Start time (new field, decision (b))** — the LinkedIn post card shows the
  talks-start time (18:30), but YAML `time` is doors-open (18:15). Add an
  **optional `startTime: "HH:MM"`** to the event YAML; when absent it defaults to
  `time`. Promo art uses `startTime`; the rest of the site keeps using `time`
  (doors). Update `AGENTS.md` events schema doc accordingly.

## Components & file layout (in `website/`)

```
src/artifacts/                      # generation-only; lazy-loaded, kept out of main bundle
  templates/
    BannerFrame.jsx                 # shared: skyline bg + logo + exact-size wrapper
    BevyBanner.jsx
    EventbriteBanner.jsx            # supports title-only | with-speakers
    LinkedInEventBanner.jsx         # supports title-only | with-speakers; also the hero
    LinkedInPostImage.jsx
    SpeakerBanner.jsx               # 1- or 2-speaker layout
    OgImage.jsx
    SpeakerChip.jsx                 # small photo+name used by with-speakers variants
    OcgBanner.jsx                   # decorative OCG breadcrumb strip (desktop 2428×192 + mobile 1220×192) → WebP
  assets/
    skyline.svg                     # standalone Riga skyline; source = an existing
                                    # design/*riga*.svg asset or extracted from a Figma
                                    # export — pick whichever best matches the banner silhouette
  artifactSpec.js                   # event -> [{ variant, key, w, h, Component, props, filename }]
  socialCopy.js                     # deterministic EN text templates
  fields.js                         # derivations above (pure, unit-tested)
  KitPage.jsx                       # one event's organizer kit (route /kit/:slug)
  KitIndex.jsx                      # list of events (route /kit)
  KitRaw.jsx                        # full-bleed single artifact (route /kit/:slug/raw/:variant)
scripts/
  generate-artifacts.mjs           # Playwright driver + QR emit + text emit + manifest
```

Routes (registered but **not in nav**; reachable by direct link only):
- `/kit` — index of all events.
- `/kit/:slug` — one event's kit: every banner rendered live, each with a
  **Download PNG** button; **Download all (.zip)** (client-side `jszip`); the QR
  (svg/png); social copy as **copy-to-clipboard** blocks.
- `/kit/:slug/raw/:variant` — single artifact full-bleed, no chrome — the
  screenshot target for Playwright. Variant key encodes sub-variant where needed
  (e.g. `linkedin-event--with-speakers`, `speaker--<talk-index>`).

## Generation script flow (`scripts/generate-artifacts.mjs`)

1. `vite build` has run; serve `dist/` (or use `vite preview`).
2. Load events (reuse the YAML through a small Node loader mirroring
   `src/data/events.js`).
3. For each event, expand via `artifactSpec.js` into the artifact list.
4. For each image artifact: navigate Playwright to `/kit/:slug/raw/:variant`, set
   viewport to exact `w×h`, wait for fonts/images, screenshot the root element to
   PNG; convert to the artifact's target format (PNG, or **WebP** for OCG strips, via
   `sharp`) → `dist/artifacts/<id|brand>/<filename>`.
5. Emit QR with the `qrcode` Node lib → `qr.svg` + `qr.png` (no browser needed).
6. Emit social copy from `socialCopy.js` → `announcement.md`,
   `speaker-<slug>.md`.
7. Write `dist/artifacts/<id>/manifest.json` (drives the kit page's download-all
   and is a machine-readable index).

## Social copy (deterministic templates, decision: "Deterministic templates")

EN only (LinkedIn/Bluesky). `socialCopy.js` produces, per event:
- **Announcement** — clean title, date + start time, venue, one line per talk
  (title — speaker), registration links (`cncfUrl`, `eventbriteUrl` when present),
  hashtags from `tags` + house tags (`#CloudNative #Kubernetes #Riga #Latvia`).
- **Speaker-intro** (per talk) — speaker name + role/company, talk title, a
  one-sentence hook derived from the talk `description`, event date, register CTA.

Surfaced as copy-to-clipboard blocks on `/kit/:slug` and emitted as `.md` files
in the artifact output.

## On-page integration

- **`EventDetail.jsx`** — pass `image={'/artifacts/<id>/og.png'}` to the existing
  `SEO` component (line ~46) for a **per-event `og:image`** (today it falls back to
  one static default).
- **Hero** — render the live `LinkedInEventBanner` (with-speakers) responsively
  near the top of the event page as the "share image" visible on the page.

## CI / pipeline changes (`deploy.yml`)

Insert after the existing **Build** step, before **Upload artifact**:
1. **Install Playwright browser** — `npx playwright install --with-deps chromium`.
2. **Generate artifacts** — run `node scripts/generate-artifacts.mjs` (serves the
   freshly built `dist/`, writes `dist/artifacts/`). The existing
   `upload-pages-artifact` then publishes them with the site.
3. **Upload pipeline artifacts** — `actions/upload-artifact@v4` with
   `path: dist/artifacts` so the set is downloadable from the Actions run.

## New dependencies

- `@fontsource/noto-sans` — bundle Noto Sans so Playwright renders identically on
  every machine and in CI (don't rely on system fonts).
- `qrcode` — Node QR emit (svg+png) in the script.
- `jszip` — client-side "download all" zip on the kit page.
- `sharp` — convert Playwright PNG screenshots to **WebP** (OCG strips) and keep files
  within OCG's 1 MiB limit.

## Testing

- **Unit** — `fields.js` derivations (meetup number, clean title, date formats,
  speaker line) and `socialCopy.js` (snapshot of announcement + speaker-intro for a
  fixture event).
- **DOM/e2e (Playwright)** — for a fixture event, visit each
  `/kit/:slug/raw/:variant`, assert the expected text is present, image slots are
  filled, and the root element measures exactly `w×h`.
- **Generation smoke (CI)** — generate one event's artifacts and assert the
  expected files exist with correct PNG dimensions and a well-formed
  `manifest.json`.

## Known limitations / out of scope

- **OG image + SPA crawlers** — `SEO.jsx` sets meta tags via `useEffect`, which
  social crawlers (LinkedIn/Facebook) do not execute. The generated per-event
  `og:image` **file is correct and usable**, but crawlers won't pick it up until
  the site emits per-route meta in **static HTML** (pre-render/SSG). That fix is a
  **separate follow-up**, not part of this work. Documented here so it isn't
  mistaken for done.
- **Figma round-trip** — designs are re-authored in code; changes made later in
  Figma are not auto-synced back. The code components are the source of truth going
  forward.
- **Non-Latin / very long titles** — templates must degrade gracefully (auto-fit
  font size / wrapping); covered by the DOM tests with a long-title fixture.

## Build sequence

1. **Foundation** — source `skyline.svg` (existing `design/*riga*.svg` or extract);
   add Noto Sans; `BannerFrame`,
   `fields.js`, `artifactSpec.js`; unit tests for `fields.js`.
2. **Event-level banners** — `BevyBanner`, `EventbriteBanner`,
   `LinkedInEventBanner`, `LinkedInPostImage` (title-only); `KitRaw` route;
   `generate-artifacts.mjs` screenshot loop → PNGs into `dist/artifacts/`.
3. **Talk-level + OG + with-speakers + OCG** — `SpeakerBanner` (1/2), `OgImage`,
   `SpeakerChip` + `with-speakers` event variants; `OcgBanner` desktop+mobile WebP
   brand strip (via `sharp`).
4. **QR + social copy** — `qrcode` emit; `socialCopy.js`; `manifest.json`.
5. **Kit pages** — `KitIndex`, `KitPage` (live previews, per-file + zip download,
   copy-to-clipboard); register unlisted routes.
6. **On-page integration** — per-event `og:image` in `EventDetail`; live hero;
   `startTime` field + `AGENTS.md` schema update.
7. **CI + tests** — `generate:artifacts` npm script; `deploy.yml` steps; DOM e2e +
   generation smoke test.
