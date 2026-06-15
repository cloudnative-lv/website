// Eventbrite API helper. Fetch a single event's live attendees (paginated, skipping
// cancelled/refunded). Returns [{ email, name, added }]. Token is the Private token.
export async function ebFetchAttendees(token, ebId) {
  const out = [];
  const base = `https://www.eventbriteapi.com/v3/events/${ebId}/attendees/`;
  let url = base;
  for (;;) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Eventbrite ${res.status}: ${await res.text()}`);
    const d = await res.json();
    for (const a of d.attendees || []) {
      if (a.cancelled || a.refunded) continue;
      const email = String(a.profile?.email || '').trim().toLowerCase();
      if (!email) continue;
      out.push({ email, name: String(a.profile?.name || '').trim(), added: String(a.created || '').slice(0, 10) });
    }
    if (d.pagination?.has_more_items && d.pagination?.continuation) url = `${base}?continuation=${encodeURIComponent(d.pagination.continuation)}`;
    else break;
  }
  return out;
}
