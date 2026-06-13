import skyline from '../assets/skyline.svg';

// Decorative cover strip for Open Community Groups (the platform that replaced
// Bevy). It sits behind the breadcrumb nav, which renders its own dark text, so
// this is a LIGHT, textless brand strip (gradient + faint skyline + logo lockup).
// Rendered at desktop 2428×192 and mobile 1220×192; `u` (1% of height) scales it.
export default function OcgBanner({ width, height }) {
  const u = height / 100;
  return (
    <div
      data-artifact-frame
      className="relative overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: 'linear-gradient(90deg, #fdf2f4 0%, #fce4ec 55%, #f8bbd9 100%)',
      }}
    >
      <img
        src={skyline}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-40"
        style={{ objectPosition: 'center 60%' }}
      />
      <div
        className="absolute inset-y-0 right-0 flex items-center"
        style={{ paddingRight: `${6 * u}px`, gap: `${2.5 * u}px` }}
      >
        <img src="/images/logo.svg" alt="Cloud Native Latvia" className="w-auto" style={{ height: `${52 * u}px` }} />
        <div className="flex flex-col uppercase leading-none">
          <span className="font-bold text-pink" style={{ fontSize: `${13 * u}px`, letterSpacing: `${0.4 * u}px` }}>
            Cloud Native
          </span>
          <span className="font-black text-burgundy" style={{ fontSize: `${20 * u}px`, letterSpacing: `${1 * u}px` }}>
            Latvia
          </span>
        </div>
      </div>
    </div>
  );
}
