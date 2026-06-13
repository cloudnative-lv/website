# Photo intake

Drop hand-picked event photos here to add them to the site.

1. Create a folder named **exactly** like the event id (see `src/data/events/`),
   e.g. `photos-inbox/2025-10-15-meetup-002/`.
2. Copy your chosen full-res photos into it. **Order is by filename**, so prefix
   them `01-`, `02-`, … if you want a specific gallery order.
3. Run `npm run process:photos`.

The script resizes each to 800px wide and writes `photo-01.jpg`, `photo-02.jpg`, …
into `src/assets/events/<event-id>/`, where the gallery auto-discovers them.
Then review and commit `src/assets/events/`. Everything else in this folder is
gitignored (originals stay local).

HEIC files may need converting to JPG first if `sharp` can't read them.
