import BannerFrame, { BannerLogo } from './BannerFrame';

// Square brand logo (1024×1024 PNG) for profile pictures / organization logos on
// LinkedIn, Eventbrite, Bluesky, etc. The stacked Cloud Native Latvia lockup centered
// on the rose brand field with a faint Riga skyline — same system as the banners, so
// the avatar and the covers read as one set.
export default function LogoArtifact({ width = 1024, height = 1024 }) {
  const u = height / 100;
  return (
    <BannerFrame width={width} height={height} skylineClass="opacity-20">
      <div className="absolute inset-0 flex items-center justify-center">
        <BannerLogo u={u * 1.8} />
      </div>
    </BannerFrame>
  );
}
