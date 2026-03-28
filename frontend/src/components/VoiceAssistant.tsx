import { useState, useEffect, useRef } from 'react';
import '../styles/voice-assistant.css';

interface Message {
  text: string;
  type: 'user' | 'ai';
}

interface VoiceAssistantProps {
  language: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export default function VoiceAssistant({ language }: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Namaste! I'm your AI assistant. Please tell me about your complaint. You can speak in English, Hindi, or Telugu.",
      type: 'ai',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [pendingSpeech, setPendingSpeech] = useState('');
  const [placeholder, setPlaceholder] = useState('Type here or click mic for continuous conversation...');

  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAISpeakingRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

      // Show interim results
      if (!event.results[0].isFinal) {
        setPlaceholder(`Hearing: "${transcript}"`);
        return;
      }

      // Only process FINAL results
      const finalText = transcript.trim();

      if (finalText.length < 3) {
        console.log('Ignored short input:', finalText);
        return;
      }

      // Interrupt AI if speaking
      if (isAISpeakingRef.current) {
        stopAISpeech();
      }

      // Accumulate speech with 4-second buffer
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        setPendingSpeech((prev) => prev + ' ' + finalText);
        setPlaceholder(`Got: "${pendingSpeech + ' ' + finalText}" - waiting 4s for more...`);
      } else {
        setPendingSpeech(finalText);
        setPlaceholder(`Got: "${finalText}" - waiting 4s for more...`);
      }

      // Wait 4 seconds before processing
      speechTimeoutRef.current = setTimeout(() => {
        const textToProcess = pendingSpeech || finalText;
        console.log('Processing:', textToProcess);
        setPendingSpeech('');
        speechTimeoutRef.current = null;

        try {
          recognition.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }

        handleUserSpeech(textToProcess);
      }, 4000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        alert(`Speech error: ${event.error}. Please try typing instead.`);
      }
    };

    recognition.onend = () => {
      if (conversationMode && !isAISpeakingRef.current && !isProcessing) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Could not restart recognition');
          }
        }, 500);
      } else if (!conversationMode) {
        setIsListening(false);
        setPlaceholder('Type here or click mic...');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [language, conversationMode, pendingSpeech, isProcessing]);

  const stopAISpeech = () => {
    isAISpeakingRef.current = false;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    console.log('AI speech interrupted');
  };

  const handleUserSpeech = async (text: string) => {
    if (isProcessing) {
      console.log('Already processing, ignoring duplicate');
      return;
    }

    setIsProcessing(true);
    setPlaceholder('Processing...');

    // Add user message
    setMessages((prev) => [...prev, { text, type: 'user' }]);

    try {
      // Call backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: LANGUAGE_MAP[language],
          history: [],
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // Add AI response
      setMessages((prev) => [...prev, { text: data.response, type: 'ai' }]);

      // Play audio if available
      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', type: 'ai' },
      ]);
    } finally {
      setIsProcessing(false);
      setPlaceholder('🎤 Listening...');
    }
  };

  const playAudio = (audioBase64: string) => {
    try {
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < audioData.length; i++) {
        uint8Array[i] = audioData.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        isAISpeakingRef.current = false;
        currentAudioRef.current = null;

        // Auto-restart listening
        if (conversationMode && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Could not restart');
            }
          }, 1500);
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        isAISpeakingRef.current = false;
        currentAudioRef.current = null;
      };

      isAISpeakingRef.current = true;
      currentAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      isAISpeakingRef.current = false;
    }
  };

  const toggleConversation = () => {
    if (conversationMode) {
      // Stop
      setConversationMode(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      setIsListening(false);
      setPlaceholder('Type here or click mic...');
    } else {
      // Start
      setConversationMode(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start:', e);
          alert('Could not start microphone. Please check permissions.');
        }
      }
    }
  };

  const sendTextMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('textInput') as HTMLInputElement;
    const text = input.value.trim();

    if (!text) return;

    input.value = '';
    await handleUserSpeech(text);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="voice-assistant-container">
      <div className="chat-box">
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {isProcessing && (
            <div className="message ai">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <form onSubmit={sendTextMessage} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <input
              type="text"
              name="textInput"
              placeholder={placeholder}
              className="text-input"
              disabled={isProcessing}
            />
            <button type="submit" className="send-button" disabled={isProcessing}>
              Send ➤
            </button>
            <button
              type="button"
              onClick={toggleConversation}
              className={`mic-button ${isListening ? 'active' : ''}`}
              title={conversationMode ? 'Stop conversation' : 'Start conversation'}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </form>
        </div>

        <div className="chat-footer">
          🎤 Click mic for <strong>continuous conversation</strong> - I'll listen after each response!
          <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
            💡 Powered by Sarvam AI 🇮🇳
          </div>
        </div>
      </div>
    </div>
  );
}
