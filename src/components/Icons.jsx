// UI glyph icons (outline, inherit color via currentColor). Brand/social icons
// live in SocialIcons.jsx; these are the generic interface glyphs.
function Glyph({ className, children }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

const P = (d) => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />;

export function CalendarIcon({ className = 'w-5 h-5' }) {
  return <Glyph className={className}>{P('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z')}</Glyph>;
}

export function ClockIcon({ className = 'w-5 h-5' }) {
  return <Glyph className={className}>{P('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')}</Glyph>;
}

export function MapPinIcon({ className = 'w-5 h-5' }) {
  return (
    <Glyph className={className}>
      {P('M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z')}
      {P('M15 11a3 3 0 11-6 0 3 3 0 016 0z')}
    </Glyph>
  );
}

export function SlidesIcon({ className = 'w-5 h-5' }) {
  return <Glyph className={className}>{P('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z')}</Glyph>;
}

export function ChevronRightIcon({ className = 'w-5 h-5' }) {
  return <Glyph className={className}>{P('M9 5l7 7-7 7')}</Glyph>;
}

export function ChevronLeftIcon({ className = 'w-5 h-5' }) {
  return <Glyph className={className}>{P('M15 19l-7-7 7-7')}</Glyph>;
}
