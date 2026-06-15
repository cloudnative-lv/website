import { Link } from 'react-router-dom';
import { getEvents, getEventTalks } from '../data/events';
import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import SEO from '../components/SEO';
import SpeakerAvatar from '../components/SpeakerAvatar';
import SpeakerSocials from '../components/SpeakerSocials';
import TalkTitleLink from '../components/TalkTitleLink';
import { CalendarIcon } from '../components/Icons';
import { SpeakersPageJsonLd } from '../components/JsonLd';
import { getSpeakerInfo } from '../data/speakers';
import { useLanguage } from '../i18n/useLanguage';

function getSpeakersFromTalk(talk) {
  if (talk.speakers && Array.isArray(talk.speakers)) {
    return talk.speakers;
  }
  if (talk.speaker) {
    return [talk.speaker];
  }
  return [];
}

function getTalksWithSpeakers() {
  const talks = [];

  getEvents().forEach(event => {
    if (event.talks) {
      getEventTalks(event).forEach(talk => {
        const speakers = getSpeakersFromTalk(talk);
        speakers.forEach(speaker => {
          talks.push({
            speaker: speaker,
            title: talk.title,
            description: talk.description,
            slidesUrl: talk.slidesUrl,
            eventSlug: event.slug,
            talkSlug: talk.talkSlug,
            eventTitle: event.title,
            eventDate: event.date,
            coSpeakers: speakers.length > 1 ? speakers.filter(s => s !== speaker) : []
          });
        });
      });
    }
  });
  
  // Sort by date (newest first), then by speaker name
  return talks.sort((a, b) => {
    const dateCompare = new Date(b.eventDate) - new Date(a.eventDate);
    if (dateCompare !== 0) return dateCompare;
    return a.speaker.localeCompare(b.speaker);
  });
}

function getUniqueSpeakers(talks) {
  const speakers = [...new Set(talks.map(t => t.speaker))];
  return speakers.map(name => ({
    name,
    talks: talks.filter(t => t.speaker === name)
  }));
}

const allTalks = getTalksWithSpeakers();
const speakers = getUniqueSpeakers(allTalks);

export default function Speakers() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-pink-light">
      <SEO 
        title="Cloud Native Speakers - Tech Talks in Latvia"
        description="Meet the speakers who share their expertise at Cloud Native Latvia meetups. Kubernetes, DevOps, and platform engineering experts from Latvia and beyond."
        keywords={['tech speakers Latvia', 'Kubernetes expert', 'DevOps speaker Riga', 'cloud native talks']}
        path="/speakers"
        image="/images/og/speakers.png"
      />
      <SpeakersPageJsonLd speakers={speakers} />
      <PageHeader 
        title={t('speakers.title')} 
        subtitle={t('speakers.subtitle')}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {speakers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t('speakers.noSpeakers')}</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {allTalks.map((talk, idx) => {
                const info = getSpeakerInfo(talk.speaker);
                const hasMeta = info.title || info.company || info.linkedin || info.github || info.cncf;
                return (
                <div key={idx} className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Identity band: avatar + name only, fixed height so every card lines up
                      regardless of title/company/social-link combinations. */}
                  <div className="flex h-24 items-center gap-4 bg-linear-to-r from-rose-400 to-rose-600 px-6">
                    <SpeakerAvatar
                      name={talk.speaker}
                      photo={info.photo}
                      className="w-14 h-14 text-lg shrink-0 ring-2 ring-white/40"
                    />
                    <h3 className="font-bold text-lg leading-tight text-white line-clamp-2">{talk.speaker}</h3>
                  </div>
                  <div className="flex grow flex-col p-6">
                    {hasMeta && (
                      <div className="mb-4 border-b border-rose-100 pb-4">
                        {info.title && (
                          <p className="text-sm font-bold text-burgundy leading-tight">{info.title}</p>
                        )}
                        {info.company && (
                          <p className="text-sm italic text-gray-500 leading-tight">{info.company}</p>
                        )}
                        <SpeakerSocials info={info} className="mt-2" />
                      </div>
                    )}
                    <h4 className="text-lg font-bold mb-3">
                      <TalkTitleLink to={`/events/${talk.eventSlug}/talks/${talk.talkSlug}`} title={talk.title} clamp />
                    </h4>
                    {talk.coSpeakers.length > 0 && (
                      <p className="text-pink text-sm mb-2">{t('speakers.with')} {talk.coSpeakers.join(', ')}</p>
                    )}
                    {talk.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{talk.description}</p>
                    )}
                  </div>
                  {/* Event link: same grey as the "past event" badges used elsewhere. */}
                  <Link
                    to={`/events/${talk.eventSlug}`}
                    className="mt-auto flex items-center gap-3 bg-gray-600 px-6 py-4 text-white transition-colors hover:bg-gray-700"
                  >
                    <CalendarIcon className="w-7 h-7 shrink-0 text-white/80" />
                    <span className="flex min-h-[2.2rem] items-center">
                      <span className="line-clamp-2 text-sm font-semibold leading-tight">{talk.eventTitle}</span>
                    </span>
                  </Link>
                </div>
                );
              })}
            </div>

            <CTASection
              title={t('speakers.cta.title')}
              description={t('speakers.cta.description')}
            >
              <div className="flex flex-wrap justify-center gap-4">
                <Button href="mailto:hello@cloudnative.lv?subject=Talk proposal">{t('speakers.cta.submit')}</Button>
                <Button to="/events" variant="secondary">{t('speakers.cta.viewEvents')}</Button>
              </div>
            </CTASection>
          </>
        )}
      </div>
    </div>
  );
}
