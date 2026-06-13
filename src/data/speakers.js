import speakers from './speakers.yaml';

// Speaker photos are auto-discovered: drop an image into src/assets/speakers/
// named <speaker-slug>.<ext> (see speakerSlug below). No YAML changes needed.
const photoFiles = import.meta.glob('../assets/speakers/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// "Jānis Orlovs" -> "janis-orlovs"
export const speakerSlug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const photosBySlug = {};
for (const [path, url] of Object.entries(photoFiles)) {
  const file = path.split('/').pop();
  photosBySlug[file.replace(/\.[^.]+$/, '')] = url;
}

export const getSpeakerInfo = (name) => ({
  name,
  ...(speakers[name] || {}),
  photo: photosBySlug[speakerSlug(name)] || null,
});
