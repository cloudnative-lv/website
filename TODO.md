# Data

All contact imports are now local npm ops that build the common CRM (`subscribers.csv`)
plus per-event rosters (`attendees/<slug>.csv`). See README.md → Local operations.

[x] Run `crm:cleanup` — now cache-free via the R2 S3 API; review `data/reports/crm/crm-cleanup.md` before `--write` (149 email backfills, 70 dup clusters, 3071 NetHunt-only)
[ ] Verify forms round-trip: feedback submit → R2 row (subscribe verified ✓; feedback audit-write + `feedback:restore` verified — real end-to-end form submission still TBD)

# Design

[ ] MANUAL: Review all kit artifact correctness
[x] Make sure HTML presentation is accessible from site, not a downloadable file like it is now
[ ] Review and finalize design assets
[ ] Update kit with design updates and guidelines
[ ] Update publishing flow/details in kit + diagram + instructions (incl. invite cadence: T-7 days and T-3 days email invite)

# Comms

[ ] Fine-tune attendee report
[ ] Fine-tune feedback report
[ ] Fine-tune generated event presentation

[ ] Write future doc for Linda
[ ] Write speakers about website
[ ] Update budget/invoices/spendings
