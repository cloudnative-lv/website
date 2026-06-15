# Tech

[x] Analyze Cloudflare permissions/add token to Bitwarden/update in Github
[x] Update instructions about local wrangler — BOOTSTRAP.md + README.md
[x] Document local operations/docs — README.md "Local operations", BOOTSTRAP.md, ARCH.md
[x] Per-page SEO review + microformats — Organization/Event/Talk/Person/BreadcrumbList JSON-LD (JsonLd.jsx); prerender bakes JSON-LD into the static HTML
[x] Write sponsor menu one-pager — PDF (`npm run generate:sponsor-pdf` → dist/sponsor-onepager.pdf, built in CI from the /sponsors page)

# Data

All contact imports are now local npm ops that build the common CRM (`subscribers.csv`)
plus per-event rosters (`attendees/<slug>.csv`). See README.md → Local operations.

[x] Import attendees into R2 — `import:eventbrite` (API) + `import:attendees` (OCG/Bevy event CSVs)
[x] Extract LinkedIn followers — `import:linkedin` (data/linkedin-followers.html)
[x] Extract LinkedIn event attendees — `import:linkedin-events` (data/linkedin-<N>.html)
[x] Extract Zoho Campaigns emails — `import:subscribers --source zoho` (data/zoho_campaigns.csv)
[x] Extract OCG/Bevy attendees + members — `import:attendees` (event CSVs) + `import:ocg` (members)
[x] Unified list + check vs CRM — everyone merged into subscribers.csv; `crm:cleanup` reconciles vs NetHunt
[x] Community & registrations report — `report:subscribers` (size, registrations/event, repeat/dup, fans)
[x] Count people on events from photos — `attendance` in each event YAML (#1 35, #2 28, #3 30, #4 33, #5 21, #6 27)

[ ] Verify forms round-trip: feedback submit → R2 row (subscribe done ✓); decide if "contact" needs a real form or stays mailto


[x] Map links do not work — now generated from the venue address (search pin) in EventDetail + TalkDetail

# Talk page

[x] Add talk card — TalkDetail (about + presented-by + details sidebar)
[x] Add slide deck link — SlidesLink on the talk page
[x] Add SEO metadata + social preview — SEO meta + Talk/Person/BreadcrumbList JSON-LD
[x] Add talk info like time, place, etc. similar to event page — Event Details sidebar (date/time/venue/map)

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
