import BannerFrame, { BannerLogo } from './BannerFrame';
import { meetupNumber, dateDots, cleanTitle, eventSpeakerNames, speakerRole, initials } from '../fields';
import { getSpeakerInfo } from '../../data/speakers';

const BURGUNDY = '#8b1538';

// Event-level banner: "Meetup #N · date" header, logo, the event's speakers as
// photo + burgundy name-bands (the Figma speaker style), and a full-bleed title
// band. One template at several sizes — Eventbrite (2160×1080), LinkedIn event
// (1600×900), OG (1200×630). Sizing is proportional to height (u = 1% of height).
export default function EventTitleBanner({ width, height, event, withSpeakers = false }) {
  const u = height / 100;
  const speakers = withSpeakers ? eventSpeakerNames(event).map(getSpeakerInfo) : [];
  const n = speakers.length;

  // Name-band sizing scales down as the speaker list grows so it always fits.
  const photo = (n <= 1 ? 17 : n === 2 ? 15 : n === 3 ? 12.5 : 10.5) * u;
  const nameU = n <= 2 ? 3.7 : n === 3 ? 3.1 : 2.7;
  const roleU = n <= 2 ? 2.5 : n === 3 ? 2.1 : 1.8;
  const gap = (n <= 2 ? 3 : 2) * u;
  const stackTop = (n <= 1 ? 31 : n === 2 ? 27 : 23) * u;
  const titleTop = (n === 0 ? 59 : n <= 2 ? 73 : 77) * u;

  return (
    <BannerFrame width={width} height={height} skylineClass="opacity-25">
      {/* Header */}
      <div className="absolute flex items-baseline" style={{ left: `${4.5 * u}px`, top: `${7 * u}px`, gap: `${5 * u}px` }}>
        <span className="font-black text-burgundy" style={{ fontSize: `${8 * u}px` }}>Meetup #{meetupNumber(event)}</span>
        <span className="font-bold text-burgundy" style={{ fontSize: `${6 * u}px` }}>{dateDots(event.date)}</span>
      </div>

      <BannerLogo className="absolute" style={{ right: `${4 * u}px`, top: `${5 * u}px` }} u={u} />

      {/* Speakers — circular photo + burgundy name-band, stacked */}
      {n > 0 && (
        <div className="absolute flex flex-col" style={{ left: `${4.5 * u}px`, right: `${4.5 * u}px`, top: `${stackTop}px`, gap: `${gap}px` }}>
          {speakers.map((s) => (
            <div key={s.name} className="flex items-center">
              <div
                className="z-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100"
                style={{ width: `${photo}px`, height: `${photo}px`, boxShadow: `0 0 0 ${0.5 * u}px ${BURGUNDY}` }}
              >
                {s.photo
                  ? <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />
                  : <span className="font-black text-burgundy" style={{ fontSize: `${nameU * u}px` }}>{initials(s.name)}</span>}
              </div>
              <div
                className="rounded-r-xl bg-burgundy"
                style={{ marginLeft: `${-photo * 0.32}px`, paddingLeft: `${photo * 0.55}px`, paddingRight: `${3 * u}px`, paddingTop: `${1.3 * u}px`, paddingBottom: `${1.3 * u}px`, maxWidth: `${74 * u}px` }}
              >
                <div className="truncate font-bold text-white" style={{ fontSize: `${nameU * u}px` }}>{s.name}</div>
                {speakerRole(s) && (
                  <div className="truncate italic text-rose-200" style={{ fontSize: `${roleU * u}px` }}>{speakerRole(s)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Title band — full-bleed, semi-transparent */}
      <div className="absolute inset-x-0 flex items-center justify-center bg-burgundy/90" style={{ top: `${titleTop}px`, height: `${15 * u}px` }}>
        <div className="text-center font-bold text-white" style={{ fontSize: `${7 * u}px`, lineHeight: 1.15, paddingLeft: `${5 * u}px`, paddingRight: `${5 * u}px` }}>
          {cleanTitle(event.title)}
        </div>
      </div>
    </BannerFrame>
  );
}
