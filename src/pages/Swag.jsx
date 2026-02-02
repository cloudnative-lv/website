import SEO from '../components/SEO';
import { ProductListJsonLd } from '../components/JsonLd';
import PageHeader from '../components/PageHeader';
import FeatureCard from '../components/FeatureCard';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import { Container, Section, SectionHeading } from '../components/layout';

const stickers = [
  {
    id: 1,
    name: "Breaking Through Cognitive Load - Linda",
    description: "Linda breaking through cognitive load barriers with Kubernetes, Prometheus, and Knative icons.",
    image: "/images/stickers/sticker_linda.svg"
  },
  {
    id: 2,
    name: "Breaking Through Cognitive Load - Andrey",
    description: "Andrey breaking through with Kubernetes, Prometheus, and Knative tools flying around.",
    image: "/images/stickers/sticker_andrey.svg"
  },
  {
    id: 3,
    name: "Cloud Tech",
    description: "Cute kawaii cloud mascot surrounded by CNCF tools: Kubernetes, Helm, Prometheus, Argo, Istio, and more.",
    image: "/images/stickers/sticker_cloud_tech.svg"
  },
  {
    id: 4,
    name: "Navigating CNCF Landscape",
    description: "Friendly cloud reading the CNCF landscape map - because we all need a guide!",
    image: "/images/stickers/sticker_cncf_landscape.svg"
  },
  {
    id: 5,
    name: "Navigating Clouds",
    description: "Cloud Native Latvia themed sticker for the cloud native explorer.",
    image: "/images/stickers/sticker_navigating_clouds.svg"
  },
  {
    id: 6,
    name: "Cloud Native Latvia Logo",
    description: "Our official logo sticker featuring the cloud cube design in rose/burgundy colors.",
    image: "/images/stickers/sticker_cn_lv.svg"
  }
];

const swagMethods = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Attend Meetups",
    description: "Free stickers available at every meetup event"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Speak at Events",
    description: "Speakers receive exclusive swag packs"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Help Organize",
    description: "Volunteers get special edition items"
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
      <ProductListJsonLd products={stickers} pageName="Cloud Native Latvia Swag & Stickers" />
      <PageHeader 
        title="Swag & Stickers"
        subtitle="Show your Cloud Native Latvia pride!"
      />

      <Container className="py-12">
        <Section>
          <SectionHeading>Stickers</SectionHeading>
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
        </Section>

        <Section>
          <SectionHeading>Merchandise</SectionHeading>
          <p className="text-gray-600 mb-8">
            Show your Cloud Native Latvia pride with our branded merchandise!
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-rose-50 flex items-center justify-center">
                <img src="/images/swag/cup.png" alt="Cloud Native Latvia Cup" className="w-full h-full object-contain p-4" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-burgundy mb-2">Cloud Native Latvia Cup</h3>
                <p className="text-gray-600">Stay caffeinated while navigating the CNCF landscape with our branded cup.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SectionHeading>How to Get Swag</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6">
            {swagMethods.map((method, idx) => (
              <FeatureCard key={idx} icon={method.icon} title={method.title} description={method.description} />
            ))}
          </div>
        </Section>

        <CTASection
          title="Want Custom Swag?"
          description="If you're interested in sponsoring swag for our events, we'd love to hear from you!"
        >
          <Button href="mailto:hello@cloudnative.lv">Contact Us About Sponsorship</Button>
        </CTASection>
      </Container>
    </div>
  );
}
