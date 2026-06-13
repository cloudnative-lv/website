const COLORS = ['bg-pink', 'bg-rose-500', 'bg-burgundy', 'bg-rose-700', 'bg-rose-400'];

// Photo when one exists in src/assets/speakers/, otherwise brand-colored
// initials — deterministic per name so a speaker keeps their color everywhere.
export default function SpeakerAvatar({ name, photo, className = 'w-10 h-10 text-sm' }) {
  if (photo) {
    return <img src={photo} alt={name} loading="lazy" className={`${className} rounded-full object-cover`} />;
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const color = COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length];
  return (
    <div
      className={`${className} ${color} rounded-full flex items-center justify-center text-white font-bold`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
