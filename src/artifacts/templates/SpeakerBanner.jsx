import BannerFrame, { BannerLogo } from './BannerFrame';
import { meetupNumber, dateDots, speakerRole, initials, talkSpeakerNames } from '../fields';
import { getSpeakerInfo } from '../../data/speakers';

// 1280×720 LinkedIn speaker banner: meetup #/date, logo, one or two speaker
// photo+name boxes, and the talk title. The same template serves both the
// single- and two-speaker cases (the box list just grows).
export default function SpeakerBanner({ event, talk }) {
  const speakers = talkSpeakerNames(talk).map(getSpeakerInfo);
  const one = speakers.length === 1;

  return (
    <BannerFrame width={1280} height={720} skylineClass="opacity-25">
      {/* Header: meetup # + date */}
      <div className="absolute left-14 top-12 flex items-baseline gap-8">
        <span className="text-6xl font-black text-burgundy">Meetup #{meetupNumber(event)}</span>
        <span className="text-5xl font-bold text-burgundy">{dateDots(event.date)}</span>
      </div>

      <BannerLogo className="absolute right-10 top-8" u={7.2} />

      {/* Speaker photo + name/role boxes (sizing adapts to 1 vs 2 speakers) */}
      <div className={`absolute left-14 right-20 flex flex-col ${one ? 'top-[27%]' : 'top-[19%] gap-9'}`}>
        {speakers.map((s) => (
          <div key={s.name} className="flex items-center">
            <div className={`z-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 ring-[6px] ring-burgundy ${one ? 'h-48 w-48' : 'h-40 w-40'}`}>
              {s.photo ? (
                <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-burgundy">{initials(s.name)}</span>
              )}
            </div>
            <div className={`-ml-12 max-w-[760px] rounded-r-xl bg-burgundy pr-12 ${one ? 'py-5 pl-24' : 'py-4 pl-20'}`}>
              <div className={`truncate font-bold text-white ${one ? 'text-4xl' : 'text-3xl'}`}>{s.name}</div>
              {speakerRole(s) && (
                <div className={`truncate italic text-rose-200 ${one ? 'text-2xl' : 'text-xl'}`}>{speakerRole(s)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Talk title — full-bleed, semi-transparent, floating in the lower third.
          Sits lower for two speakers so it clears the taller photo stack. */}
      <div className={`absolute inset-x-0 ${one ? 'bottom-[14%]' : 'bottom-[8%]'} flex items-center justify-center bg-burgundy/90 px-16 py-7`}>
        <div className="text-center text-4xl font-bold leading-snug text-white">{talk.title}</div>
      </div>
    </BannerFrame>
  );
}
