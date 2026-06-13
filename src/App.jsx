import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// Home is the landing route: loading it eagerly avoids a second network
// round trip and a blank Suspense fallback on the most-visited page.
import Home from './pages/Home';

// Secondary pages are code-split so each is only downloaded when first visited.
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const TalkDetail = lazy(() => import('./pages/TalkDetail'));
const Team = lazy(() => import('./pages/Team'));
const Swag = lazy(() => import('./pages/Swag'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Speakers = lazy(() => import('./pages/Speakers'));
const Privacy = lazy(() => import('./pages/Privacy'));
// Organizer "kit" routes (unlisted): download pages, manifest + screenshot target.
const KitIndex = lazy(() => import('./artifacts/KitIndex'));
const KitPage = lazy(() => import('./artifacts/KitPage'));
const KitRaw = lazy(() => import('./artifacts/KitRaw'));
const KitManifest = lazy(() => import('./artifacts/KitManifest'));

// Site chrome wrapping the public pages. The Suspense sits *inside* the layout so
// the navbar/footer stay mounted (no flicker) while a lazy page loads.
function SiteLayout() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Suspense fallback={<div className="min-h-screen bg-pink-light" />}>
          {/* Keyed by route so each navigation re-runs the fade-in animation. */}
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/events/:slug/talks/:talkSlug" element={<TalkDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/swag" element={<Swag />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>
          {/* Unlisted artifact routes (no site chrome). */}
          <Route path="/kit" element={<Suspense fallback={null}><KitIndex /></Suspense>} />
          <Route path="/kit/manifest" element={<Suspense fallback={null}><KitManifest /></Suspense>} />
          <Route path="/kit/:slug" element={<Suspense fallback={null}><KitPage /></Suspense>} />
          <Route path="/kit/:slug/raw/:variant" element={<Suspense fallback={null}><KitRaw /></Suspense>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App
