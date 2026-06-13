import BannerFrame from './BannerFrame';
import { meetupNumber } from '../fields';

// Legacy Bevy cover strip (2560×650): saturated pink with "#N Meetup" and a
// faint skyline. Kept for archived events whose Bevy pages still redirect.
export default function BevyBanner({ event }) {
  return (
    <BannerFrame width={2560} height={650} baseClass="bg-rose-400" skylineClass="opacity-25 brightness-150">
      <div
        className="absolute font-black uppercase text-white"
        style={{ left: '52px', top: '40px', fontSize: '58px', textShadow: '0 2px 6px rgba(74,13,34,.35)' }}
      >
        #{meetupNumber(event)} Meetup
      </div>
    </BannerFrame>
  );
}
