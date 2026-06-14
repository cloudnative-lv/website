import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';

// A talk title rendered as a discoverable link to its talk page (chevron +
// hover underline). Wrap in the heading element at the call site. `clamp`
// truncates long titles to two lines (used in the compact speaker cards).
export default function TalkTitleLink({ to, title, clamp = false }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-start gap-1.5 text-burgundy hover:text-pink hover:underline transition-colors"
    >
      <span className={clamp ? 'line-clamp-2' : undefined}>{title}</span>
      <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
