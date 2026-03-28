import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';

export default function ComplaintPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="complaint-page">
      <header className="complaint-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
          <h1>🎤 AI Voice FIR Assistant</h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'te' | 'hi')}
            className="language-select"
            style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#333' }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="te">🇮🇳 తెలుగు</option>
            <option value="hi">🇮🇳 हिंदी</option>
          </select>
        </div>
      </header>

      <VoiceAssistant language={language} />
    </div>
  );
}
