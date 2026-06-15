import BannerFrame, { BannerLogo } from './BannerFrame';

// Generic, event-agnostic channel cover for the community's own social profiles:
// LinkedIn company page (1128×191 strip), Bluesky (1500×500), and the Eventbrite
// organizer/collection cover (2160×1080). Riga skyline backdrop + the Cloud Native
// Latvia lockup + a one-line tagline. Wide-but-short strips lay the lockup out
// horizontally next to the tagline; taller covers stack it and add the website URL.
// Everything scales to height (u = 1% of height) so one template serves all sizes.
const TAGLINE = 'The Kubernetes & DevOps community in Latvia';

export default function PlatformBanner({ width, height, tagline = TAGLINE }) {
  const u = height / 100;

  // A thin strip (LinkedIn 1128×191) can't stack a lockup + tagline — lay it out in
  // a row, mark + wordmark | divider | tagline.
  if (width / height >= 4) {
    return (
      <BannerFrame width={width} height={height} skylineClass="opacity-25">
        <div className="absolute inset-0 flex items-center justify-center" style={{ gap: `${4 * u}px` }}>
          <img src="/images/logo.svg" alt="Cloud Native Latvia" className="w-auto" style={{ height: `${46 * u}px` }} />
          <div className="flex flex-col uppercase leading-none">
            <span className="font-bold text-pink" style={{ fontSize: `${11 * u}px`, letterSpacing: `${0.4 * u}px` }}>Cloud Native</span>
            <span className="font-black text-burgundy" style={{ fontSize: `${17 * u}px`, letterSpacing: `${0.8 * u}px` }}>Latvia</span>
          </div>
          <div className="bg-pink/40" style={{ width: `${0.4 * u}px`, height: `${44 * u}px`, marginLeft: `${3 * u}px`, marginRight: `${3 * u}px` }} />
          <span className="font-semibold text-burgundy" style={{ fontSize: `${9 * u}px`, maxWidth: `${52 * u}px`, lineHeight: 1.25 }}>{tagline}</span>
        </div>
      </BannerFrame>
    );
  }

  // Wide cover (Bluesky, Eventbrite): stacked lockup centered, tagline + URL beneath.
  return (
    <BannerFrame width={width} height={height} skylineClass="opacity-30">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <BannerLogo u={u * 2} />
        <p className="font-semibold text-burgundy" style={{ fontSize: `${5 * u}px`, marginTop: `${4 * u}px` }}>{tagline}</p>
        <p className="font-bold text-pink" style={{ fontSize: `${3.6 * u}px`, letterSpacing: `${0.5 * u}px`, marginTop: `${1.5 * u}px` }}>cloudnative.lv</p>
      </div>
    </BannerFrame>
  );
}
