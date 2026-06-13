import skyline from '../assets/skyline.svg';

// Fixed-size canvas with the Riga skyline backdrop. Every banner template renders
// inside one at exact pixel dimensions; the screenshot pipeline targets
// [data-artifact-frame]. `skylineClass` tunes the backdrop per template.
export default function BannerFrame({
  width,
  height,
  className = '',
  baseClass = 'bg-rose-50',
  skylineClass = 'opacity-60',
  children,
}) {
  return (
    <div
      data-artifact-frame
      className={`relative overflow-hidden ${baseClass} ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img
        src={skyline}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 w-full select-none ${skylineClass}`}
      />
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
        style={sized ? { height: `${15 * u}px` } : undefined}
      />
      <span
        className="font-bold uppercase tracking-tight text-pink"
        style={sized ? { fontSize: `${3 * u}px`, marginTop: `${1.2 * u}px` } : { marginTop: '0.5rem', fontSize: '0.875rem' }}
      >
        Cloud Native
      </span>
      <span
        className="font-black uppercase text-burgundy"
        style={sized ? { fontSize: `${4.8 * u}px`, letterSpacing: `${0.5 * u}px` } : { fontSize: '1.5rem', letterSpacing: '0.2em' }}
      >
        Latvia
      </span>
    </div>
  );
}
