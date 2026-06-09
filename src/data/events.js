import yaml from 'yaml';

const eventFiles = import.meta.glob('./events/*.yaml', { eager: true, query: '?raw', import: 'default' });

// Status is derived in the browser from the event's date/time rather than trusted
// from the YAML. An event is "past" by default and only "upcoming" while its end is
// still in the future, so events transition automatically without editing the data.
const deriveStatus = (event) => {
  const endTime = event.endTime || event.time || '23:59';
  const eventEnd = new Date(`${event.date}T${endTime}:00`);
  if (Number.isNaN(eventEnd.getTime())) return 'past';
  return eventEnd.getTime() > Date.now() ? 'upcoming' : 'past';
};

export const events = Object.values(eventFiles)
  .map(raw => yaml.parse(raw))
  .map(event => ({ ...event, status: deriveStatus(event) }))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const getEventBySlug = (slug) => events.find(e => e.slug === slug);

export const upcomingEvents = events.filter(e => e.status === 'upcoming');
export const pastEvents = events.filter(e => e.status === 'past');
