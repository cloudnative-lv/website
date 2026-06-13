import BannerFrame, { BannerLogo } from './BannerFrame';
import { dateLong, startTime, venueLine } from '../fields';

// Minimal outline icons (white, inherit currentColor).
const ICON = {
  calendar: 'M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
  pin: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
};
const Icon = ({ name, size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: size, height: size, flexShrink: 0 }}
  >
    <path d={ICON[name]} />
  </svg>
);

// 1280×720 logistics card: logo + a burgundy band with date / start-time / venue.
export default function LinkedInPostImage({ event }) {
  return (
    <BannerFrame width={1280} height={720} skylineClass="opacity-40">
      <BannerLogo className="absolute right-12 top-9" iconClass="h-16" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-center gap-6 bg-burgundy px-16" style={{ height: '40%' }}>
        <div className="flex flex-wrap items-center gap-x-16 gap-y-4 text-white">
          <div className="flex items-center gap-4">
            <Icon name="calendar" size={48} />
            <span className="text-4xl font-bold">{dateLong(event.date)}</span>
          </div>
          {startTime(event) && (
            <div className="flex items-center gap-4">
              <Icon name="clock" size={48} />
              <span className="text-4xl font-bold">{startTime(event)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-white">
          <Icon name="pin" size={48} />
          <span className="text-4xl font-bold">{venueLine(event.venue)}</span>
        </div>
      </div>
    </BannerFrame>
  );
}
