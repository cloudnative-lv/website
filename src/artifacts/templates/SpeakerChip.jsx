import { speakerRole, initials } from '../fields';

// Small circular photo + name/role, used in the "with-speakers" event banners.
// `u` is 1% of the banner height, so chips scale with the canvas.
export default function SpeakerChip({ speaker, u }) {
  const size = 13 * u;
  return (
    <div className="flex items-center" style={{ gap: `${1.8 * u}px` }}>
      <div className="shrink-0 rounded-full bg-burgundy" style={{ padding: `${0.7 * u}px` }}>
        <div
          className="flex items-center justify-center overflow-hidden rounded-full bg-rose-100"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {speaker.photo ? (
            <img src={speaker.photo} alt={speaker.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-black text-burgundy" style={{ fontSize: `${4 * u}px` }}>
              {initials(speaker.name)}
            </span>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-bold text-burgundy" style={{ fontSize: `${3.2 * u}px` }}>
          {speaker.name}
        </div>
        {speakerRole(speaker) && (
          <div className="italic text-rose-500" style={{ fontSize: `${2.3 * u}px` }}>
            {speakerRole(speaker)}
          </div>
        )}
      </div>
    </div>
  );
}
