import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { useLanguage } from '../i18n/useLanguage';

// Set VITE_FEEDBACK_ENDPOINT (a Cloudflare feedback Worker URL) to collect
// responses into R2. Unlisted page — reached only by the per-event QR.
const ENDPOINT = import.meta.env.VITE_FEEDBACK_ENDPOINT;

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const event = getEventBySlug(slug);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
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

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setStatus('loading');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ event: event.slug, rating: String(rating), comment, hp }),
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
      <PageHeader title={t('feedback.title')} subtitle={event.title} />
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!ENDPOINT ? (
            <p className="text-center text-gray-600">{t('feedback.notEnabled')}</p>
          ) : status === 'success' ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-green-600">{t('feedback.thanks')}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <p className="mb-2 font-semibold text-burgundy">{t('feedback.rating')}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={String(n)}
                      className={`h-11 w-11 rounded-full text-lg font-bold transition-colors ${rating >= n ? 'bg-pink text-white' : 'bg-rose-50 text-pink hover:bg-rose-100'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="mb-2 block font-semibold text-burgundy">{t('feedback.comment')}</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-colors focus:border-pink focus:outline-none"
                />
              </div>
              <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {status === 'error' && <p className="text-sm text-red-600">{t('feedback.error')}</p>}
              <button
                type="submit"
                disabled={!rating || status === 'loading'}
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
