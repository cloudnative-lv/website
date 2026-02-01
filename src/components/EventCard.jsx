import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const isUpcoming = event.status === 'upcoming';

  return (
    <Link
      to={`/events/${event.slug}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-100 hover:-translate-y-1"
    >
      <div className={`px-6 py-3 ${isUpcoming ? 'bg-pink' : 'bg-gray-600'}`}>
        <span className="text-white text-sm font-semibold uppercase tracking-wider">
          {isUpcoming ? 'Upcoming' : 'Past Event'}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-burgundy mb-3 line-clamp-2">
          {event.title}
        </h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue.name}</span>
          </div>
        </div>
        {event.tags && event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-rose-50 text-burgundy text-xs font-semibold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
