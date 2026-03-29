// Browser TTS helper using the Web Speech API
// Supports best-effort voices for the languages we expose

const VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ml: 'ml-IN',
  ur: 'ur-IN',
};

export function speakText(text: string, lang: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = VOICE_MAP[lang] || 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  // Try to pick a voice matching lang
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang === utterance.lang);
  if (match) utterance.voice = match;

  window.speechSynthesis.cancel(); // stop any current speech
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}
