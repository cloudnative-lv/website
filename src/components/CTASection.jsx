export default function CTASection({ title, description, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-2xl font-black text-burgundy mb-4">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>
      )}
      {children}
    </div>
  );
}
