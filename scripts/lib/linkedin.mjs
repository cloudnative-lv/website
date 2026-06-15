// Parse a saved LinkedIn HTML export (followers modal OR an event's attendee list) into
// [{ name, headline, handle, profile_url }]. Both views use the same entity lockup: an
// <a href="/in/HANDLE"> wrapping a __title (name) and either the follower headline span
// or the generic __subtitle div (event attendees).

const clean = (s) => s
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/&#x?[0-9a-f]+;/gi, ' ')
  .replace(/\s+/g, ' ').trim();

const ITEM = /<a\b[^>]*?\shref="\/in\/([^/"?#]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
const TITLE = /artdeco-entity-lockup__title[^>]*>([\s\S]*?)<\/div>/;
const HEADLINE_FOLLOWER = /org-page-follower-entity-lockup__headline[^>]*>([\s\S]*?)<\/span>/;
const HEADLINE_SUBTITLE = /artdeco-entity-lockup__subtitle[^>]*>([\s\S]*?)<\/div>/;

export function parseLinkedinHtml(html) {
  const seen = new Set();
  const people = [];
  for (const m of html.matchAll(ITEM)) {
    const handle = m[1];
    const tm = m[2].match(TITLE);
    if (!tm) continue;                      // an /in/ link that isn't an entity lockup
    const name = clean(tm[1]);
    if (!name || seen.has(handle)) continue;
    seen.add(handle);
    const hm = m[2].match(HEADLINE_FOLLOWER) || m[2].match(HEADLINE_SUBTITLE);
    people.push({ name, headline: hm ? clean(hm[1]) : '', handle, profile_url: `https://www.linkedin.com/in/${handle}` });
  }
  return people;
}
