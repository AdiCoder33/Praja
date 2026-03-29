import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceAssistant from '../components/VoiceAssistant';

export default function ComplaintPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
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

  return (
    <div className="complaint-page">
      <header className="complaint-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => navigate('/')} className="back-button">
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
      </header>

      <VoiceAssistant language={language} />
    </div>
  );
}
