// Platform glyphs for the deck "How to connect?" slide, as plain SVG so both the
// HTML deck (inline markup) and the PPTX deck (rasterised to PNG via canvas) can
// reuse one source. Path data mirrors src/components/SocialIcons.jsx.

// Filled icons: inner path markup, recoloured via the wrapper's `fill`.
// (CNCF is the OCG / community.cncf.io community hub glyph — two paths.)
export const FILLED_ICONS = {
  cncf: {
    viewBox: '5.52 5.02 388.71 388.96',
    inner: '<path opacity=".75" d="M66.5 333.2v-71.3H13v124.7h124.7v-53.4H66.5zm267.1-70.9v70.9h-70.9l-.3-.4v53.8H387V261.9h-53.8l.4.4zM66.5 136.9V66h70.8l.4.4V12.6H13v124.7h53.9l-.4-.4zM262.4 12.6V66h71.2v71.3H387V12.6H262.4z"/><path d="M208.5 137.3h47.3L184.5 66h77.9V12.6H137.7v53.8l70.8 70.9zm18.4 160l-35.4-35.4h-47.2l59 59.1 12.2 12.2h-77.8v53.4h124.7v-53.8l-35.5-35.5zm106.7-106.6v24.4l-12.2-12.2-59-59v47.2l35.4 35.4 35.4 35.4H387V137.3h-53.4v53.4zm-267.1-6.6l71.2 71.2v-47.2l-70.8-70.8H13v124.6h53.5v-77.8z"/>',
  },
  linkedin: {
    viewBox: '0 0 24 24',
    inner: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
  bluesky: {
    viewBox: '0 0 24 24',
    inner: '<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>',
  },
  eventbrite: {
    viewBox: '0 0 220 266',
    inner: '<path d="M200.96 178.528L112.891 109.904C111.431 108.776 112.957 106.519 114.55 107.449L148.928 126.695C164.524 135.456 184.236 130.345 193.66 115.214C203.615 99.2191 198.372 78.1806 182.045 68.7565L131.606 39.6213C130.013 38.6921 131.208 36.2365 132.934 36.9666L156.096 46.258C156.162 46.258 156.693 46.4571 156.892 46.5235C159.348 47.3862 162.003 47.8508 164.724 47.8508C177.267 47.8508 187.62 37.8957 188.483 26.0823C189.611 10.6851 177.931 0 163.927 0H56.8104C43.0724 0 31.4581 11.2161 31.6572 24.9541C31.7236 32.2545 35.0419 38.7585 40.1522 43.2051C44.0015 46.5898 57.0095 56.9431 63.1816 61.9207C64.3099 62.7834 63.6462 64.5754 62.2525 64.5754H40.8159C18.251 64.7081 0 83.0255 0 105.59C0 117.006 4.64571 127.292 12.2116 134.792L136.385 252.793C145.145 260.956 156.959 266 169.9 266C197.111 266 219.145 243.966 219.145 216.756C219.078 201.358 212.043 187.554 200.96 178.528Z"/>',
  },
};

// Email envelope is a stroked (outline) icon, recoloured via `stroke`.
export const EMAIL_ICON = {
  viewBox: '0 0 24 24',
  path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

// Inline SVG markup for a filled platform icon at the given colour.
export function filledIconSvg(key, color, size = '1em') {
  const i = FILLED_ICONS[key];
  if (!i) return '';
  return `<svg viewBox="${i.viewBox}" width="${size}" height="${size}" fill="${color}" xmlns="http://www.w3.org/2000/svg">${i.inner}</svg>`;
}

// Inline SVG markup for the stroked email icon.
export function emailIconSvg(color, size = '1em') {
  return `<svg viewBox="${EMAIL_ICON.viewBox}" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="${EMAIL_ICON.path}"/></svg>`;
}
