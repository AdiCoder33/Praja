import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useEffect } from 'react';
import { sampleFIRs } from '../data/sampleFirs';
import { generateSummary } from '../utils/groq';
import { TRANSLATION_LANGUAGES, translateWithGroq } from '../utils/translate';
import { speakText, stopSpeech } from '../utils/tts';

export default function AISummary() {
  const [selectedId, setSelectedId] = useState<string | null>(sampleFIRs[0]?.id || null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [translatedSummary, setTranslatedSummary] = useState<string>('');
  const [translating, setTranslating] = useState(false);

  const selected = useMemo(() => sampleFIRs.find((f) => f.id === selectedId) || null, [selectedId]);

  const handleSummarize = async () => {
    if (!selected) return;
    setLoading(true);
    setTranslatedSummary('');
    try {
      const userText = `${selected.title}. ${selected.summary}`;
      const summary = await generateSummary(userText);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
      setAiSummary('Unable to generate AI summary right now.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayEnglish = () => {
    if (aiSummary) {
      speakText(aiSummary, 'en');
    }
  };

  const handleStopSpeech = () => {
    stopSpeech();
  };

  const handlePlayTranslated = () => {
    if (translatedSummary) {
      speakText(translatedSummary, targetLang);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleTranslate = async () => {
    if (!aiSummary) {
      setTranslatedSummary('Generate the English summary first, then translate.');
      return;
    }
    setTranslating(true);
    try {
      const translated = await translateWithGroq(aiSummary, targetLang);
      setTranslatedSummary(translated);
    } catch (e) {
      console.error(e);
      setTranslatedSummary('Unable to translate right now.');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="officer-layout">
      <Sidebar />
      <main className="officer-main">
        <header className="hero-header">
          <div>
            <div className="hero-title">AI Summary</div>
            <div className="hero-sub">Generate a structured FIR summary in English, then translate it into 10+ languages.</div>
          </div>
          <button className="primary-btn" onClick={handleSummarize} disabled={!selected || loading}>
            {loading ? 'Summarizing…' : 'Summarize'}
          </button>
        </header>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 0.9fr' }}>
          <div className="glass-card fir-list-card" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>All FIRs (with IDs)</h3>
            <div className="fir-list">
              {sampleFIRs.map((f) => (
                <div
                  key={f.id}
                  className={`fir-card ${selectedId === f.id ? 'active-card' : ''}`}
                  style={{ gridTemplateColumns: '1fr auto', cursor: 'pointer' }}
                  onClick={() => setSelectedId(f.id)}
                >
                  <div className="fir-card-main">
                    <div className="fir-title">#{f.id} · {f.title}</div>
                    <div className="fir-meta">{f.category} · {f.date}</div>
                    <div className="fir-summary">{f.summary}</div>
                    <div className="fir-tags">
                      <span className={`pill ${f.status === 'Pending' ? 'pill-amber' : 'pill-green'}`}>{f.status}</span>
                      <span className={`pill ${f.priority === 'High' ? 'pill-rose' : f.priority === 'Medium' ? 'pill-amber' : 'pill-sky'}`}>{f.priority}</span>
                    </div>
                  </div>
                  <div className="pill pill-sky">ID {f.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ minHeight: '200px', display: 'grid', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Selected FIR</h3>
            {selected ? (
              <>
                <div className="fir-title">#{selected.id} · {selected.title}</div>
                <div className="fir-meta">{selected.category} · {selected.date}</div>
                <div className="fir-meta">Place: {selected.place}</div>
                <div className="fir-meta">Complainant: {selected.complainant}</div>
                <div className="fir-summary">{selected.summary}</div>
                <div className="fir-tags">
                  <span className={`pill ${selected.status === 'Pending' ? 'pill-amber' : 'pill-green'}`}>{selected.status}</span>
                  <span className={`pill ${selected.priority === 'High' ? 'pill-rose' : selected.priority === 'Medium' ? 'pill-amber' : 'pill-sky'}`}>{selected.priority}</span>
                </div>
                <div className="glass-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="fir-meta">AI Summary (English)</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="primary-btn" style={{ background: '#e2e8f0', color: '#0f172a' }} onClick={handlePlayEnglish} disabled={!aiSummary}>
                        Play
                      </button>
                      <button className="primary-btn" style={{ background: '#fca5a5', color: '#0f172a' }} onClick={handleStopSpeech}>
                        Stop
                      </button>
                      <button className="primary-btn" onClick={handleSummarize} disabled={loading}>
                        {loading ? 'Summarizing…' : 'Summarize'}
                      </button>
                    </div>
                  </div>
                  <div className="fir-summary" style={{ whiteSpace: 'pre-wrap' }}>
                    {aiSummary || 'Click Summarize to generate an AI summary.'}
                  </div>
                </div>

                <div className="glass-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div className="fir-meta">Translation</div>
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', minWidth: '140px' }}
                      >
                        {TRANSLATION_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="primary-btn" onClick={handleTranslate} disabled={translating || !aiSummary}>
                      {translating ? 'Translating…' : 'Translate'}
                    </button>
                  </div>
                  <div className="fir-summary" style={{ whiteSpace: 'pre-wrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{translatedSummary || 'Generate the English summary, pick a language, and translate.'}</span>
                      <button className="primary-btn" style={{ background: '#e2e8f0', color: '#0f172a' }} onClick={handlePlayTranslated} disabled={!translatedSummary}>
                        Play
                      </button>
                      <button className="primary-btn" style={{ background: '#fca5a5', color: '#0f172a' }} onClick={handleStopSpeech}>
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="fir-meta">Select a FIR to preview.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
