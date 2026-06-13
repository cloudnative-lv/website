import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const Team = lazy(() => import('./pages/Team'));
const Swag = lazy(() => import('./pages/Swag'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Speakers = lazy(() => import('./pages/Speakers'));

function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-pink-light" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/team" element={<Team />} />
                <Route path="/swag" element={<Swag />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/speakers" element={<Speakers />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App
