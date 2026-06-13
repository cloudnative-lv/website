// Event YAML is converted to JS objects at build time by @rollup/plugin-yaml,
// so no YAML parser ships to the browser.
const eventFiles = import.meta.glob('./events/*.yaml', { eager: true, import: 'default' });

// Events happen in Riga; status and schedule math must not depend on the
// visitor's timezone.
const EVENT_TZ = 'Europe/Riga';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Offset (ms) of EVENT_TZ from UTC at the given instant, DST-aware.
const tzOffsetMs = (utcMs) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EVENT_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(utcMs);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'));
  return asUtc - utcMs;
};

// Epoch ms of a Riga wall-clock moment ("YYYY-MM-DD", "HH:MM").
const rigaTimeToMs = (date, time) => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  // Second pass pins the offset correctly around DST transitions.
  return guess - tzOffsetMs(guess - tzOffsetMs(guess));
};

// ISO 8601 string with the correct Riga offset for that date, e.g.
// "2026-06-10T18:15:00+03:00". Used for structured data.
export const rigaIsoString = (date, time) => {
  const offsetMin = tzOffsetMs(rigaTimeToMs(date, time)) / 60000;
  const pad = (n) => String(n).padStart(2, '0');
  const sign = offsetMin < 0 ? '-' : '+';
  const abs = Math.abs(offsetMin);
  return `${date}T${time}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

const deriveStatus = (event) => {
  const date = String(event.date);
  const endTime = String(event.endTime || '23:59');
  if (!DATE_RE.test(date) || !TIME_RE.test(endTime)) {
    const problem = `Event "${event.id}" has invalid date "${date}" or endTime "${endTime}" (expected quoted "YYYY-MM-DD" / "HH:MM")`;
    if (import.meta.env.DEV) throw new Error(problem);
    console.warn(problem);
    return 'past';
  }
  return rigaTimeToMs(date, endTime) > Date.now() ? 'upcoming' : 'past';
};

// ISO date strings sort lexicographically; newest first.
const rawEvents = Object.values(eventFiles).sort((a, b) => (a.date < b.date ? 1 : -1));

// Status is derived per call (not frozen at module load) so it stays correct
// in long-lived tabs and transitions without editing the data.
export const getEvents = () => rawEvents.map((event) => ({ ...event, status: deriveStatus(event) }));

export const getUpcomingEvents = () => getEvents().filter((e) => e.status === 'upcoming');
export const getPastEvents = () => getEvents().filter((e) => e.status === 'past');

// Matches current and former slugs (see `previousSlugs` in the YAML) so that
// already-shared URLs survive a rename; EventDetail redirects to the canonical slug.
export const getEventBySlug = (slug) =>
  getEvents().find((e) => e.slug === slug || (e.previousSlugs || []).includes(slug));

// URL-safe segment from a talk title (diacritics stripped, lowercased).
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'talk';

// An event's talks, each given a stable `talkSlug` (deduped within the event)
// and its 0-based `index`. Single source of truth for talk URLs (pages + prerender).
export const getEventTalks = (event) => {
  const seen = {};
  return (event.talks || []).map((talk, index) => {
    let talkSlug = slugify(talk.title);
    if (seen[talkSlug]) talkSlug = `${talkSlug}-${(seen[talkSlug] += 1)}`;
    else seen[talkSlug] = 1;
    return { ...talk, index, talkSlug };
  });
};

// Resolve one talk by event slug + talk slug. Former event slugs resolve via
// getEventBySlug; TalkDetail redirects to the canonical event slug.
export const getTalk = (eventSlug, talkSlug) => {
  const event = getEventBySlug(eventSlug);
  if (!event) return null;
  const talk = getEventTalks(event).find((tk) => tk.talkSlug === talkSlug);
  return talk ? { event, talk } : null;
};
