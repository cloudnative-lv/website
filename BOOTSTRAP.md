# Project bootstrap — Cloudflare + GitHub resources

How the cloudnative.lv backend resources were set up. Everything runs on the
Cloudflare account that owns the **cloudnative.lv** zone (account id
`2206fc831247e31fb22b657089145789`) and deploys from this repo.

## Cloudflare

### R2 (storage)
- Enabled R2 on the account (Dashboard → R2 → enable; required once).
- Created the bucket: `npx wrangler r2 bucket create cloudnative-lv`.
- Objects (the source of truth):
  - `subscribers.csv` — the **common CRM**: one accumulating contact list
    (`email,first,last,linkedin,source,event,added`) merged from the website subscribe
    form plus every local import (Eventbrite, LinkedIn, OCG, Zoho, …).
  - `feedback/<event-slug>.csv` — per-event feedback (feedback worker).
  - `attendees/<event-slug>.csv` — per-event roster, imported locally (see
    **Local operations** below).
  - `subscribers/incoming/*.json` and `feedback/incoming/<slug>/*.json` — immutable raw
    per-submission records the workers write **before** updating the CSVs, so the CSVs can
    always be re-derived (data-integrity log).

### Workers (`workers/`, deployed with wrangler)
Each sets `account_id` + `workers_dev = false` and is served under cloudnative.lv:

| Worker | URL / trigger | Bindings |
|---|---|---|
| **subscribe** | `subscribe.cloudnative.lv` (custom domain) | R2 `SUBSCRIBERS`, `send_email` NOTIFY |
| **feedback** | `feedback.cloudnative.lv` (custom domain) | R2 `FEEDBACK` |
| **forward** (CF: `cloudnative-lv-info`) | Email Routing (hello@/info@) | — (forwards) |

Deploy one: `cd workers/<name> && npx wrangler deploy`.
Or run the **Deploy Workers** GitHub Action (manual `workflow_dispatch`; matrix of all
workers) — it auto-creates the R2 bucket first.

### Email Routing
- `hello@cloudnative.lv` / `info@cloudnative.lv` are custom addresses forwarded to the
  organizers by the **forward** Email Worker (deployed as `cloudnative-lv-info`;
  `FORWARD_TO` secret).
- the subscribe worker sends a notification via the `send_email` binding to `NOTIFY_TO`,
  a **secret** holding one or more **verified Email Routing _destination_ addresses**
  (comma-separated) — so no personal addresses live in git. `hello@` / `info@cloudnative.lv`
  are Worker *routes*, not destinations, so they can't receive worker-sent mail directly.
  R2 logging records every subscriber regardless of email.

### Worker secrets (`wrangler secret put <NAME>` from the worker's folder)
- **forward** (CF `cloudnative-lv-info`) → `FORWARD_TO` = comma-separated forward addresses (keeps
  personal addresses out of git).
- **subscribe** → `NOTIFY_TO` = comma-separated *verified* Email Routing destination
  addresses (where new-member notifications go; keeps personal addresses out of git).

## Local operations (CRM, imports, reports)
Community data jobs are **local npm ops** (no workers): they read/write this bucket via
`wrangler` and read config from `.env` (copy `.env.example`; set `EVENTBRITE_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET`). They build the common CRM in `subscribers.csv` and
the per-event rosters in `attendees/<slug>.csv`, and render the feedback + community
reports. The full op list, flags and the manual export steps (LinkedIn, OCG, Zoho,
NetHunt) are in [README.md → Local operations](./README.md#local-operations); each op is
also a VS Code build task. Needs `wrangler login` (see **Local wrangler**).

## GitHub (`cloudnative-lv/website` → Settings → Secrets and variables → Actions)
- **Secrets:** `CLOUDFLARE_API_KEY` (scoped API token: *Workers Scripts: Edit* +
  *Workers R2 Storage: Edit* + *Account Settings: Read*), `CLOUDFLARE_ACCOUNT_ID`.
- **Variables:** `SUBSCRIBE_ENDPOINT` = `https://subscribe.cloudnative.lv`,
  `FEEDBACK_ENDPOINT` = `https://feedback.cloudnative.lv`. The site build passes them as
  `VITE_SUBSCRIBE_ENDPOINT` / `VITE_FEEDBACK_ENDPOINT`; unset → the forms degrade
  gracefully (subscribe opens the CNCF page; feedback shows "not set up yet").

## Local wrangler
`npx wrangler login` (OAuth) once; then `wrangler deploy` / `wrangler secret put` /
`wrangler r2 ...` work against the account.

## Site (GitHub Pages)
- `cloudnative.lv` apex → GitHub Pages (the React/Vite site). DNS + email on Cloudflare.
- Built/deployed by `.github/workflows/deploy.yml` on push to `main`
  (validate → build → generate artifacts → prerender → deploy + upload artifacts).

## Deprecated
- `cloudnative-lv/event-ops` — archived; superseded by this repo (event data, artifact
  generation, and workers all live here now).
