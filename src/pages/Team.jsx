import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import { LinkedInIcon, TwitterIcon, SocialLink } from '../components/SocialIcons';

const team = [
  {
    name: "Linda Austra Ārende",
    role: "Platform Engineer",
    bio: "Platform engineer passionate about Kubernetes, policy-as-code, and building secure cloud native platforms.",
    image: "/images/team/linda-arende.png",
    social: {
      linkedin: "https://www.linkedin.com/in/lindaarende/",
      twitter: null
    }
  },
  {
    name: "Andrey Adamovich",
    role: "Fractional CTO, Trainer",
    bio: "Cloud native enthusiast and community builder. Helping bring the cloud native community together in Latvia.",
    image: "/images/team/andrey-adamovich.png",
    social: {
      linkedin: "https://www.linkedin.com/in/andreysadamovich/",
      twitter: "https://x.com/codingandrey"
    }
  }
];

export default function Team() {
  return (
    <div className="min-h-screen bg-pink-light">
      <PageHeader 
        title="Our Team" 
        subtitle="The people behind Cloud Native Latvia"
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square bg-pink-light flex items-center justify-center">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-rose-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-burgundy">{member.name}</h3>
                <p className="text-pink font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <div className="flex gap-3">
                  {member.social.linkedin && (
                    <SocialLink href={member.social.linkedin} icon={<LinkedInIcon />} title="LinkedIn" />
                  )}
                  {member.social.twitter && (
                    <SocialLink href={member.social.twitter} icon={<TwitterIcon />} title="X/Twitter" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <CTASection
            title="Join the Team"
            description="Interested in helping organize Cloud Native Latvia? We're always looking for volunteers!"
          >
            <Button href="mailto:hello@cloudnative.lv">Contact Us</Button>
          </CTASection>
        </div>
      </div>
    </div>
  );
}
