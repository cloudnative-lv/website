// Transliterate Cyrillic to the Latin alphabet so every CRM name is in one script.
// Latin text (including Latvian diacritics) passes through unchanged.

const MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Ukrainian / Belarusian extras
  і: 'i', ї: 'yi', є: 'ye', ґ: 'g', ў: 'u',
};

function mapChar(ch) {
  const low = ch.toLowerCase();
  const t = MAP[low];
  if (t === undefined) return ch;            // not Cyrillic — leave as-is
  if (ch === low || !t) return t;            // lowercase (or empty mapping)
  return t.charAt(0).toUpperCase() + t.slice(1); // uppercase first letter
}

export function transliterate(s) {
  return String(s ?? '').split('').map(mapChar).join('');
}

export function hasCyrillic(s) {
  return /[Ѐ-ӿ]/.test(String(s ?? ''));
}
