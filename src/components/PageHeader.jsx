export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="bg-gradient-to-r from-rose-400 to-rose-700 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black mb-4">{title}</h1>
        {subtitle && (
          <p className="text-xl text-white/90 max-w-2xl">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
