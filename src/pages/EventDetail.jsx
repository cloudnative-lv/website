import { useParams, Link } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import EventQRCode from '../components/EventQRCode';

export default function EventDetail() {
  const { slug } = useParams();
  const event = getEventBySlug(slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link to="/events" className="text-rose-600 hover:text-rose-700">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isUpcoming = event.status === 'upcoming';

  return (
    <div className="min-h-screen bg-pink-light">
      <div className={`${isUpcoming ? 'bg-linear-to-r from-rose-400 to-rose-700' : 'bg-gray-600'} text-white py-16`}>
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/events" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to events
          </Link>
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${isUpcoming ? 'bg-white/20' : 'bg-white/10'}`}>
            {isUpcoming ? 'Upcoming Event' : 'Past Event'}
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-black text-burgundy mb-4">About this event</h2>
              <div className="prose prose-gray max-w-none">
                {event.description.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            {event.talks && event.talks.length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-black text-burgundy mb-6">Talks</h2>
                <div className="space-y-6">
                  {event.talks.map((talk, idx) => (
                    <div key={idx} className="border-l-4 border-pink pl-4">
                      <h3 className="text-lg font-bold text-burgundy">{talk.title}</h3>
                      <p className="text-pink text-sm font-semibold mt-1">Speaker: {talk.speaker}</p>
                      <p className="text-gray-600 mt-2">{talk.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h3 className="text-lg font-bold text-burgundy mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Venue</p>
                  <p className="text-burgundy font-medium">{event.venue.name}</p>
                  <p className="text-gray-600 text-sm">{event.venue.address}</p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Topics</p>
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
                    Register on Eventbrite
                  </a>
                )}

                {!isUpcoming && event.eventbriteUrl && (
                  <a
                    href={event.eventbriteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-full font-semibold hover:bg-gray-300 transition-colors mt-6"
                  >
                    View on Eventbrite
                  </a>
                )}

                {event.cncfUrl && (
                  <a
                    href={event.cncfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-burgundy text-white text-center py-3 px-4 rounded-full font-semibold hover:bg-rose-800 transition-all shadow-md hover:shadow-lg mt-3"
                  >
                    View on CNCF Community
                  </a>
                )}

                {/* QR Code */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-3 text-center">Share Event</p>
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
