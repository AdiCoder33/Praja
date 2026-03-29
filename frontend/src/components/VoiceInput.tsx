import { useState } from 'react';

interface Props {
  onTranscript: (text: string) => void;
  language: string;
}

const mockSamples: Record<string, string[]> = {
  en: ['My bike was stolen near the market', 'There was an attack near my home'],
  te: ['నా బైక్ దొంగిలించబడింది', 'ఎవరైనా నన్ను దాడి చేశారు'],
  hi: ['मेरा मोबाइल चोरी हो गया', 'किसी ने मुझ पर हमला किया'],
  ta: ['என் பைக் திருடப்பட்டது', 'யாரோ என்மேல் தாக்குதல் நடத்தினர்'],
  kn: ['ನನ್ನ ಬೈಕ್ ಕಳವಾಗಿತು', 'ಯಾರೋ ನನ್ನ ಮೇಲೆ ದಾಳಿ ಮಾಡಿದ್ದಾರೆ'],
};

export default function VoiceInput({ onTranscript, language }: Props) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'done'>('idle');

  const simulateListen = () => {
    setStatus('listening');
    setTimeout(() => {
      const bucket = mockSamples[language] || mockSamples.en;
      const sample = bucket[Math.floor(Math.random() * bucket.length)];
      onTranscript(sample);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1200);
    }, 900);
  };

  return (
    <button
      type="button"
      onClick={simulateListen}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
    >
      <span className="text-lg">🎤</span>
      {status === 'idle' && 'Voice Input'}
      {status === 'listening' && 'Listening...'}
      {status === 'done' && 'Captured'}
    </button>
  );
}
