# TODO

Backlog, in suggested order (quick wins first). Each item notes the approach and the
main files to touch.

## 1. Slide links more visible — small, no blockers

Today slides are a tiny "📄 Slides" text link inside each talk on the event page, and
event cards don't show them at all.

- `src/pages/EventDetail.jsx` — promote the per-talk slides link to a clear button/chip.
- `src/components/EventCard.jsx` — show a "Slides" badge/link when any talk has
  `slidesUrl` (currently slides appear only on the detail page).
- Optional: surface a slides link on the talk cards in `src/pages/Speakers.jsx`.
- i18n: reuse `eventDetail.slides` (no new keys needed).

## 2. Team cards as HTML, not baked images — small (needs headshots)

`Team.jsx` renders a full-bleed `*_card.png` per organizer (text baked into the image).
Replace with a real HTML card like the speaker cards.

- `src/pages/Team.jsx` — swap the big `<img>` for `SpeakerAvatar` (circular headshot) +
  name + role + bio + socials. Role/bio are already in i18n; socials already in `teamConfigs`.
- **Blocker:** need plain headshots in `public/images/team/` — the current
  `andrey_card.png` / `linda_card.png` are pre-composed cards, not portraits.
- Drop the `image` field from `teamConfigs` once headshots replace the card PNGs.

## 3. Subscribe form → real backend — medium (needs a product decision)

`SubscribeModal` currently just opens the CNCF/OCG page; the email field is cosmetic.

- It's a static site (GitHub Pages), so use a hosted endpoint. Options: **Buttondown** or
  **Mailchimp** (real newsletter list) / **Formspree** (just forwards emails) / **lowest
  effort:** relabel as "Join on CNCF" and drop the email field (honest, no backend).
- `src/components/SubscribeModal.jsx` — POST the email in `handleSubmit`; the
  idle/loading/success/error states are already wired. Put the endpoint in a `VITE_…`
  env var or `src/data/socialLinks.js`.
- **Decision needed:** which service/list.

## 4. Per-talk pages for deep linking — large

Give each talk its own URL so talks are shareable, SEO-able, and linkable from Speakers.

- Add a stable per-talk `slug` (in event YAML or derived from the title); have
  `scripts/validate-events.mjs` validate it.
- `src/App.jsx` — route `/events/:slug/talks/:talkSlug`; new `src/pages/TalkDetail.jsx`.
- Link talk titles from `EventDetail` and the `Speakers` cards to the talk page.
- SEO + per-talk JSON-LD; add the routes to `scripts/prerender.mjs`; optional per-talk OG
  (the speaker banner already exists in the artifact kit at `speaker-N.png`).

## Done

- ✅ **Update photos for all events** — refreshed all 6 galleries this session; ongoing
  per-event steps live in `README.md` → "After the event".
