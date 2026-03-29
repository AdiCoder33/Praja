import { getGroqApiKey } from './groq';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'Telugu' },
  { code: 'hi', label: 'Hindi' },
];

// Extended set for FIR summary translation
export const TRANSLATION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'te', label: 'Telugu' },
  { code: 'ta', label: 'Tamil' },
  { code: 'kn', label: 'Kannada' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'ur', label: 'Urdu' },
];
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Mock translation; in phase 2 replace with real service
export function translateText(text: string, lang: string) {
  if (!text) return '';
  if (lang === 'en') return text;
  return `${text} [${lang} mock]`;
}

// Groq-powered translation for FIR summaries; preserves labels and structure
export async function translateWithGroq(text: string, lang: string): Promise<string> {
  if (!text) return '';
  if (lang === 'en') return text;

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    console.warn('Groq API key missing (set VITE_GROQ_API_KEY in frontend env)');
    return `${text} [${lang} mock]`;
  }

  const languageName = TRANSLATION_LANGUAGES.find((l) => l.code === lang)?.label || lang;
  const systemPrompt = `You are a translator for police FIR summaries. Translate the user's English FIR summary into ${languageName}. Preserve all labels/bullets and numbers. Do not add explanations or extra notes. Keep the structure and line breaks identical to the input. Respond with only the translated text.`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 360,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Groq translation error', res.status, body);
      return `${text} [${lang} fallback]`;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || `${text} [${lang} fallback]`;
  } catch (err) {
    console.error('Groq translation exception', err);
    return `${text} [${lang} fallback]`;
  }
}
