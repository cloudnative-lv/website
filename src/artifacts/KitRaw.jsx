import { useParams } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import { resolveVariant, resolveBrand } from './artifactSpec';

// Full-bleed single-artifact route used by the screenshot pipeline:
//   /kit/:slug/raw/:variant   e.g. /kit/meetup-006-…/raw/speaker-1
//   /kit/brand/raw/:variant   brand assets (OCG banner) — no event
// Renders just the artifact (no site chrome). The screenshot script waits for
// [data-artifact-frame] and document.fonts.ready, then captures the frame.
export default function KitRaw() {
  const { slug, variant } = useParams();

  let resolved;
  if (slug === 'brand') {
    resolved = resolveBrand(variant);
  } else {
    const event = getEventBySlug(slug);
    if (!event) return <div data-artifact-error>event not found: {slug}</div>;
    resolved = resolveVariant(event, variant);
  }
  if (!resolved) return <div data-artifact-error>unknown variant: {variant}</div>;

  const { Component, props } = resolved;
  return (
    <div className="inline-block">
      <Component {...props} />
    </div>
  );
}
