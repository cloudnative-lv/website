import { Link } from 'react-router-dom';
import { getEvents } from '../data/events';
import { brandArtifacts, resolveBrand } from './artifactSpec';
import { meetupNumber, cleanTitle, dateDots } from './fields';
import ScaledPreview from './ScaledPreview';

// Organizer kit index (unlisted): every event's kit + set-once platform assets
// (the OCG banner strips). Reachable by direct link at /kit.
export default function KitIndex() {
  const events = getEvents();
  const brand = brandArtifacts();

  return (
    <div className="min-h-screen bg-pink-light pb-20">
      <header className="bg-linear-to-r from-rose-400 to-rose-700 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-black">Organizer kits</h1>
          <p className="mt-1 text-white/90">Download banners, QR codes, and social copy for each event.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-burgundy">Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Link
                key={e.id}
                to={`/kit/${e.slug}`}
                className="block rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <p className="text-sm font-semibold text-pink">Meetup #{meetupNumber(e)} · {dateDots(e.date)}</p>
                <p className="mt-1 font-bold text-gray-800">{cleanTitle(e.title)}</p>
                <p className="mt-2 text-sm text-burgundy">Open kit →</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-1 text-xl font-bold text-burgundy">Platform assets</h2>
          <p className="mb-4 text-sm text-gray-600">
            Set-once OCG (Open Community Groups) banner strips — upload at the group/community
            level; all events inherit them.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {brand.map((a) => {
              const resolved = resolveBrand(a.variant);
              return (
                <div key={a.variant} className="rounded-xl bg-white p-4 shadow-sm">
                  <ScaledPreview width={a.width} height={a.height} cardWidth={a.width > 1600 ? 680 : 520}>
                    {resolved && <resolved.Component {...resolved.props} />}
                  </ScaledPreview>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                      <p className="text-xs text-gray-500">{a.width}×{a.height} · {a.format}</p>
                    </div>
                    <a
                      href={`/artifacts/brand/${a.filename}`}
                      download
                      className="rounded-full bg-burgundy px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
