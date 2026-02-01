export default function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`mb-16 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ children, className = '' }) {
  return (
    <h2 className={`text-2xl font-black text-burgundy mb-6 ${className}`}>
      {children}
    </h2>
  );
}
