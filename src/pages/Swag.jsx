import SEO from '../components/SEO';

const stickers = [
  {
    id: 1,
    name: "Breaking Through Cognitive Load - Linda",
    description: "Linda breaking through cognitive load barriers with Kubernetes, Prometheus, and Knative icons.",
    image: "/images/stickers/cognitive-load-linda.png"
  },
  {
    id: 2,
    name: "Breaking Through Cognitive Load - Andrey",
    description: "Andrey breaking through with Kubernetes, Prometheus, and Knative tools flying around.",
    image: "/images/stickers/cognitive-load-andrey.png"
  },
  {
    id: 3,
    name: "Kawaii Cloud",
    description: "Cute kawaii cloud mascot surrounded by CNCF tools: Kubernetes, Helm, Prometheus, Argo, Istio, and more.",
    image: "/images/stickers/kawaii-cloud.png"
  },
  {
    id: 4,
    name: "Navigating CNCF Landscape",
    description: "Friendly cloud reading the CNCF landscape map - because we all need a guide!",
    image: "/images/stickers/cncf-landscape.png"
  },
  {
    id: 5,
    name: "Riga Skyline",
    description: "Cloud Native Latvia logo with beautiful Riga skyline featuring the Freedom Monument and Vanšu Bridge.",
    image: "/images/stickers/riga-skyline.png"
  },
  {
    id: 6,
    name: "Cloud Native Latvia Logo",
    description: "Our official logo sticker featuring the cloud cube design in rose/burgundy colors.",
    image: "/images/stickers/logo.png"
  }
];

export default function Swag() {
  return (
    <div className="min-h-screen bg-pink-light">
      <SEO 
        title="Swag & Stickers - Cloud Native Latvia Merchandise"
        description="Get Cloud Native Latvia stickers and swag at our meetups. Unique Kubernetes, DevOps, and CNCF-themed designs for the tech community in Riga."
        keywords={['tech stickers Latvia', 'Kubernetes swag', 'DevOps merchandise', 'CNCF stickers']}
        path="/swag"
        image="/images/og/swag.png"
      />
      <div className="bg-linear-to-r from-rose-400 to-rose-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-4">Swag & Stickers</h1>
          <p className="text-xl text-white/90">
            Show your Cloud Native Latvia pride!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-2xl font-black text-burgundy mb-6">Stickers</h2>
          <p className="text-gray-600 mb-8">
            Collect our stickers at meetup events! Each event features unique designs.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stickers.map(sticker => (
              <div key={sticker.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-rose-50 flex items-center justify-center">
                  {sticker.image ? (
                    <img src={sticker.image} alt={sticker.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-pink">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-burgundy mb-2">{sticker.name}</h3>
                  <p className="text-gray-600">{sticker.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-black text-burgundy mb-6">How to Get Swag</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-burgundy mb-2">Attend Meetups</h3>
              <p className="text-gray-600">
                Free stickers available at every meetup event
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-burgundy mb-2">Speak at Events</h3>
              <p className="text-gray-600">
                Speakers receive exclusive swag packs
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-burgundy mb-2">Help Organize</h3>
              <p className="text-gray-600">
                Volunteers get special edition items
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-black text-burgundy mb-4">Want Custom Swag?</h2>
          <p className="text-gray-600 mb-6">
            If you're interested in sponsoring swag for our events, we'd love to hear from you!
          </p>
          <a
            href="mailto:hello@cloudnative.lv"
            className="inline-block bg-pink text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-500 transition-all shadow-lg hover:shadow-xl"
          >
            Contact Us About Sponsorship
          </a>
        </section>
      </div>
    </div>
  );
}
