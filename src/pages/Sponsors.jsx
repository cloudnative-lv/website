import SEO from '../components/SEO';

const sponsorshipTiers = [
  {
    name: "Gold",
    price: "€1,500",
    period: "per year",
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Logo on website homepage",
      "Logo on all event materials",
      "5-minute intro at each meetup",
      "Social media shoutouts",
      "Booth/table at events",
      "6 free tickets per event",
      "Job postings in newsletter"
    ]
  },
  {
    name: "Silver",
    price: "€800",
    period: "per year",
    color: "from-gray-300 to-gray-500",
    benefits: [
      "Logo on website sponsors page",
      "Logo on event materials",
      "Social media mentions",
      "4 free tickets per event",
      "Job posting (quarterly)"
    ]
  },
  {
    name: "Bronze",
    price: "€400",
    period: "per year",
    color: "from-orange-400 to-orange-600",
    benefits: [
      "Logo on website sponsors page",
      "Mention at events",
      "2 free tickets per event"
    ]
  },
  {
    name: "Event Sponsor",
    price: "€300",
    period: "per event",
    color: "from-rose-400 to-rose-700",
    benefits: [
      "Logo at specific event",
      "5-minute intro at event",
      "Social media promotion",
      "4 free tickets",
      "Swag distribution"
    ]
  }
];

const sponsorshipBenefits = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Reach Tech Talent",
    description: "Connect with cloud native engineers, DevOps specialists, and platform engineers in Latvia."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Brand Visibility",
    description: "Your brand featured across our website, events, and social media channels."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Community Engagement",
    description: "Direct interaction with the cloud native community through events and networking."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Support Open Source",
    description: "Help grow the cloud native ecosystem and open source community in Latvia."
  }
];

export default function Sponsors() {
  return (
    <div className="min-h-screen bg-pink-light">
      <SEO 
        title="Sponsor Cloud Native Latvia - Tech Community Sponsorship"
        description="Sponsor Cloud Native Latvia meetups and connect with Kubernetes, DevOps, and platform engineering professionals in Riga. Reach tech talent in the Baltic region."
        keywords={['sponsor tech event Latvia', 'IT sponsorship Riga', 'DevOps community sponsor', 'Baltic tech recruitment']}
        path="/sponsors"
        image="/images/og/sponsors.png"
      />
      <div className="bg-linear-to-r from-rose-400 to-rose-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-black mb-4">Become a Sponsor</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Support the cloud native community in Latvia and connect with talented engineers and technology leaders.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Why Sponsor */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-burgundy mb-8 text-center">Why Sponsor Cloud Native Latvia?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipBenefits.map((benefit, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-burgundy mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsorship Tiers */}
        <section className="mb-16">
          <h2 className="text-2xl font-black text-burgundy mb-8 text-center">Sponsorship Tiers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipTiers.map((tier, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`bg-linear-to-r ${tier.color} text-white p-6 text-center`}>
                  <h3 className="text-2xl font-black">{tier.name}</h3>
                  <p className="text-3xl font-bold mt-2">{tier.price}</p>
                  <p className="text-sm opacity-90">{tier.period}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Sponsorship */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-black text-burgundy mb-4">Custom Sponsorship</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Looking for something different? We're happy to discuss custom sponsorship packages 
              tailored to your organization's goals. Whether it's venue sponsorship, catering, 
              swag, or something unique - let's talk!
            </p>
            <a
              href="mailto:sponsors@cloudnative.lv"
              className="inline-block bg-pink text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-500 transition-all shadow-lg hover:shadow-xl"
            >
              Contact Us About Sponsorship
            </a>
          </div>
        </section>

        {/* Current Sponsors */}
        <section>
          <h2 className="text-2xl font-black text-burgundy mb-8 text-center">Our Sponsors</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-6">
              Be the first to support Cloud Native Latvia! Your logo could be here.
            </p>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                Your Logo
              </div>
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                Your Logo
              </div>
              <div className="w-40 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                Your Logo
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
