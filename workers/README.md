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
2. **Verify the email destination:** in Email Routing, confirm
   `hello@cloudnative.lv` is a **verified destination** — `send_email` can only
   send to verified addresses.
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

### Later: attendees
The same bucket can hold `attendees/<event-id>.csv` as the source of truth for
event attendees — add a route + handler when that's needed.

## cloudnative-lv-info (email forward)

Email Worker that forwards inbound mail for `hello@cloudnative.lv` /
`info@cloudnative.lv` to the organizers. Deploying from the repo **takes over** the
existing dashboard-managed worker (same name); the Email Routing rules keep
pointing at it.

- Set the destinations once (keeps personal addresses out of git):
  `cd workers/cloudnative-lv-info && npx wrangler secret put FORWARD_TO`
  (comma-separated, e.g. `andrey@extremeautomation.io,linda.arende@gmail.com`).
- Deploy: the same **Deploy Workers** action (it's in the matrix), or
  `npx wrangler deploy` locally.

## feedback

Backend for the unlisted per-event feedback form (`/events/<slug>/feedback`).
`POST { event, rating, comment }` appends a row to `feedback/<slug>.csv` in R2.
Honeypot + validation + CORS. Wire it up by setting the repo variable
`FEEDBACK_ENDPOINT` to the deployed worker URL (the site passes it as
`VITE_FEEDBACK_ENDPOINT`); reuses the `cloudnative-lv` R2 bucket.

## reminder

Scheduled (daily) Worker that fetches the site's `events.json` and emails the
organizers about gaps — upcoming events with no registration link, recently
finished events missing photos or slides — via the Email Routing `send_email`
binding. No third-party services.

## Planned (skeletons)

Stub workers scaffolded for automation we have in mind — implement, then add the
name to the `workers.yml` deploy matrix:

- **eventbrite** — create/update Eventbrite events from event data.
- **social** — post announcements to LinkedIn + Bluesky (the `/kit` already makes the copy).
- **attendees** — aggregate RSVPs (Eventbrite, OCG) into the R2 CSV; LinkedIn data is
  merged from a local, off-CI collection (TOS).
- **youtube** — upload event recordings with metadata + chapters.
