# Project bootstrap — Cloudflare + GitHub resources

How the cloudnative.lv backend resources were set up. Everything runs on the
Cloudflare account that owns the **cloudnative.lv** zone (account id
`2206fc831247e31fb22b657089145789`) and deploys from this repo.

## Cloudflare

### R2 (storage)
- Enabled R2 on the account (Dashboard → R2 → enable; required once).
- Created the bucket: `npx wrangler r2 bucket create cloudnative-lv`.
- Objects (the source of truth):
  - `subscribers.csv` — newsletter subscribers (subscribe worker).
  - `feedback/<event-slug>.csv` — per-event feedback (feedback worker).
  - `attendees/<event-slug>.csv` — per-event attendees, imported locally with
    `node scripts/import-attendees.mjs` (see **Attendees** below).

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
- the subscribe worker sends a notification via the `send_email` binding to `NOTIFY_TO`.
  `send_email` can only deliver to a **verified Email Routing _destination_ address**, so
  `NOTIFY_TO = andrey@extremeautomation.io` (already verified as the catch-all / andrey@
  target). `hello@cloudnative.lv` is a Worker *route*, not a destination, so it can't
  receive worker-sent mail. R2 logging records every subscriber regardless of email.

### Worker secrets (`wrangler secret put <NAME>` from the worker's folder)
- **forward** (CF `cloudnative-lv-info`) → `FORWARD_TO` = comma-separated forward addresses (keeps
  personal addresses out of git).

## Attendees (local import)
Eventbrite / OCG / LinkedIn export attendee lists as CSV. Consolidate them into the
R2 source of truth with the local tool (no worker — run it when a new list lands):

```
node scripts/import-attendees.mjs --event <slug> --source eventbrite list.csv
```

It maps the export's columns (email + name, however they're labelled), dedups on
email, merges with the existing `attendees/<slug>.csv` in R2 and writes it back via
`wrangler`. `--dry-run` previews without writing; `--out <file>` also saves a local
copy. LinkedIn data (kept off-CI for TOS) is merged the same way with
`--source linkedin`. Needs `wrangler login` (see **Local wrangler**).

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
