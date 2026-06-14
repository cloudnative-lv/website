// A build-time artifact (e.g. a share banner) served from /artifacts/<id>/.
// Hidden gracefully when the file isn't present — e.g. in local dev before the
// generation step has run.
export default function ArtifactImage({ src, alt, className = 'w-full rounded-2xl shadow-lg ring-1 ring-rose-200' }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}
