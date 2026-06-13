import { useLanguage } from '../i18n/useLanguage';

// Gallery photos are auto-discovered: drop image files into
// src/assets/events/<event-id>/ (the id from the event's YAML) and they show
// up on that event's page — no YAML changes needed. Keep them web-sized
// (~800px wide); the full album lives behind the event's photosUrl link.
const photoFiles = import.meta.glob('../assets/events/*/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const galleriesByEventId = {};
for (const [path, url] of Object.entries(photoFiles).sort(([a], [b]) => a.localeCompare(b))) {
  const parts = path.split('/');
  const eventId = parts[parts.length - 2]; // .../events/<event-id>/<file>
  (galleriesByEventId[eventId] ||= []).push(url);
}

export default function EventPhotoGallery({ event }) {
  const { t } = useLanguage();
  const photos = galleriesByEventId[event.id] || [];

  if (photos.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black text-burgundy">{t('eventDetail.photos')}</h2>
        {event.photosUrl && (
          <a
            href={event.photosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink hover:text-burgundy font-semibold text-sm transition-colors shrink-0"
          >
            {t('eventDetail.viewAllPhotos')} →
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((src, idx) => (
          <a
            key={src}
            href={event.photosUrl || src}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl group"
          >
            <img
              src={src}
              alt={`${event.title} — photo ${idx + 1}`}
              loading="lazy"
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
