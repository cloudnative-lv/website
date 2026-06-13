import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug, getTalk } from '../data/events';
import SpeakerAvatar from '../components/SpeakerAvatar';
import SpeakerSocials from '../components/SpeakerSocials';
import { getSpeakerInfo } from '../data/speakers';
import SEO from '../components/SEO';
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
  const formattedDate = new Date(event.date).toLocaleDateString(
    language === 'lv' ? 'lv-LV' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }
  );

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title={`${talk.title} - ${event.title}`}
        description={talk.description ? talk.description.split('\n')[0] : event.title}
        keywords={event.tags || []}
        path={`/events/${event.slug}/talks/${talk.talkSlug}`}
        image={`/artifacts/${event.id}/og.png`}
      />
      <div className="bg-linear-to-r from-rose-400 to-rose-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={`/events/${event.slug}`} className="flex w-fit items-center text-white/80 hover:text-white mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('talkDetail.backToEvent')}
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-2">
            {t('talkDetail.partOf')} {event.title} · {formattedDate}
          </p>
          <h1 className="text-4xl font-black">{talk.title}</h1>
        </div>
      </div>

      {/* Speaker banner — generated at build time into /artifacts/<id>/; hidden
          gracefully when absent (e.g. local dev before generation runs). */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <img
          src={`/artifacts/${event.id}/speaker-${talk.index + 1}.png`}
          alt={`${talk.title} banner`}
          className="w-full rounded-2xl shadow-lg ring-1 ring-rose-200"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {talk.description && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-black text-burgundy mb-4">{t('talkDetail.about')}</h2>
            <div className="prose prose-gray max-w-none">
              {talk.description.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
              ))}
            </div>
            {talk.slidesUrl && (
              <a
                href={talk.slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('talkDetail.slides')}
              </a>
            )}
          </section>
        )}

        {speakers.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-black text-burgundy mb-6">{t('talkDetail.presentedBy')}</h2>
            <div className="space-y-4">
              {speakers.map(name => {
                const info = getSpeakerInfo(name);
                return (
                  <div key={name} className="flex items-start gap-4">
                    <SpeakerAvatar name={name} photo={info.photo} className="w-14 h-14 text-lg shrink-0" />
                    <div>
                      <p className="font-bold text-burgundy leading-tight">
                        {name}
                        <SpeakerSocials info={info} iconClass="text-pink hover:text-burgundy" />
                      </p>
                      {info.title && <p className="text-pink text-sm font-bold leading-tight">{info.title}</p>}
                      {info.company && <p className="text-pink/80 text-sm italic leading-tight">{info.company}</p>}
                      {info.bio && <p className="text-gray-500 text-sm mt-1">{info.bio}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
