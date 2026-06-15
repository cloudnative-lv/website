import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import JSZip from 'jszip';
import { getEventBySlug } from '../data/events';
import { artifactsFor, resolveVariant } from './artifactSpec';
import { eventSocial } from './socialCopy';
import { meetupNumber, cleanTitle, dateDots } from './fields';
import ScaledPreview from './ScaledPreview';
import Button from '../components/Button';
import { QRCodeSVG } from 'qrcode.react';

// Organizer "kit" for one event (unlisted; reach by direct link). Shows every
// banner as a live preview with per-file download, plus QR and copy-to-clipboard
// social text, and a "download all" zip. The downloadable PNG/WebP/QR files are
// produced at build time into /artifacts/<id>/; the previews here are the live
// components, so this page is accurate even before generation runs.
const base = (id) => `/artifacts/${id}`;

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-full bg-burgundy px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
    >
      {done ? 'Copied ✓' : 'Copy'}
    </button>
  );
}

function triggerDownload(href, name) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function KitPage() {
  const { slug } = useParams();
  const event = getEventBySlug(slug);
  const [zipping, setZipping] = useState(false);
  const [deckBusy, setDeckBusy] = useState(false);
  const [htmlBusy, setHtmlBusy] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-pink-light p-10">
        <p>Event not found: {slug}. <Link className="text-burgundy underline" to="/kit">Back to kit index</Link></p>
      </div>
    );
  }

  const dir = base(event.id);
  const images = artifactsFor(event);
  const social = eventSocial(event);

  const pubSteps = [
    { title: 'CNCF / OCG (ocgroups.dev)', body: 'Create or confirm the event. Upload the OCG banner (under <code>brand/</code>) once per group — every event inherits it.', link: event.cncfUrl },
    { title: 'Eventbrite', body: 'Use <code>eventbrite.png</code> (or <code>eventbrite-speakers.png</code>) as the event cover.', link: event.eventbriteUrl },
    { title: 'LinkedIn', body: 'Create a LinkedIn Event and post <code>linkedin-event-speakers.png</code> with the Announcement copy below.', link: event.linkedinUrl },
    { title: 'Bluesky', body: 'Post the Announcement copy with <code>linkedin-post.png</code>.' },
    { title: 'Speaker spotlights', body: 'A few days out, post each <code>speaker-N.png</code> with its Speaker intro copy.' },
    { title: 'Opening deck', body: 'Download the <code>.pptx</code> above, tweak it, and present it at the venue.' },
    { title: 'After the event', body: `Add ~800px photos to <code>src/assets/events/${event.id}/</code>, set <code>photosUrl</code>, and add <code>slidesUrl</code> per talk.` },
  ];

  const downloadAll = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      zip.file('announcement.md', social.announcement);
      zip.file('eventbrite-description.md', social.eventbrite);
      social.speakerIntros.forEach((s) => zip.file(s.filename, s.text));
      social.speakerThankYous.forEach((s) => zip.file(s.filename, s.text));
      const files = [...images.map((i) => i.filename), 'qr.png', 'qr.svg'];
      await Promise.all(
        files.map(async (f) => {
          try {
            const r = await fetch(`${dir}/${f}`);
            if (r.ok) zip.file(f, await r.blob());
          } catch { /* file not generated yet (e.g. dev) */ }
        }),
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(URL.createObjectURL(blob), `${event.slug}-kit.zip`);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-light pb-20">
      <header className="bg-linear-to-r from-rose-400 to-rose-700 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <Link to="/kit" className="text-sm text-white/80 hover:text-white">← All event kits</Link>
          <h1 className="mt-2 text-3xl font-black">Organizer kit — Meetup #{meetupNumber(event)}</h1>
          <p className="mt-1 text-lg text-white/90">{cleanTitle(event.title)} · {dateDots(event.date)}</p>
          <button
            onClick={downloadAll}
            disabled={zipping}
            className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            {zipping ? 'Preparing…' : 'Download all (.zip)'}
          </button>
          <button
            onClick={async () => {
              setDeckBusy(true);
              try {
                const { downloadDeck } = await import('./deck');
                await downloadDeck(event);
              } finally {
                setDeckBusy(false);
              }
            }}
            disabled={deckBusy}
            className="mt-4 ml-3 rounded-full bg-white px-5 py-2 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            {deckBusy ? 'Building…' : 'Opening deck (.pptx)'}
          </button>
          <button
            onClick={async () => {
              setHtmlBusy(true);
              try {
                const { openHtmlDeck } = await import('./htmlDeck');
                openHtmlDeck(event);
              } finally {
                setHtmlBusy(false);
              }
            }}
            disabled={htmlBusy}
            className="mt-4 ml-3 rounded-full bg-white px-5 py-2 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            {htmlBusy ? 'Building…' : 'Present (.html)'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Publishing checklist */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-burgundy">Publishing checklist</h2>
          <ol className="space-y-3">
            {pubSteps.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-gray-800">{step.title}</p>
                  <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: step.body }} />
                  {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-pink underline hover:text-burgundy">Open →</a>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Banners */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-burgundy">Banners</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((a) => {
              const resolved = resolveVariant(event, a.variant);
              return (
                <div key={a.variant} className="rounded-xl bg-white p-4 shadow-sm">
                  <ScaledPreview width={a.width} height={a.height}>
                    {resolved && <resolved.Component {...resolved.props} />}
                  </ScaledPreview>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">{a.label}</p>
                      <p className="text-xs text-gray-500">{a.width}×{a.height} · {a.format || 'png'}</p>
                    </div>
                    <Button href={`${dir}/${a.filename}`} download variant="secondary" size="sm" className="shrink-0">
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* QR */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-burgundy">QR code</h2>
          <div className="flex items-center gap-6 rounded-xl bg-white p-5 shadow-sm">
            <img src={`${dir}/qr.png`} alt="Event QR code" className="h-32 w-32" />
            <div className="space-x-3">
              <Button href={`${dir}/qr.png`} download variant="secondary" size="sm">PNG</Button>
              <Button href={`${dir}/qr.svg`} download variant="secondary" size="sm">SVG</Button>
              <p className="mt-2 text-xs text-gray-500">Encodes cloudnative.lv/events/{event.slug}</p>
            </div>
          </div>
        </section>

        {/* Feedback QR — links to the unlisted feedback form. */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-burgundy">Feedback QR</h2>
          <div className="flex items-center gap-6 rounded-xl bg-white p-5 shadow-sm">
            <div className="rounded bg-white p-1 ring-1 ring-rose-200">
              <QRCodeSVG value={`https://cloudnative.lv/events/${event.slug}/feedback`} size={120} fgColor="#881337" />
            </div>
            <p className="text-sm text-gray-600">Show this at the event so attendees can leave feedback — links to the (unlisted) feedback form.</p>
          </div>
        </section>

        {/* Social copy */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-burgundy">Social copy</h2>
          <div className="space-y-5">
            {[{ title: 'Announcement', text: social.announcement }, { title: 'Eventbrite description', text: social.eventbrite }, ...social.speakerIntros.map((s, i) => ({ title: `Speaker intro ${i + 1}`, text: s.text }))].map((block) => (
              <div key={block.title} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{block.title}</h3>
                  <CopyButton text={block.text} />
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{block.text}</pre>
              </div>
            ))}
          </div>
        </section>

        {social.speakerThankYous.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-burgundy">Speaker thank-you emails</h2>
            <div className="space-y-5">
              {social.speakerThankYous.map((ty) => (
                <div key={ty.filename} className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{ty.name}</h3>
                    <CopyButton text={ty.text} />
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{ty.text}</pre>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
