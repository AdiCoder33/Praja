import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';
import OfficerModel from '../components/OfficerModel';
import Navbar from '../components/Navbar';

export default function ComplaintPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [showAssistant, setShowAssistant] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const startComplaint = (lang: 'en' | 'te' | 'hi') => {
    setLanguage(lang);
    setShowAssistant(true);
  };

  const handleRestart = () => {
    setResetCounter(prev => prev + 1);
  };

  if (!showAssistant) {
    return (
      <div className="language-selection-page">
        <div className="language-modal">
          <h2>Select Your Preferred Language</h2>
          <p>మీకు నచ్చిన భాషను ఎంచుకోండి / आपकी पसंदीदा भाषा चुनें</p>
          <div className="language-options">
            <button onClick={() => startComplaint('en')} className="lang-btn">
              <span className="flag">🇬🇧</span> English
            </button>
            <button onClick={() => startComplaint('te')} className="lang-btn">
              <span className="flag">🇮🇳</span> తెలుగు
            </button>
            <button onClick={() => startComplaint('hi')} className="lang-btn">
              <span className="flag">🇮🇳</span> हिंदी
            </button>
          </div>
          <button onClick={() => navigate('/')} className="back-link">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-page">
      <Navbar
        onRestart={handleRestart}
        language={language}
        onLanguageChange={setLanguage}
        brandTitle="Praja FIR"
        brandIcon="/police_logo_v4.png"
      />
      
      <div className="header-separator"></div>

      <main className="complaint-main-layout">
        <div className="matter-side">
          <VoiceAssistant language={language} resetCounter={resetCounter} />
        </div>
        <div className="model-side">
          <OfficerModel />
        </div>
      </main>
    </div>
  );
}
