import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';

export default function ComplaintPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="complaint-page">
      <header className="complaint-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
        <h1>🎤 AI Voice FIR Assistant</h1>
      </header>

      <VoiceAssistant language={language} />
    </div>
  );
}
