import { Link } from 'react-router-dom';
import { events } from '../data/events';
import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import SEO from '../components/SEO';
import { SpeakersPageJsonLd } from '../components/JsonLd';

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
  
  events.forEach(event => {
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
        title="Speakers" 
        subtitle="Meet the amazing speakers who have shared their knowledge at our meetups"
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {speakers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No speakers yet. Stay tuned for upcoming events!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {allTalks.map((talk, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-20 bg-linear-to-r from-rose-400 to-rose-600 flex items-center px-6">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-white">
                      <h3 className="font-bold text-lg">{talk.speaker}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-burgundy mb-3 line-clamp-2">{talk.title}</h4>
                    {talk.coSpeakers.length > 0 && (
                      <p className="text-pink text-sm mb-2">with {talk.coSpeakers.join(', ')}</p>
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
              ))}
            </div>

            <CTASection
              title="Want to Speak?"
              description="We're always looking for speakers to share their experiences with cloud native technologies. Whether it's a 20-minute talk or a lightning talk, we'd love to hear from you!"
            >
              <div className="flex flex-wrap justify-center gap-4">
                <Button href="mailto:speakers@cloudnative.lv">Submit a Talk Proposal</Button>
                <Button to="/events" variant="secondary">View Upcoming Events</Button>
              </div>
            </CTASection>
          </>
        )}
      </div>
    </div>
  );
}
