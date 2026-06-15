import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug, getTalk } from '../data/events';
import SpeakerBio from '../components/SpeakerBio';
import SlidesLink from '../components/SlidesLink';
import ArtifactImage from '../components/ArtifactImage';
import { CalendarIcon, ClockIcon, MapPinIcon, ChevronLeftIcon } from '../components/Icons';
import { formatEventDate } from '../utils/dates';
import SEO from '../components/SEO';
import { TalkJsonLd, BreadcrumbJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/useLanguage';

export default function TalkDetail() {
  const { t, language } = useLanguage();
  const { slug, talkSlug } = useParams();
  const event = getEventBySlug(slug);

  // Reached via a former event slug (previousSlugs) — send to the canonical URL.
  if (event && event.slug !== slug) {
    return <Navigate to={`/events/${event.slug}/talks/${talkSlug}`} replace />;
  }

  const resolved = getTalk(slug, talkSlug);
  if (!resolved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('talkDetail.notFound')}</h1>
          <Link to="/events" className="text-rose-600 hover:text-rose-700">
            ← {t('eventDetail.backToEvents')}
          </Link>
        </div>
      </div>
    );
  }

  const { talk } = resolved;
  const speakers = talk.speakers && Array.isArray(talk.speakers)
    ? talk.speakers
    : (talk.speaker ? [talk.speaker] : []);
  const formattedDate = formatEventDate(event.date, language);
  const mapHref = event.venue?.mapUrl
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue?.name}, ${event.venue?.address}`)}`;

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title={`${talk.title} - ${event.title}`}
        description={talk.description ? talk.description.split('\n')[0] : event.title}
        keywords={event.tags || []}
        path={`/events/${event.slug}/talks/${talk.talkSlug}`}
        image={`/artifacts/${event.id}/speaker-${talk.index + 1}.png`}
      />
      <TalkJsonLd event={event} talk={talk} />
      <BreadcrumbJsonLd
        items={[
          { name: t('nav.home'), path: '/' },
          { name: t('nav.events'), path: '/events' },
          { name: event.title, path: `/events/${event.slug}` },
          { name: talk.title, path: `/events/${event.slug}/talks/${talk.talkSlug}` },
        ]}
      />
      <div className="bg-linear-to-r from-rose-400 to-rose-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={`/events/${event.slug}`} className="flex w-fit items-center text-white/80 hover:text-white mb-6">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            {t('talkDetail.backToEvent')}
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-2">
            {t('talkDetail.partOf')} {event.title} · {formattedDate}
          </p>
          <h1 className="text-4xl font-black">{talk.title}</h1>
        </div>
      </div>

      {/* Speaker banner — generated at build time into /artifacts/<id>/. */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <ArtifactImage src={`/artifacts/${event.id}/speaker-${talk.index + 1}.png`} alt={`${talk.title} banner`} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {talk.description && (
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-black text-burgundy mb-4">{t('talkDetail.about')}</h2>
              <div className="prose prose-gray max-w-none">
                {talk.description.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>
              {talk.slidesUrl && <SlidesLink href={talk.slidesUrl} label={t('talkDetail.slides')} className="mt-2" />}
            </section>
          )}

          {speakers.length > 0 && (
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-black text-burgundy mb-6">{t('talkDetail.presentedBy')}</h2>
              <div className="space-y-4">
                {speakers.map(name => <SpeakerBio key={name} name={name} size="md" />)}
              </div>
            </section>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20 space-y-4">
            <h3 className="text-lg font-bold text-burgundy">{t('eventDetail.details')}</h3>
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-pink shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">{formattedDate}</p>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-pink shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">{event.time} - {event.endTime}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-pink shrink-0 mt-0.5" />
              <div>
                <p className="text-burgundy font-medium text-sm">{event.venue.name}</p>
                <p className="text-gray-600 text-sm">{event.venue.address}</p>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-pink hover:text-burgundy transition-colors"
                >
                  {t('eventDetail.viewMap')}
                </a>
              </div>
            </div>
            <Link to={`/events/${event.slug}`} className="block border-t border-rose-100 pt-3 text-sm font-semibold text-pink hover:text-burgundy transition-colors">
              ← {event.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
