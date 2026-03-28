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
  const conversationModeRef = useRef(false); // Use ref for current value
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
      console.log('✅ Recognition started successfully');
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

        // Set processing state BEFORE stopping recognition
        // This prevents onend from restarting too early
        setIsProcessing(true);
        setPlaceholder('Processing...');

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
      console.log('Recognition ended. ConversationMode:', conversationModeRef.current, 'isProcessing:', isProcessing, 'isAISpeaking:', isAISpeakingRef.current);

      // Only update UI state when stopping, don't auto-restart
      // Restarts are now handled explicitly by restartListening()
      if (!conversationModeRef.current) {
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
  }, [language]); // Only recreate when language changes

  const stopAISpeech = () => {
    isAISpeakingRef.current = false;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    console.log('AI speech interrupted');
  };

  const restartListening = () => {
    console.log('restartListening called. ConversationMode:', conversationModeRef.current);
    if (conversationModeRef.current && recognitionRef.current) {
      setPlaceholder('Restarting microphone...');
      setTimeout(() => {
        try {
          console.log('Attempting to restart recognition...');
          recognitionRef.current.start();
          console.log('Recognition start() called successfully');
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setPlaceholder('⚠️ Mic failed - click mic button to retry');
          setIsListening(false);
        }
      }, 1500);
    } else {
      console.log('Not restarting - conversationMode is false or no recognitionRef');
    }
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
      } else {
        // No audio - restart listening immediately
        restartListening();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', type: 'ai' },
      ]);
      // On error - restart listening
      restartListening();
    } finally {
      setIsProcessing(false);
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
        // Auto-restart listening after audio finishes
        restartListening();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        isAISpeakingRef.current = false;
        currentAudioRef.current = null;
        // Restart listening even if audio fails
        restartListening();
      };

      isAISpeakingRef.current = true;
      currentAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      isAISpeakingRef.current = false;
      // Restart listening if audio playback fails
      restartListening();
    }
  };

  const toggleConversation = () => {
    if (conversationMode) {
      // Stop
      setConversationMode(false);
      conversationModeRef.current = false; // Update ref
      setIsListening(false);
      setPlaceholder('Type here or click mic...');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    } else {
      // Start
      setConversationMode(true);
      conversationModeRef.current = true; // Update ref
      setIsListening(true); // Immediate feedback
      setPlaceholder('Starting microphone...');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start:', e);
          setIsListening(false);
          setConversationMode(false);
          conversationModeRef.current = false; // Update ref
          setPlaceholder('Type here or click mic...');
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
