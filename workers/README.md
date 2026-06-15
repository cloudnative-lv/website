# Cloudflare Workers

Workers for cloudnative.lv, deployed with **wrangler**. Each worker is a folder
with its own `wrangler.toml`.

## subscribe

Backend for the website's newsletter form. `POST { email }`:
1. appends `email,timestamp,source` to **`subscribers.csv`** in an R2 bucket — the
   single source of truth (dedups on email);
2. emails the organizers via the Cloudflare **Email Routing `send_email`** binding
   (no third party).

A hidden `hp` honeypot field and strict email validation guard against spam; CORS
is restricted to `ALLOWED_ORIGINS` in `wrangler.toml`.

### One-time setup (Cloudflare)
1. **R2 bucket:** `npx wrangler r2 bucket create cloudnative-lv` (match
   `bucket_name` in `wrangler.toml`).
2. **Notification recipient:** `send_email` can only deliver to a **verified Email
   Routing destination**, so `NOTIFY_TO` is a **secret** with your verified
   destination address(es), comma-separated (`wrangler secret put NOTIFY_TO`).
   `hello@cloudnative.lv` is a Worker route, not a destination, so it can't receive
   worker-sent mail.
3. **Account id:** set `account_id` in `wrangler.toml`, or pass
   `CLOUDFLARE_ACCOUNT_ID` (the CI workflow does this).

### Deploy
- **CI:** the **Deploy Workers** action (`.github/workflows/workers.yml`, manual
  `workflow_dispatch`) runs `wrangler deploy`, authenticating with the
  `CLOUDFLARE_API_KEY` secret — a **scoped API token** with *Workers Scripts:
  Edit* + *Workers R2 Storage: Edit* + *Account Settings: Read* — and the
  `CLOUDFLARE_ACCOUNT_ID` secret. Uncomment the `push:` trigger once it deploys
  cleanly to auto-deploy on changes under `workers/`.
- **Local:** `cd workers/subscribe && npx wrangler deploy` (after `wrangler login`).

### Wire up the website
Set the repo **variable** `SUBSCRIBE_ENDPOINT` to the deployed worker URL (e.g.
`https://cloudnative-lv-subscribe.<subdomain>.workers.dev`). The site build passes
it as `VITE_SUBSCRIBE_ENDPOINT` (see `.github/workflows/deploy.yml`); when unset,
the subscribe form falls back to opening the CNCF/OCG group page.

### Attendees
Event attendees live in the same bucket as `attendees/<event-slug>.csv`. They're
imported locally (no worker) from Eventbrite / OCG / LinkedIn CSV exports with
`node scripts/import-attendees.mjs` — see `BOOTSTRAP.md`.

## forward (email forward)

Email Worker (folder `forward`, **deployed as `cloudnative-lv-info`** — its
original CF name, so the Email Routing rules + `FORWARD_TO` secret stay valid)
that forwards inbound mail for `hello@cloudnative.lv` / `info@cloudnative.lv` to
the organizers. Deploying from the repo **takes over** the existing
dashboard-managed worker; the Email Routing rules keep pointing at it.

- Set the destinations once (keeps personal addresses out of git):
  `cd workers/forward && npx wrangler secret put FORWARD_TO`
  (comma-separated, e.g. `you@example.com,colleague@example.com`).
- Deploy: the same **Deploy Workers** action (it's in the matrix), or
  `npx wrangler deploy` locally.

## feedback

Backend for the unlisted per-event feedback form (`/events/<slug>/feedback`).
`POST { event, rating, comment }` appends a row to `feedback/<slug>.csv` in R2.
Honeypot + validation + CORS. Wire it up by setting the repo variable
`FEEDBACK_ENDPOINT` to the deployed worker URL (the site passes it as
`VITE_FEEDBACK_ENDPOINT`); reuses the `cloudnative-lv` R2 bucket.

## Not workers (by design)

Kept deliberately simple — these are handled outside Workers:

- **Eventbrite + social** — posted manually. The `/kit` generates all the copy
  (announcement, Eventbrite description, speaker intros) and visuals (Eventbrite,
  LinkedIn, OG, speaker banners).
- **Attendees** — imported locally from CSV exports into `attendees/<slug>.csv`
  with `node scripts/import-attendees.mjs` (see `BOOTSTRAP.md`).
- **Reminders / YouTube** — dropped (not needed).
