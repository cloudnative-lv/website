import yaml from 'yaml';

const eventFiles = import.meta.glob('./events/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const events = Object.values(eventFiles)
  .map(raw => yaml.parse(raw))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const getEventBySlug = (slug) => events.find(e => e.slug === slug);

export const upcomingEvents = events.filter(e => e.status === 'upcoming');
export const pastEvents = events.filter(e => e.status === 'past');
