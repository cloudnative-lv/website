import { skyline } from './skylines';

// Fixed-size canvas with the Riga skyline backdrop. Every banner template renders
// inside one at exact pixel dimensions; the screenshot pipeline targets
// [data-artifact-frame]. `skylineSrc` picks the backdrop (detailed default, or the
// clean `skylineSimple` for wide/short channel covers); `skylinePos` is `bottom`
// (the skyline sits along the foot) or `cover-top` (the silhouette fills the frame,
// anchored to the top); `skylineClass` tunes opacity.
export default function BannerFrame({
  width,
  height,
  className = '',
  baseClass = 'bg-rose-50',
  skylineClass = 'opacity-60',
  skylineSrc = skyline,
  skylinePos = 'bottom',
  children,
}) {
  const pos = skylinePos === 'cover-top'
    ? 'absolute inset-0 h-full w-full object-cover object-top'
    : 'absolute inset-x-0 bottom-0 w-full';
  return (
    <div
      data-artifact-frame
      className={`relative overflow-hidden ${baseClass} ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img src={skylineSrc} alt="" aria-hidden="true" className={`pointer-events-none select-none ${pos} ${skylineClass}`} />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

// The Cloud Native Latvia lockup as it appears on banners: cloud+cube icon above
// the two-line wordmark (pink "CLOUD NATIVE", burgundy "LATVIA"). Pass `u` (1% of
// banner height) to scale proportionally; omit it to use the fixed sizing that
// suits the 1280×720 templates.
export function BannerLogo({ u, iconClass = 'h-16', className = '', style }) {
  const sized = typeof u === 'number';
  return (
    <div className={`flex flex-col items-center leading-none ${className}`} style={style}>
      <img
        src="/images/logo.svg"
        alt="Cloud Native Latvia"
        className={sized ? 'w-auto' : `${iconClass} w-auto`}
        style={sized ? { height: `${18 * u}px` } : undefined}
      />
      <span
        className="font-bold uppercase tracking-tight text-pink"
        style={sized ? { fontSize: `${3.4 * u}px`, marginTop: `${1.2 * u}px` } : { marginTop: '0.5rem', fontSize: '0.875rem' }}
      >
        Cloud Native
      </span>
      <span
        className="font-black uppercase text-burgundy"
        style={sized ? { fontSize: `${5.6 * u}px`, letterSpacing: `${0.5 * u}px` } : { fontSize: '1.5rem', letterSpacing: '0.2em' }}
      >
        Latvia
      </span>
    </div>
  );
}
