import { SlidesIcon } from './Icons';

// Pill link to a talk's slides (PDF or external deck). Pass margin via className.
export default function SlidesLink({ href, label, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full bg-pink px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 ${className}`}
    >
      <SlidesIcon className="w-4 h-4" />
      {label}
    </a>
  );
}
