import { useState, useRef, useLayoutEffect } from 'react';

// Renders a fixed-size artifact component scaled down to fit its container. The
// inner box keeps the artifact's real pixel dimensions (so it looks identical to
// the generated file); the transform just shrinks it. Responsive: it measures
// its own width and scales to fit, so it never overflows the card it sits in.
export default function ScaledPreview({ width, height, children }) {
  const ref = useRef(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setBoxWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = boxWidth ? boxWidth / width : 0;
  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-lg bg-white ring-1 ring-rose-200"
      style={{ height: Math.round(height * scale) }}
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
