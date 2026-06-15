import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug, getEventTalks } from '../data/events';
import EventQRCode from '../components/EventQRCode';
import EventPhotoGallery from '../components/EventPhotoGallery';
import SpeakerBio from '../components/SpeakerBio';
import SlidesLink from '../components/SlidesLink';
import TalkTitleLink from '../components/TalkTitleLink';
import ArtifactImage from '../components/ArtifactImage';
import Button from '../components/Button';
import { CalendarIcon, ClockIcon, MapPinIcon, ChevronLeftIcon } from '../components/Icons';
import { formatEventDate } from '../utils/dates';
import SEO from '../components/SEO';
import { EventJsonLd, BreadcrumbJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/useLanguage';

export default function EventDetail() {
  const { t, language } = useLanguage();
  const { slug } = useParams();
  const event = getEventBySlug(slug);

  // Reached via a former slug (previousSlugs) — send to the canonical URL.
  if (event && event.slug !== slug) {
    return <Navigate to={`/events/${event.slug}`} replace />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('eventDetail.notFound')}</h1>
          <Link to="/events" className="text-rose-600 hover:text-rose-700">
            ← {t('eventDetail.backToEvents')}
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = formatEventDate(event.date, language, { weekday: 'long' });
  const isUpcoming = event.status === 'upcoming';

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title={event.title}
        description={event.description.split('\n')[0]}
        keywords={event.tags || []}
        path={`/events/${event.slug}`}
        image={`/artifacts/${event.id}/og.png`}
      />
      <EventJsonLd event={event} />
      <BreadcrumbJsonLd items={[{ name: t('nav.home'), path: '/' }, { name: t('nav.events'), path: '/events' }, { name: event.title, path: `/events/${event.slug}` }]} />
      <div className={`${isUpcoming ? 'bg-linear-to-r from-rose-400 to-rose-700' : 'bg-gray-600'} text-white py-16`}>
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/events" className="flex w-fit items-center text-white/80 hover:text-white mb-6">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            {t('eventDetail.backToEvents')}
          </Link>
          <span className={`block w-fit px-4 py-1 rounded-full text-sm font-semibold mb-4 ${isUpcoming ? 'bg-white/20' : 'bg-white/10'}`}>
            {isUpcoming ? t('eventDetail.upcoming') : t('eventDetail.past')}
          </span>
          <h1 className="text-4xl font-black mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>{event.time} - {event.endTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share banner — generated at build time into /artifacts/<id>/. */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <ArtifactImage src={`/artifacts/${event.id}/linkedin-event-speakers.png`} alt={`${event.title} banner`} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-black text-burgundy mb-4">{t('eventDetail.about')}</h2>
              <div className="prose prose-gray max-w-none">
                {event.description.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            {event.talks && event.talks.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-black text-burgundy mb-6">{t('eventDetail.talks')}</h2>
                <div className="space-y-6">
                  {getEventTalks(event).map((talk) => {
                    const speakers = talk.speakers && Array.isArray(talk.speakers)
                      ? talk.speakers
                      : (talk.speaker ? [talk.speaker] : []);
                    return (
                      <div key={talk.talkSlug} className="border-l-4 border-pink pl-4">
                        <h3 className="text-lg font-bold">
                          <TalkTitleLink to={`/events/${event.slug}/talks/${talk.talkSlug}`} title={talk.title} />
                        </h3>
                        <p className="text-gray-600 mt-2">{talk.description}</p>
                        {talk.slidesUrl && <SlidesLink href={talk.slidesUrl} label={t('eventDetail.slides')} className="mt-3" />}
                        {speakers.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {speakers.map(name => <SpeakerBio key={name} name={name} size="sm" />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <EventPhotoGallery event={event} />
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h3 className="text-lg font-bold text-burgundy mb-4">{t('eventDetail.details')}</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{t('eventDetail.venue')}</p>
                  <p className="text-burgundy font-medium">{event.venue.name}</p>
                  <p className="text-gray-600 text-sm">{event.venue.address}</p>
                  <a
                    href={event.venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue.name}, ${event.venue.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-pink hover:text-burgundy transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4" />
                    {t('eventDetail.viewMap')}
                  </a>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{t('eventDetail.topics')}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-rose-50 text-burgundy text-xs font-semibold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isUpcoming && event.eventbriteUrl && (
                  <Button href={event.eventbriteUrl} variant="primary" size="md" fullWidth className="mt-6">
                    {t('eventDetail.registerEventbrite')}
                  </Button>
                )}

                {!isUpcoming && event.eventbriteUrl && (
                  <Button href={event.eventbriteUrl} variant="muted" size="md" fullWidth className="mt-6">
                    {t('eventDetail.viewEventbrite')}
                  </Button>
                )}

                {event.cncfUrl && (
                  <Button href={event.cncfUrl} variant="secondary" size="md" fullWidth className="mt-3">
                    {t('eventDetail.viewCNCF')}
                  </Button>
                )}

                {event.linkedinUrl && (
                  <Button href={event.linkedinUrl} variant="outline" size="md" fullWidth className="mt-3">
                    {t('eventDetail.viewLinkedIn')}
                  </Button>
                )}

                {event.photosUrl && (
                  <Button href={event.photosUrl} variant="outline" size="md" fullWidth className="mt-3">
                    {t('eventDetail.viewPhotos')}
                  </Button>
                )}

                {/* QR Code */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-3 text-center">{t('eventDetail.shareEvent')}</p>
                  <EventQRCode
                    url={`https://cloudnative.lv/events/${event.slug}`}
                    title={event.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
