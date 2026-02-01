import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle GitHub Pages SPA redirect
const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  const url = new URL(redirect);
  window.history.replaceState(null, null, url.pathname + url.search + url.hash);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
