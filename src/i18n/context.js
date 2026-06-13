import { createContext } from 'react';

// Lives in its own module (no component exports) so LanguageContext.jsx and
// useLanguage.js both stay Fast Refresh compatible.
export const LanguageContext = createContext();
