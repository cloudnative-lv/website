import { allArtifacts } from './artifactSpec';
import { eventSocial } from './socialCopy';
import { getEvents, getEventTalks } from '../data/events';

const SITE = 'https://cloudnative.lv';

// Machine-readable index the generator reads to produce every artifact, so all
// the logic (matrix + URLs + copy) lives in the app, not duplicated in Node.
//   images: flat list of screenshot artifacts (per-event + brand)
//   events: per-event url (for QR) + social copy (for .md files)
// Route: /kit/manifest
export default function KitManifest() {
  const events = getEvents().map((e) => ({
    id: e.id,
    slug: e.slug,
    url: `${SITE}/events/${e.slug}`,
    talks: getEventTalks(e).map((tk) => tk.talkSlug),
    social: eventSocial(e),
  }));
  const manifest = { images: allArtifacts(), events };
  return <pre data-manifest>{JSON.stringify(manifest)}</pre>;
}
