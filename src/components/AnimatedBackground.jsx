const cncfLogos = [
  // Kubernetes wheel
  {
    name: 'kubernetes',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 0L2 8v16l14 8 14-8V8L16 0zm0 2.5l11.5 6.6v13.2L16 29l-11.5-6.7V9.1L16 2.5zm0 4.3l-7.5 4.3v8.6l7.5 4.3 7.5-4.3v-8.6L16 6.8zm0 2.5l4.5 2.6v5.2L16 19.7l-4.5-2.6v-5.2L16 9.3z"/>
      </svg>
    )
  },
  // Helm wheel
  {
    name: 'helm',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="14" strokeWidth="2" stroke="currentColor" fill="none"/>
        <circle cx="16" cy="16" r="4"/>
        <line x1="16" y1="2" x2="16" y2="8" strokeWidth="2" stroke="currentColor"/>
        <line x1="16" y1="24" x2="16" y2="30" strokeWidth="2" stroke="currentColor"/>
        <line x1="2" y1="16" x2="8" y2="16" strokeWidth="2" stroke="currentColor"/>
        <line x1="24" y1="16" x2="30" y2="16" strokeWidth="2" stroke="currentColor"/>
      </svg>
    )
  },
  // Prometheus flame
  {
    name: 'prometheus',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 2c-1.5 3-2 6-2 8 0 3 1 5 2 7-1-2-3-4-3-7 0-2 1-5 3-8zm-6 8c0 4 2 7 4 9-2-1-5-3-5-7 0-3 1-5 1-2zm12 0c0 4-2 7-4 9 2-1 5-3 5-7 0-3-1-5-1-2zm-6 12c-4 0-8-2-8-6h16c0 4-4 6-8 6zm0 4c-2 0-4-1-4-2h8c0 1-2 2-4 2zm0 4c-1 0-2 0-2-1h4c0 1-1 1-2 1z"/>
      </svg>
    )
  },
  // Container/Docker cube
  {
    name: 'container',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <rect x="4" y="12" width="6" height="6" rx="1"/>
        <rect x="13" y="12" width="6" height="6" rx="1"/>
        <rect x="22" y="12" width="6" height="6" rx="1"/>
        <rect x="4" y="4" width="6" height="6" rx="1"/>
        <rect x="13" y="4" width="6" height="6" rx="1"/>
        <rect x="13" y="20" width="6" height="6" rx="1"/>
      </svg>
    )
  },
  // Cloud
  {
    name: 'cloud',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M25 14c0-4-3-7-7-7-3 0-5 2-6 4-3 0-6 3-6 6s3 6 6 6h13c3 0 5-2 5-5s-2-4-5-4z"/>
      </svg>
    )
  },
  // Network/mesh
  {
    name: 'mesh',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="24" cy="8" r="3"/>
        <circle cx="8" cy="24" r="3"/>
        <circle cx="24" cy="24" r="3"/>
        <circle cx="16" cy="16" r="4"/>
        <line x1="10" y1="10" x2="14" y2="14" strokeWidth="2" stroke="currentColor"/>
        <line x1="22" y1="10" x2="18" y2="14" strokeWidth="2" stroke="currentColor"/>
        <line x1="10" y1="22" x2="14" y2="18" strokeWidth="2" stroke="currentColor"/>
        <line x1="22" y1="22" x2="18" y2="18" strokeWidth="2" stroke="currentColor"/>
      </svg>
    )
  },
  // Hexagon (generic tech)
  {
    name: 'hexagon',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 2L4 9v14l12 7 12-7V9L16 2zm0 4l8 4.6v9.2L16 24.4l-8-4.6v-9.2L16 6z"/>
      </svg>
    )
  },
  // Gear/settings
  {
    name: 'gear',
    svg: (
      <svg viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm0 9a3 3 0 110-6 3 3 0 010 6z"/>
        <path d="M27 14h-2c-.3-1-.7-2-1.2-2.8l1.4-1.4-2.8-2.8-1.4 1.4c-.8-.5-1.8-.9-2.8-1.2V5h-4v2.2c-1 .3-2 .7-2.8 1.2l-1.4-1.4-2.8 2.8 1.4 1.4c-.5.8-.9 1.8-1.2 2.8H5v4h2.2c.3 1 .7 2 1.2 2.8l-1.4 1.4 2.8 2.8 1.4-1.4c.8.5 1.8.9 2.8 1.2V27h4v-2.2c1-.3 2-.7 2.8-1.2l1.4 1.4 2.8-2.8-1.4-1.4c.5-.8.9-1.8 1.2-2.8H27v-4z"/>
      </svg>
    )
  }
];

const floatingElements = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  logo: cncfLogos[i % cncfLogos.length],
  size: 20 + Math.random() * 40,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * -20,
  opacity: 0.05 + Math.random() * 0.1
}));

export default function AnimatedBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {floatingElements.map((el) => (
        <div
          key={el.id}
          className="absolute text-pink animate-float"
          style={{
            width: el.size,
            height: el.size,
            left: `${el.left}%`,
            top: `${el.top}%`,
            opacity: el.opacity,
            animationDuration: `${el.duration}s`,
            animationDelay: `${el.delay}s`
          }}
        >
          {el.logo.svg}
        </div>
      ))}
    </div>
  );
}
