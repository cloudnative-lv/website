import SpeakerAvatar from './SpeakerAvatar';
import SpeakerSocials from './SpeakerSocials';
import { getSpeakerInfo } from '../data/speakers';

// One speaker rendered as an avatar + name (with inline socials) + role/company
// + bio. `size` controls the avatar/name scale: 'sm' (talk lists on the event
// page) or 'md' (the talk page's "presented by").
const SIZES = {
  sm: { gap: 'gap-3', avatar: 'w-10 h-10 text-sm shrink-0', name: 'font-semibold text-burgundy leading-tight' },
  md: { gap: 'gap-4', avatar: 'w-14 h-14 text-lg shrink-0', name: 'font-bold text-burgundy leading-tight' },
};

export default function SpeakerBio({ name, size = 'sm' }) {
  const info = getSpeakerInfo(name);
  const s = SIZES[size];
  return (
    <div className={`flex items-start ${s.gap}`}>
      <SpeakerAvatar name={name} photo={info.photo} className={s.avatar} />
      <div>
        <p className={s.name}>
          {name}
          <SpeakerSocials info={info} iconClass="text-pink hover:text-burgundy" />
        </p>
        {info.title && <p className="text-pink text-sm font-bold leading-tight">{info.title}</p>}
        {info.company && <p className="text-pink/80 text-sm italic leading-tight">{info.company}</p>}
        {info.bio && <p className="text-gray-500 text-sm mt-1">{info.bio}</p>}
      </div>
    </div>
  );
}
