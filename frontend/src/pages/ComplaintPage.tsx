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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Get conversation history from window object
      const history = (window as any).conversationHistory || [];

      console.log('Conversation history:', history);
      console.log('History length:', history.length);

      if (history.length === 0) {
        alert('Please have a conversation first before generating PDF.\n\nMake sure to send at least one message in the chat.');
        setIsGenerating(false);
        return;
      }

      // Call the API to generate PDF
      const response = await fetch('/api/fir/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history,
          language: language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'te-IN'
        })
      });

      const data = await response.json();

      if (data.status === 'success' && data.pdf_filename) {
        // Download the PDF
        window.open(`/api/fir/download/${data.pdf_filename}`, '_blank');

        // Show success message
        const message = data.complete
          ? '✅ Complete FIR PDF Generated!'
          : '⚠️ PDF Generated (Some fields may be incomplete)';
        alert(message);
      } else {
        throw new Error(data.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <h1>🎤 AI Voice FIR Assistant</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                color: 'white',
                borderRadius: '20px',
                cursor: isGenerating ? 'wait' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                opacity: isGenerating ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#667eea';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                }
              }}
            >
              {isGenerating ? '⏳ Generating...' : '📄 Generate PDF'}
            </button>
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '12px',
          alignItems: 'center',
          padding: '12px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          style={{
            padding: '10px 18px',
            background: '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: isGenerating ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(30,58,138,0.18)',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 14px 34px rgba(30,58,138,0.28)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isGenerating) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(30,58,138,0.18)';
            }
          }}
        >
          {isGenerating ? '⏳ Generating...' : '📄 Generate PDF'}
        </button>

        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          Tip: finish the chat, then tap Generate PDF to download your FIR report.
        </div>
      </div>

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
