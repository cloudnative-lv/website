import { upcomingEvents, pastEvents } from '../data/events';
import EventCard from '../components/EventCard';
import PageHeader from '../components/PageHeader';

export default function Events() {
  return (
    <div className="min-h-screen bg-pink-light">
      <PageHeader 
        title="Events" 
        subtitle="Join us for bi-monthly meetups exploring cloud native technologies"
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-burgundy mb-6 flex items-center">
              <span className="w-3 h-3 bg-pink rounded-full mr-3 animate-pulse"></span>
              Upcoming Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-burgundy mb-6">Past Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
