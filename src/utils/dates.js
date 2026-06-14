// UTC-safe display formatting for event dates. Date-only strings parse as UTC
// midnight, so we format in UTC — every visitor sees the event's calendar date.
// Defaults to a long date; pass options to override (e.g. { weekday: 'short' }).
export function formatEventDate(date, language, options) {
  return new Date(date).toLocaleDateString(language === 'lv' ? 'lv-LV' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    ...options,
  });
}
