# Cloudflare Workers

Workers for cloudnative.lv, deployed with **wrangler**. Each worker is a folder
with its own `wrangler.toml`.

## subscribe

Backend for the website's newsletter form. `POST { email }`:
1. writes an **immutable per-signup record** `subscribers/incoming/<ts>_<id>.json` — the
   integrity log, written **first** so the CSV can always be re-derived from raw records;
2. injects it into **`subscribers.csv`** in R2 — the **common CRM** and single source of
   truth (schema `email,first,last,linkedin,source,event,added`; a web signup fills
   `email` + `source=web` + `added`, dedups on email, and preserves the blank-email
   follower rows the local CRM ops add);
3. emails the organizers via the Cloudflare **Email Routing `send_email`** binding
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
- **CI:** the **Deploy Workers** action (`.github/workflows/workers.yml`)
  auto-deploys on push to `main` when anything under `workers/` changes, plus a
  manual `workflow_dispatch`. It runs `wrangler deploy`, authenticating with the
  `CLOUDFLARE_API_KEY` secret — a **scoped API token** with *Workers Scripts:
  Edit* + *Workers R2 Storage: Edit* + *Account Settings: Read* — and the
  `CLOUDFLARE_ACCOUNT_ID` secret.
- **Local:** `cd workers/subscribe && npx wrangler deploy` (after `wrangler login`).

### Wire up the website
Set the repo **variable** `SUBSCRIBE_ENDPOINT` to the deployed worker URL (e.g.
`https://cloudnative-lv-subscribe.<subdomain>.workers.dev`). The site build passes
it as `VITE_SUBSCRIBE_ENDPOINT` (see `.github/workflows/deploy.yml`); when unset,
the subscribe form falls back to opening the CNCF/OCG group page.

### Attendees & CRM
Per-event rosters live in the same bucket as `attendees/<event-slug>.csv`, and everyone
is merged into the `subscribers.csv` CRM. These are built by **local npm ops** (no
worker) from the Eventbrite API and manual exports — see
[README.md → Local operations](../README.md#local-operations).

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
`POST { event, overall, talks, organization, topics, comments }` (three optional 1-5
ratings + two free-text fields) writes an **immutable per-submission record**
`feedback/incoming/<slug>/<ts>_<id>.json` **first**, then injects it into
`feedback/<slug>.csv` in R2. Honeypot + validation + CORS. Wire it up by setting the repo
variable `FEEDBACK_ENDPOINT` to the deployed worker URL (the site passes it as
`VITE_FEEDBACK_ENDPOINT`); reuses the `cloudnative-lv` R2 bucket.

## Not workers (by design)

Kept deliberately simple — these are handled outside Workers:

- **Eventbrite + social** — posted manually. The `/kit` generates all the copy
  (announcement, Eventbrite description, speaker intros) and visuals (Eventbrite,
  LinkedIn, OG, speaker banners).
- **Attendees / CRM imports** — built locally into `attendees/<slug>.csv` +
  `subscribers.csv` by the npm ops (Eventbrite API, LinkedIn, OCG, Zoho, NetHunt).
- **Feedback digest & community stats** — local ops, not a cron worker:
  `npm run report:feedback` and `npm run report:subscribers` read R2 and render the
  reports to `reports/`. (A scheduled "digest worker" was considered and dropped.)
- **Reminders / YouTube** — dropped (not needed).

All local ops: [README.md → Local operations](../README.md#local-operations).
