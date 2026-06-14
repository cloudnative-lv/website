import BannerFrame, { BannerLogo } from './BannerFrame';
import SpeakerChip from './SpeakerChip';
import { meetupNumber, dateDots, cleanTitle, eventSpeakerNames } from '../fields';
import { getSpeakerInfo } from '../../data/speakers';

// Event-level banner: "Meetup #N · date" header, logo, a big title box, and
// (optionally) a row of speaker chips. One template at several sizes — Eventbrite
// (2160×1080), LinkedIn event (1600×900), OG (1200×630). Sizing is proportional
// to height (`u` = 1% of height) so every size stays balanced.
export default function EventTitleBanner({ width, height, event, withSpeakers = false }) {
  const u = height / 100;
  const speakers = withSpeakers ? eventSpeakerNames(event).map(getSpeakerInfo) : [];

  return (
    <BannerFrame width={width} height={height} skylineClass="opacity-25">
      {/* Header */}
      <div className="absolute flex items-baseline" style={{ left: `${4.5 * u}px`, top: `${7 * u}px`, gap: `${5 * u}px` }}>
        <span className="font-black text-burgundy" style={{ fontSize: `${8 * u}px` }}>
          Meetup #{meetupNumber(event)}
        </span>
        <span className="font-bold text-burgundy" style={{ fontSize: `${6 * u}px` }}>
          {dateDots(event.date)}
        </span>
      </div>

      <BannerLogo className="absolute" style={{ right: `${4 * u}px`, top: `${5 * u}px` }} u={u} />

      {/* Optional speaker chips */}
      {speakers.length > 0 && (
        <div
          className="absolute flex flex-wrap items-start"
          style={{ left: `${4.5 * u}px`, right: `${4.5 * u}px`, top: `${30 * u}px`, gap: `${4 * u}px ${10 * u}px` }}
        >
          {speakers.map((s) => (
            <SpeakerChip key={s.name} speaker={s} u={u} />
          ))}
        </div>
      )}

      {/* Title band — full-bleed, semi-transparent, floating in the lower third */}
      <div
        className="absolute inset-x-0 flex items-center justify-center bg-burgundy/90"
        style={{ top: `${59 * u}px`, height: `${15 * u}px` }}
      >
        <div
          className="text-center font-bold text-white"
          style={{ fontSize: `${7 * u}px`, lineHeight: 1.15, paddingLeft: `${5 * u}px`, paddingRight: `${5 * u}px` }}
        >
          {cleanTitle(event.title)}
        </div>
      </div>
    </BannerFrame>
  );
}
