import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { formatEventDate } from '../utils/dates';
import { CalendarIcon, ClockIcon, MapPinIcon, SlidesIcon } from './Icons';

export default function EventCard({ event }) {
  const { t, language } = useLanguage();
  const formattedDate = formatEventDate(event.date, language, { weekday: 'short', month: 'short' });

  const isUpcoming = event.status === 'upcoming';
  const hasSlides = (event.talks || []).some((talk) => talk.slidesUrl);

  return (
    <Link
      to={`/events/${event.slug}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-100 hover:-translate-y-1"
    >
      <div className={`px-6 py-3 ${isUpcoming ? 'bg-pink' : 'bg-gray-600'}`}>
        <span className="text-white text-sm font-semibold uppercase tracking-wider">
          {isUpcoming ? t('eventCard.upcoming') : t('eventCard.pastEvent')}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-burgundy mb-3 line-clamp-2">
          {event.title}
        </h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-pink" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-pink" />
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
        {hasSlides && (
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pink">
            <SlidesIcon className="w-4 h-4" />
            {t('eventCard.slides')}
          </div>
        )}
      </div>
    </Link>
  );
}
