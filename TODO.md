# Tech

[ ] Analyze Cloudflare permissions/add token to Bitwarden/update in Github
[x] Update instructions about local wrangler — BOOTSTRAP.md + README.md
[x] Document local operations/docs — README.md "Local operations", BOOTSTRAP.md, ARCH.md
[ ] Write sponsor menu one-pager — PDF

# Data

All contact imports are now local npm ops that build the common CRM (`subscribers.csv`)
plus per-event rosters (`attendees/<slug>.csv`). See README.md → Local operations.

[x] Import attendees into R2 — `import:eventbrite` (API) + `import:attendees` (OCG/Bevy event CSVs)
[x] Extract LinkedIn followers — `import:linkedin` (data/linkined-last.html)
[x] Extract LinkedIn event attendees — `import:linkedin-events` (data/linkedin-<N>.html)
[x] Extract Zoho Campaigns emails — `import:subscribers --source zoho` (data/zoho_campaigns.csv)
[x] Extract OCG/Bevy attendees + members — `import:attendees` (event CSVs) + `import:ocg` (members)
[x] Unified list + check vs CRM — everyone merged into subscribers.csv; `crm:cleanup` reconciles vs NetHunt
[x] Community & registrations report — `report:subscribers` (size, registrations/event, repeat/dup, fans)
[ ] MANUAL: Count people on events from photos (no automation)

[ ] Verify forms round-trip: feedback submit → R2 row (subscribe done ✓); decide if "contact" needs a real form or stays mailto

[ ] Unite speaker data and event data yml?
[ ] Map links do not work

# Talk page

[ ] Add talk card
[ ] Add slide deck link
[ ] Add SEO metadata + social preview
[ ] Add talk info like time, place, etc. similar to event page

# Design

[ ] MANUAL: Review all kit artifact correctness
[ ] Make sure HTML presentation is accessible from site, not a downloadable file like it is now
[ ] Review and finalize design assets
[ ] Update kit with design updates and guidelines
[ ] Update publishing flow/details in kit + diagram + instructions (incl. invite cadence: T-7 days and T-3 days email invite)

# Comms 

[ ] Write future doc for Linda
[ ] Write speakers about website
[ ] Update budget/invoices/spendings
