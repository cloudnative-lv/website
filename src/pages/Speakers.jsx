import { Link } from 'react-router-dom';
import { getEvents } from '../data/events';
import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import SEO from '../components/SEO';
import SpeakerAvatar from '../components/SpeakerAvatar';
import SpeakerSocials from '../components/SpeakerSocials';
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
      event.talks.forEach(talk => {
        const speakers = getSpeakersFromTalk(talk);
        speakers.forEach(speaker => {
          talks.push({
            speaker: speaker,
            title: talk.title,
            description: talk.description,
            eventSlug: event.slug,
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
                return (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-20 bg-linear-to-r from-rose-400 to-rose-600 flex items-center px-6">
                    <SpeakerAvatar
                      name={talk.speaker}
                      photo={info.photo}
                      className="w-12 h-12 text-base shrink-0 ring-2 ring-white/40"
                    />
                    <div className="ml-4 text-white">
                      <h3 className="font-bold text-lg leading-tight">
                        {talk.speaker}
                        <SpeakerSocials info={info} iconClass="text-white/70 hover:text-white" />
                      </h3>
                      {(info.title || info.company) && (
                        <p className="text-white/85 text-xs mt-0.5">{[info.title, info.company].filter(Boolean).join(' · ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-burgundy mb-3 line-clamp-2">{talk.title}</h4>
                    {talk.coSpeakers.length > 0 && (
                      <p className="text-pink text-sm mb-2">{t('speakers.with')} {talk.coSpeakers.join(', ')}</p>
                    )}
                    {talk.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{talk.description}</p>
                    )}
                    <Link 
                      to={`/events/${talk.eventSlug}`}
                      className="inline-flex items-center text-sm text-pink hover:text-burgundy font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {talk.eventTitle}
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>

            <CTASection
              title={t('speakers.cta.title')}
              description={t('speakers.cta.description')}
            >
              <div className="flex flex-wrap justify-center gap-4">
                <Button href="mailto:speakers@cloudnative.lv">{t('speakers.cta.submit')}</Button>
                <Button to="/events" variant="secondary">{t('speakers.cta.viewEvents')}</Button>
              </div>
            </CTASection>
          </>
        )}
      </div>
    </div>
  );
}
