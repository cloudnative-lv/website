const toolIcons = [
  { name: 'kubernetes', src: '/images/tools/k8s.svg' },
  { name: 'helm', src: '/images/tools/helm.svg' },
  { name: 'prometheus', src: '/images/tools/prometheus.svg' },
  { name: 'istio', src: '/images/tools/istio.svg' },
  { name: 'etcd', src: '/images/tools/etcd.svg' },
  { name: 'fluentd', src: '/images/tools/fluentd.svg' },
  { name: 'kyverno', src: '/images/tools/kyverno.svg' }
];

const floatingElements = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  icon: toolIcons[i % toolIcons.length],
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
        <img
          key={el.id}
          src={el.icon.src}
          alt={el.icon.name}
          className="absolute animate-float"
          style={{
            width: el.size,
            height: el.size,
            left: `${el.left}%`,
            top: `${el.top}%`,
            opacity: el.opacity,
            animationDuration: `${el.duration}s`,
            animationDelay: `${el.delay}s`
          }}
        />
      ))}
    </div>
  );
}
