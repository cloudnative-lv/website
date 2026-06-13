import BannerFrame, { BannerLogo } from './BannerFrame';
import { meetupNumber, dateDots, speakerRole, initials, talkSpeakerNames } from '../fields';
import { getSpeakerInfo } from '../../data/speakers';

// 1280×720 LinkedIn speaker banner: meetup #/date, logo, one or two speaker
// photo+name boxes, and the talk title. The same template serves both the
// single- and two-speaker cases (the box list just grows).
export default function SpeakerBanner({ event, talk }) {
  const speakers = talkSpeakerNames(talk).map(getSpeakerInfo);

  return (
    <BannerFrame width={1280} height={720} skylineClass="opacity-40">
      {/* Header: meetup # + date */}
      <div className="absolute left-14 top-12 flex items-baseline gap-6">
        <span className="text-5xl font-black text-burgundy">Meetup #{meetupNumber(event)}</span>
        <span className="text-4xl font-bold text-burgundy">{dateDots(event.date)}</span>
      </div>

      <BannerLogo className="absolute right-12 top-9" iconClass="h-16" />

      {/* Speaker photo + name/role boxes */}
      <div className="absolute left-14 right-24 top-44 flex flex-col gap-7">
        {speakers.map((s) => (
          <div key={s.name} className="flex items-center">
            <div className="z-10 flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 ring-8 ring-burgundy">
              {s.photo ? (
                <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-burgundy">{initials(s.name)}</span>
              )}
            </div>
            <div className="-ml-12 max-w-[640px] rounded-r-xl bg-burgundy py-4 pl-20 pr-10">
              <div className="truncate text-3xl font-bold text-white">{s.name}</div>
              {speakerRole(s) && (
                <div className="truncate text-xl italic text-rose-200">{speakerRole(s)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Talk title */}
      <div className="absolute inset-x-14 bottom-14 rounded-xl bg-burgundy px-10 py-6">
        <div className="text-3xl font-bold leading-snug text-white">{talk.title}</div>
      </div>
    </BannerFrame>
  );
}
