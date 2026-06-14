import BannerFrame, { BannerLogo } from './BannerFrame';

// Plain deck-slide background (16:9): cream + Riga skyline + the Cloud Native
// Latvia logo top-right, no event text. The deck (deck.js) uses this PNG as the
// backdrop for its text slides (agenda, partners, feedback, closing) so they
// share the banner system's look.
export default function DeckBackground({ width = 1920, height = 1080 }) {
  const u = height / 100;
  return (
    <BannerFrame width={width} height={height} skylineClass="opacity-25">
      <BannerLogo className="absolute" style={{ right: `${4 * u}px`, top: `${5 * u}px` }} u={u} />
    </BannerFrame>
  );
}
