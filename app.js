// Configuration
const API_URL = '/api/chat';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const voiceButton = document.getElementById('voiceButton');
const languageSelect = document.getElementById('languageSelect');
const errorMessage = document.getElementById('errorMessage');

// State
let isRecording = false;
let recognition = null;
let speechSynthesis = window.speechSynthesis;
let conversationHistory = [];

// Initialize Speech Recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isRecording = true;
        if (voiceButton) {
            voiceButton.classList.add('recording');
            voiceButton.textContent = '🔴';
        }
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.placeholder = '🎤 Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        if (event.results[0].isFinal) {
            handleUserSpeech(transcript);
        } else {
            // Show interim results
            const textInput = document.getElementById('textInput');
            if (textInput) textInput.placeholder = `Hearing: "${transcript}"`;
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();

        if (event.error === 'no-speech') {
            showError('No speech detected. Please try again or use text input below.');
        } else if (event.error === 'not-allowed') {
            showError('⚠️ Microphone blocked. Please allow mic in browser settings, then refresh the page.');
        } else if (event.error === 'network') {
            // Network error is common on HTTP (not HTTPS)
            showError('⚠️ Voice input unavailable (browser security). Please use TEXT INPUT below - it works perfectly!');
            // Hide mic button after repeated failures
            if (voiceButton) {
                voiceButton.style.opacity = '0.5';
                voiceButton.title = 'Voice unavailable - use text input';
            }
        } else if (event.error === 'service-not-allowed') {
            showError('Speech service blocked. Please use TEXT INPUT below.');
        } else {
            showError(`Speech error: ${event.error}. Please use TEXT INPUT - it works great!`);
        }
    };

    recognition.onend = () => {
        stopRecording();
    };

    return true;
}

// Handle user speech
async function handleUserSpeech(text) {
    // Add user message to chat
    addMessage(text, 'user');

    // Show typing indicator
    showTypingIndicator();

    // Send to AI
    try {
        const data = await sendToAI(text);

        // Hide typing indicator
        hideTypingIndicator();

        // Add AI response to chat
        addMessage(data.response, 'ai');

        // Play audio from backend if available
        if (data.audio) {
            playAudioFromBackend(data.audio);
        } else {
            // Fallback to browser TTS
            speakText(data.response);
        }

    } catch (error) {
        hideTypingIndicator();
        showError('Failed to get AI response. Please check if the server is running.');
        console.error('AI Error:', error);
    }
}

// Send message to AI backend
async function sendToAI(userMessage) {
    const language = languageSelect.value;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: userMessage,
            language: language,
            history: conversationHistory
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Update conversation history
    conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });
    conversationHistory.push({
        role: 'model',
        parts: [{ text: data.response }]
    });

    return data;
}

// Add message to chat
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator show';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    messageDiv.appendChild(indicator);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.parentElement.remove();
    }
}

// Text-to-Speech with better language support
function speakText(text) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language based on selection
    const language = languageSelect.value;
    utterance.lang = language;
    utterance.rate = 0.85; // Slower for Indian languages
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Wait for voices to be loaded
    const setVoice = () => {
        const voices = speechSynthesis.getVoices();

        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

        let voice = null;

        // Exact match first (e.g., 'te-IN')
        voice = voices.find(v => v.lang === language);

        // Try language code match (e.g., 'te')
        if (!voice) {
            const langCode = language.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langCode));
        }

        // Try finding by language name in voice name
        if (!voice) {
            const languageNames = {
                'te-IN': ['telugu', 'తెలుగు'],
                'hi-IN': ['hindi', 'हिंदी'],
                'en-IN': ['english', 'india']
            };

            const names = languageNames[language] || [];
            for (const name of names) {
                voice = voices.find(v =>
                    v.name.toLowerCase().includes(name) ||
                    v.lang.toLowerCase().includes(name)
                );
                if (voice) break;
            }
        }

        // Fallback to any Indian English voice for Telugu/Hindi if no native voice
        if (!voice && (language === 'te-IN' || language === 'hi-IN')) {
            voice = voices.find(v => v.lang === 'en-IN');
        }

        if (voice) {
            utterance.voice = voice;
            console.log('✅ Using voice:', voice.name, '(', voice.lang, ')');
        } else {
            console.warn('⚠️ No voice found for', language, '- using default');
            console.log('💡 Install language packs in your browser for better support');
        }

        speechSynthesis.speak(utterance);
    };

    // Chrome needs voices to be loaded first
    if (speechSynthesis.getVoices().length > 0) {
        setVoice();
    } else {
        speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onend = () => {
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.placeholder = 'Type your message or click mic...';
    };

    utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event);
    };
}

// Start/Stop recording
function toggleRecording() {
    if (!recognition) {
        if (!initSpeechRecognition()) {
            showError('Speech recognition not available. Please use text input.');
            return;
        }
    }

    if (isRecording) {
        recognition.stop();
    } else {
        try {
            recognition.lang = languageSelect.value;
            recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            showError('Cannot start microphone. Please use text input below.');
        }
    }
}

function stopRecording() {
    isRecording = false;
    if (voiceButton) {
        voiceButton.classList.remove('recording');
        voiceButton.textContent = '🎤';
    }
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.placeholder = 'Type your message or click mic...';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Event Listeners
if (voiceButton) {
    voiceButton.addEventListener('click', toggleRecording);
}

// Check browser support and internet
async function checkSystem() {
    const checks = [];

    // Check speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        checks.push('❌ Speech recognition not supported. Use Chrome or Edge.');
    } else {
        checks.push('✅ Speech recognition supported');
    }

    // Check internet connection
    if (!navigator.onLine) {
        checks.push('❌ No internet connection detected');
    } else {
        checks.push('✅ Internet connected');
    }

    // Check server connection
    try {
        const response = await fetch('http://localhost:5000/health', { timeout: 3000 });
        if (response.ok) {
            checks.push('✅ Server connected');
        }
    } catch (error) {
        checks.push('❌ Cannot reach server');
    }

    // Display system check
    console.log('System Check:', checks);
    return checks;
}

// Initialize on page load
window.addEventListener('load', async () => {
    // Load voices for speech synthesis
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
    }

    // Run system check
    const checks = await checkSystem();

    // Initialize speech recognition if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('✅ Voice input ready with HTTPS!');
    } else {
        console.log('Speech recognition not supported');
        if (voiceButton) voiceButton.style.display = 'none';
    }
});

// Handle language change
languageSelect.addEventListener('change', () => {
    if (recognition) {
        recognition.lang = languageSelect.value;
    }
});

// Send text message function
async function sendTextMessage() {
    const textInput = document.getElementById('textInput');
    const message = textInput.value.trim();

    if (!message) {
        showError('Please type a message first');
        return;
    }

    // Clear input
    textInput.value = '';

    // Process message same as voice
    handleUserSpeech(message);
}
