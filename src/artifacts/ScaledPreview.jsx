// Renders a fixed-size artifact component scaled down to fit a card. The inner
// box keeps the artifact's real pixel dimensions (so it looks identical to the
// generated file); the transform just shrinks it.
export default function ScaledPreview({ width, height, cardWidth, children }) {
  const scale = cardWidth / width;
  return (
    <div
      className="overflow-hidden rounded-lg bg-white ring-1 ring-rose-200"
      style={{ width: cardWidth, height: Math.round(height * scale) }}
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
