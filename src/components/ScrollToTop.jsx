import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router does no scroll management on client-side navigation, so following a
// link left the page at the previous scroll offset. Reset to the top on every path
// change (or scroll to the anchor when the URL carries a hash). useLayoutEffect runs
// before paint, so the new page never flashes mid-scroll.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
