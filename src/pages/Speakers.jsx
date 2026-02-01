import { Link } from 'react-router-dom';
import { events } from '../data/events';
import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import SEO from '../components/SEO';
import { SpeakersPageJsonLd } from '../components/JsonLd';

function getSpeakersFromEvents() {
  const speakersMap = new Map();
  
  events.forEach(event => {
    if (event.talks) {
      event.talks.forEach(talk => {
        const speakerName = talk.speaker;
        if (!speakersMap.has(speakerName)) {
          speakersMap.set(speakerName, {
            name: speakerName,
            talks: [],
            events: []
          });
        }
        const speaker = speakersMap.get(speakerName);
        speaker.talks.push({
          title: talk.title,
          description: talk.description,
          eventSlug: event.slug,
          eventTitle: event.title,
          eventDate: event.date
        });
        if (!speaker.events.includes(event.slug)) {
          speaker.events.push(event.slug);
        }
      });
    }
  });
  
  return Array.from(speakersMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

const speakers = getSpeakersFromEvents();

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
              {speakers.map((speaker, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-24 bg-linear-to-r from-rose-400 to-rose-600 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-burgundy mb-2">{speaker.name}</h3>
                    <p className="text-pink font-semibold text-sm mb-4">
                      {speaker.talks.length} talk{speaker.talks.length !== 1 ? 's' : ''} at {speaker.events.length} event{speaker.events.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-3">
                      {speaker.talks.map((talk, tidx) => (
                        <div key={tidx} className="border-l-2 border-rose-200 pl-3">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">{talk.title}</p>
                          <Link 
                            to={`/events/${talk.eventSlug}`}
                            className="text-xs text-pink hover:text-burgundy transition-colors"
                          >
                            {talk.eventTitle} →
                          </Link>
                        </div>
                      ))}
                    </div>
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
