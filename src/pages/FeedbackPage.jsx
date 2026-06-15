import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { WebPageJsonLd } from '../components/JsonLd';
import { useLanguage } from '../i18n/useLanguage';

const ENDPOINT = 'https://feedback.cloudnative.lv';

// One 1–5 linear-scale question with min/max captions. Single-select; clicking
// the selected value again clears it (every question is optional).
function Rating({ q, min, max, value, onChange }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-burgundy">{q}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="w-full text-xs text-gray-500 sm:w-32 sm:text-right">{min}</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(value === n ? 0 : n)}
              aria-label={String(n)}
              aria-pressed={value === n}
              className={`h-11 w-11 rounded-full text-lg font-bold transition-colors ${value === n ? 'bg-pink text-white' : 'bg-rose-50 text-pink hover:bg-rose-100'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="w-full text-xs text-gray-500 sm:w-32">{max}</span>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const event = getEventBySlug(slug);
  const [overall, setOverall] = useState(0);
  const [talks, setTalks] = useState(0);
  const [organization, setOrganization] = useState(0);
  const [topics, setTopics] = useState('');
  const [comments, setComments] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState('idle');

  if (event && event.slug !== slug) {
    return <Navigate to={`/events/${event.slug}/feedback`} replace />;
  }
  if (!event) {
    return (
      <div className="min-h-screen bg-pink-light flex items-center justify-center px-4">
        <SEO title="Feedback" path={`/events/${slug}/feedback`} noindex />
        <p className="text-gray-600">
          {t('eventDetail.notFound')}{' '}
          <Link to="/events" className="text-pink underline">{t('eventDetail.backToEvents')}</Link>
        </p>
      </div>
    );
  }

  const hasAny = overall || talks || organization || topics.trim() || comments.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!hasAny) return;
    setStatus('loading');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          event: event.slug,
          overall: overall ? String(overall) : '',
          talks: talks ? String(talks) : '',
          organization: organization ? String(organization) : '',
          topics,
          comments,
          hp,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-pink-light">
      <SEO title={`Feedback — ${event.title}`} description="Share your feedback on the event." path={`/events/${event.slug}/feedback`} noindex />
      <WebPageJsonLd title={`Feedback - ${event.title}`} description="Share your feedback on the event." path={`/events/${event.slug}/feedback`} />
      <PageHeader title={t('feedback.title')} subtitle={event.title} />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {status === 'success' ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-green-600">{t('feedback.thanks')}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-7">
              <p className="text-sm text-gray-600">{t('feedback.intro')}</p>
              <Rating q={t('feedback.overall.q')} min={t('feedback.overall.min')} max={t('feedback.overall.max')} value={overall} onChange={setOverall} />
              <Rating q={t('feedback.talks.q')} min={t('feedback.talks.min')} max={t('feedback.talks.max')} value={talks} onChange={setTalks} />
              <Rating q={t('feedback.organization.q')} min={t('feedback.organization.min')} max={t('feedback.organization.max')} value={organization} onChange={setOrganization} />
              <div>
                <label htmlFor="topics" className="mb-2 block font-semibold text-burgundy">{t('feedback.topics')}</label>
                <textarea
                  id="topics"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-pink focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="comments" className="mb-2 block font-semibold text-burgundy">{t('feedback.comments')}</label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-pink focus:outline-none"
                />
              </div>
              <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {status === 'error' && <p className="text-sm text-red-600">{t('feedback.error')}</p>}
              <button
                type="submit"
                disabled={!hasAny || status === 'loading'}
                className="w-full rounded-xl bg-pink py-3 font-semibold text-white transition-all hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'loading' ? t('feedback.sending') : t('feedback.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
