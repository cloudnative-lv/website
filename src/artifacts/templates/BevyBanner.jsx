import skyline from '../assets/skyline.svg';
import { meetupNumber } from '../fields';

// Legacy Bevy cover strip (2560×650): solid brand pink with a darker, tone-on-tone
// Riga skyline in the lower-left and "#N Meetup" top-left. Kept for archived events
// whose Bevy pages still redirect.
export default function BevyBanner({ event }) {
  return (
    <div
      data-artifact-frame
      className="relative overflow-hidden bg-pink"
      style={{ width: '2560px', height: '650px' }}
    >
      <img
        src={skyline}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 select-none opacity-40 mix-blend-multiply"
        style={{ height: '92%', width: 'auto' }}
      />
      <div
        className="absolute font-black text-white"
        style={{ left: '56px', top: '40px', fontSize: '58px', textShadow: '0 2px 6px rgba(74,13,34,.35)' }}
      >
        #{meetupNumber(event)} Meetup
      </div>
    </div>
  );
}
