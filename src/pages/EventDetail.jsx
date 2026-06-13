import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import EventQRCode from '../components/EventQRCode';
import EventPhotoGallery from '../components/EventPhotoGallery';
import SpeakerAvatar from '../components/SpeakerAvatar';
import SpeakerSocials from '../components/SpeakerSocials';
import { getSpeakerInfo } from '../data/speakers';
import SEO from '../components/SEO';
import { EventJsonLd } from '../components/JsonLd';
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

  // Date-only strings parse as UTC midnight; format in UTC so every visitor
  // sees the event's actual calendar date.
  const formattedDate = new Date(event.date).toLocaleDateString(
    language === 'lv' ? 'lv-LV' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );

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
      <div className={`${isUpcoming ? 'bg-linear-to-r from-rose-400 to-rose-700' : 'bg-gray-600'} text-white py-16`}>
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/events" className="flex w-fit items-center text-white/80 hover:text-white mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('eventDetail.backToEvents')}
          </Link>
          <span className={`block w-fit px-4 py-1 rounded-full text-sm font-semibold mb-4 ${isUpcoming ? 'bg-white/20' : 'bg-white/10'}`}>
            {isUpcoming ? t('eventDetail.upcoming') : t('eventDetail.past')}
          </span>
          <h1 className="text-4xl font-black mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.time} - {event.endTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share banner — generated at build time into /artifacts/<id>/; hidden
          gracefully when absent (e.g. local dev before generation runs). */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <img
          src={`/artifacts/${event.id}/linkedin-event-speakers.png`}
          alt={`${event.title} banner`}
          className="w-full rounded-2xl shadow-lg ring-1 ring-rose-200"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
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
                  {event.talks.map((talk, idx) => {
                    const speakers = talk.speakers && Array.isArray(talk.speakers)
                      ? talk.speakers
                      : (talk.speaker ? [talk.speaker] : []);
                    return (
                      <div key={idx} className="border-l-4 border-pink pl-4">
                        <h3 className="text-lg font-bold text-burgundy">{talk.title}</h3>
                        <p className="text-gray-600 mt-2">{talk.description}</p>
                        {talk.slidesUrl && (
                          <a
                            href={talk.slidesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-pink hover:text-burgundy font-semibold mt-2 transition-colors"
                          >
                            <span aria-hidden="true">📄</span>
                            {t('eventDetail.slides')}
                          </a>
                        )}
                        {speakers.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {speakers.map(name => {
                              const info = getSpeakerInfo(name);
                              return (
                                <div key={name} className="flex items-start gap-3">
                                  <SpeakerAvatar name={name} photo={info.photo} className="w-10 h-10 text-sm shrink-0" />
                                  <div>
                                    <p className="font-semibold text-burgundy leading-tight">
                                      {name}
                                      <SpeakerSocials info={info} iconClass="text-pink hover:text-burgundy" />
                                    </p>
                                    {(info.title || info.company) && (
                                      <p className="text-pink text-sm">{[info.title, info.company].filter(Boolean).join(' · ')}</p>
                                    )}
                                    {info.bio && <p className="text-gray-500 text-sm mt-1">{info.bio}</p>}
                                  </div>
                                </div>
                              );
                            })}
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
                  <a
                    href={event.eventbriteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-pink text-white text-center py-3 px-4 rounded-full font-semibold hover:bg-rose-500 transition-all shadow-md hover:shadow-lg mt-6"
                  >
                    {t('eventDetail.registerEventbrite')}
                  </a>
                )}

                {!isUpcoming && event.eventbriteUrl && (
                  <a
                    href={event.eventbriteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-full font-semibold hover:bg-gray-300 transition-colors mt-6"
                  >
                    {t('eventDetail.viewEventbrite')}
                  </a>
                )}

                {event.cncfUrl && (
                  <a
                    href={event.cncfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-burgundy text-white text-center py-3 px-4 rounded-full font-semibold hover:bg-rose-800 transition-all shadow-md hover:shadow-lg mt-3"
                  >
                    {t('eventDetail.viewCNCF')}
                  </a>
                )}

                {event.photosUrl && (
                  <a
                    href={event.photosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full border-2 border-burgundy text-burgundy text-center py-3 px-4 rounded-full font-semibold hover:bg-rose-50 transition-colors mt-3"
                  >
                    <span className="mr-2" aria-hidden="true">📷</span>
                    {t('eventDetail.viewPhotos')}
                  </a>
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
