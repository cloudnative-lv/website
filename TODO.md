# Data

All contact imports are now local npm ops that build the common CRM (`subscribers.csv`)
plus per-event rosters (`attendees/<slug>.csv`). See README.md → Local operations.

[ ] Verify the feedback form round-trips end to end (real submission → `feedback/<slug>.csv` row). Subscribe is verified ✓; the feedback audit-write + `feedback:restore` path is verified, but a real form submission hasn't been confirmed yet.
[ ] Review `reports/crm/crm-cleanup.md` and decide whether to apply `crm:cleanup --write` (149 email backfills, 70 dup clusters).

# Design

[ ] MANUAL: Review all kit artifact correctness
[ ] Review and finalize design assets
[ ] Update kit with design updates and guidelines
[ ] Update publishing flow/details in kit + diagram + instructions (incl. invite cadence: T-7 days and T-3 days email invite)

# Comms

[ ] Fine-tune generated event presentation

[ ] Write future doc for Linda
[ ] Write speakers about website
[ ] Update budget/invoices/spendings
