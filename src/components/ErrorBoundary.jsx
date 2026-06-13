import { Component } from 'react';

const RELOADED_AT_KEY = 'cnlv-chunk-reloaded-at';

// Route chunks are content-hashed, so after a redeploy an open tab's next
// navigation can request a chunk that no longer exists on GitHub Pages.
// Reload once to pick up the new build; rate-limited so a genuinely broken
// network can't cause a reload loop. Other render errors get a manual fallback.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    const isStaleChunk = /dynamically imported module|importing a module script failed|Loading chunk/i.test(
      String(error)
    );
    const lastReload = Number(sessionStorage.getItem(RELOADED_AT_KEY)) || 0;
    if (isStaleChunk && Date.now() - lastReload > 30_000) {
      sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()));
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      // Rendered outside LanguageProvider's reach in the worst case, so the
      // copy is statically bilingual instead of using t().
      return (
        <div className="min-h-screen bg-pink-light flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-burgundy mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">Kaut kas nogāja greizi</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-500 transition-all shadow-lg"
            >
              Reload / Pārlādēt
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
