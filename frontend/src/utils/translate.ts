export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'hi', label: 'Hindi' },
];

// Mock translation; in phase 2 replace with real service
export function translateText(text: string, lang: string) {
  if (!text) return '';
  if (lang === 'en') return text;
  return `${text} [${lang} mock]`;
}
