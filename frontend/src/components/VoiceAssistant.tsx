import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/voice-assistant.css';

interface Message {
  text: string;
  type: 'user' | 'ai';
}

interface VoiceAssistantProps {
  onReset?: () => void;
  resetCounter?: number;
}

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export default function VoiceAssistant({ resetCounter = 0 }: VoiceAssistantProps) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAISpeakingRef = useRef(false);
  const conversationModeRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  // Store conversation history globally for PDF generation
  useEffect(() => {
    (window as any).conversationHistory = conversationHistory;
  }, [conversationHistory]);

  // Initialize/Reset messages
  useEffect(() => {
    setMessages([
      {
        text: t('complaint.initial.msg'),
        type: 'ai',
      },
    ]);
  }, [language, resetCounter, t]);

  // Update placeholder based on language/state
  useEffect(() => {
    if (!isListening && !isProcessing) {
      setPlaceholder(t('complaint.input.placeholder'));
    }
  }, [language, isListening, isProcessing, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGE_MAP[language] || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setPlaceholder('🎤 Listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      if (!event.results[0].isFinal) {
        setPlaceholder(`Hearing: "${transcript}"`);
        return;
      }

      const finalText = transcript.trim();
      if (finalText.length < 3) return;

      if (isAISpeakingRef.current) {
        stopAISpeech();
      }

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      setPendingSpeech((prev) => prev + ' ' + finalText);
      setPlaceholder(`Got: "${finalText}" - waiting 4s for more...`);

      speechTimeoutRef.current = setTimeout(() => {
        setPendingSpeech((current) => {
          if (current.trim()) {
            handleUserSpeech(current.trim());
          }
          return '';
        });
        speechTimeoutRef.current = null;
      }, 4000);
    };

    recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!conversationModeRef.current) {
        setIsListening(false);
      } else {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [language]);

  const stopAISpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isAISpeakingRef.current = false;
  };

  const restartListening = () => {
    if (conversationModeRef.current && recognitionRef.current) {
      setTimeout(() => {
        try { recognitionRef.current.start(); } catch (e) {}
      }, 1500);
    }
  };

  const stripThinkBlocks = (text: string) => (text || '').replace(/<think>[\s\S]*?<\/think>/gi, '');
  const collapseRepeats = (text: string) => (text || '').replace(/(\b[\p{L}\p{N}'-]+\b)(\s+\1)+/giu, '$1');
  const normalizeText = (text: string) => {
    const noThink = stripThinkBlocks(text || '');
    const collapsed = collapseRepeats(noThink);
    return collapsed.replace(/\s+/g, ' ').trim().slice(0, 300);
  };

  const handleUserSpeech = async (text: string) => {
    // Drop exact duplicate user turns to avoid loops from repeated transcripts
    const cleanedInput = normalizeText(text);
    if (!cleanedInput) return;

    const lastUser = [...conversationHistory].reverse().find((m) => m.role === 'user');
    if (lastUser?.parts?.[0]?.text === cleanedInput) {
      return;
    }

    if (loading) return;
    setLoading(true);

    setMessages((prev) => [...prev, { text: cleanedInput, type: 'user' }]);
    setIsProcessing(true);
    setPlaceholder('Processing...');

    try {
      // Use only the most recent exchanges to avoid bloated prompts and repeats
      const recentHistory = conversationHistory.slice(-12);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanedInput,
          language: LANGUAGE_MAP[language],
          history: recentHistory,
        }),
      });

      const data = await response.json();

      const cleanResponse = (raw: string) => normalizeText(raw || '');

      const aiText = cleanResponse(data.response || '');

      let dedupAi = false;
      setMessages((prev) => {
        const lastAi = [...prev].reverse().find((m) => m.type === 'ai');
        if (lastAi?.text === aiText) {
          dedupAi = true;
          return prev;
        }
        return [...prev, { text: aiText, type: 'ai' }];
      });

      // Update conversation history
      setConversationHistory((prev) => {
        const base = [...prev, { role: 'user', parts: [{ text: cleanedInput }] }];
        const full = dedupAi ? base : [...base, { role: 'model', parts: [{ text: aiText }] }];
        // Keep only last 12 turns (user/ai messages) to prevent runaway history
        return full.slice(-12);
      });

      // Play audio if available
      if (data.audio && !dedupAi) {
        playAudio(data.audio);
      } else {
        restartListening();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: 'Sorry, I encountered an error. Please try again.', type: 'ai' }]);
      restartListening();
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const playAudio = (base64Audio: string) => {
    stopAISpeech();
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    currentAudioRef.current = audio;
    isAISpeakingRef.current = true;
    
    audio.onended = () => {
      isAISpeakingRef.current = false;
      restartListening();
    };
    
    audio.play();
  };

  const toggleConversation = () => {
    if (conversationMode) {
      setConversationMode(false);
      conversationModeRef.current = false;
      recognitionRef.current?.stop();
    } else {
      setConversationMode(true);
      conversationModeRef.current = true;
      try { recognitionRef.current?.start(); } catch (e) {}
    }
  };

  const sendTextMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const input = f.elements.namedItem('textInput') as HTMLInputElement;
    const t = input.value.trim();
    if (t) {
      handleUserSpeech(t);
      input.value = '';
    }
  };

  return (
    <div className="voice-assistant-container">
      <div className="chat-box">
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="message ai">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <form onSubmit={sendTextMessage} className="text-input-wrapper">
            <input
              type="text"
              name="textInput"
              placeholder={placeholder}
              className="text-input"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={toggleConversation}
              className={`mic-button-right ${isListening ? 'active' : ''}`}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
            <button type="submit" className="send-button" disabled={isProcessing}>
              {t('complaint.input.send')}
            </button>
          </form>
        </div>

        <div className="chat-footer">
          {t('complaint.footer.hint')}
          <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
            {t('complaint.footer.powered')}
          </div>
        </div>
      </div>
    </div>
  );
}
