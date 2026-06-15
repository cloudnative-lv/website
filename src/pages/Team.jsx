import PageHeader from '../components/PageHeader';
import CTASection from '../components/CTASection';
import Button from '../components/Button';
import SEO from '../components/SEO';
import SpeakerAvatar from '../components/SpeakerAvatar';
import { TeamPageJsonLd } from '../components/JsonLd';
import { LinkedInIcon, TwitterIcon, SocialLink } from '../components/SocialIcons';
import { useLanguage } from '../i18n/useLanguage';

// Headshots live in public/images/team/ (<key>.jpg). A missing photo falls back
// to a brand-colored initials avatar, same as speakers without a photo.
const teamConfigs = [
  {
    key: 'linda',
    name: 'Linda Austra Ārende',
    photo: '/images/team/linda.jpg',
    ring: 'ring-rose-100',
    social: {
      linkedin: 'https://www.linkedin.com/in/lindaarende/',
      twitter: null
    }
  },
  {
    key: 'andrey',
    name: 'Andrey Adamovich',
    photo: '/images/team/andrey.jpg',
    ring: 'ring-burgundy',
    social: {
      linkedin: 'https://www.linkedin.com/in/andreyadamovich/',
      twitter: 'https://x.com/codingandrey'
    }
  }
];

export default function Team() {
  const { t } = useLanguage();

  const team = teamConfigs.map(m => ({
    ...m,
    role: t(`team.members.${m.key}.role`),
    bio: t(`team.members.${m.key}.bio`)
  }));

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO
        title="Team - Cloud Native Latvia Organizers"
        description="Meet the organizers behind Cloud Native Latvia. Platform engineers and DevOps enthusiasts building the Kubernetes and cloud native community in Riga."
        keywords={['Cloud Native Latvia team', 'meetup organizers Riga', 'platform engineers Latvia']}
        path="/team"
        image="/images/og/team.png"
      />
      <TeamPageJsonLd members={team} />
      <PageHeader
        title={t('team.title')}
        subtitle={t('team.subtitle')}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <SpeakerAvatar
                name={member.name}
                photo={member.photo}
                className={`w-32 h-32 text-3xl shrink-0 ring-4 ${member.ring}`}
              />
              <h3 className="mt-5 text-xl font-bold text-burgundy">{member.name}</h3>
              <p className="text-pink font-semibold">{member.role}</p>
              <p className="mt-3 text-gray-600">{member.bio}</p>
              <div className="mt-4 flex gap-3">
                {member.social.linkedin && (
                  <SocialLink href={member.social.linkedin} icon={<LinkedInIcon />} title="LinkedIn" />
                )}
                {member.social.twitter && (
                  <SocialLink href={member.social.twitter} icon={<TwitterIcon />} title="X/Twitter" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <CTASection
            title={t('team.cta.title')}
            description={t('team.cta.description')}
          >
            <Button href="mailto:hello@cloudnative.lv?subject=Hello from cloudnative.lv">{t('team.cta.contact')}</Button>
          </CTASection>
        </div>
      </div>
    </div>
  );
}
