// Configuration
const API_URL = '/api/chat';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const voiceButton = document.getElementById('voiceButton');
const languageSelect = document.getElementById('languageSelect');
const errorMessage = document.getElementById('errorMessage');
const headerTitle = document.getElementById('headerTitle');
const headerSubtitle = document.getElementById('headerSubtitle');
const aiGreeting = document.getElementById('aiGreeting');
const micHelper = document.getElementById('micHelper');
const footerNote = document.getElementById('footerNote');
const sendButton = document.getElementById('sendButton');

// State
let isRecording = false;
window.recognition = null;
let recognition = null;
let speechSynthesis = window.speechSynthesis;
let conversationHistory = [];
window.currentAudio = null; // Track current audio playback
window.isAISpeaking = false; // Track if AI is speaking
window.conversationMode = false; // Continuous conversation mode
window.isProcessing = false; // Prevent duplicate processing
let speechTimeout = null; // Timer for speech pause detection
let pendingSpeech = ''; // Store speech while waiting
let currentLanguage = 'te-IN';

// UI translations
const uiText = {
    'en-IN': {
        headerTitle: '🚔 AI Voice FIR Assistant',
        headerSubtitle: 'Speak your complaint in your language',
        aiGreeting: "Namaste! I'm your AI assistant. Please tell me about your complaint. You can speak in English, Hindi, or Telugu.",
        inputPlaceholder: 'Type here or click mic for continuous conversation...',
        sendButtonText: 'Send ➤',
        micHelper: "🎤 Click mic for <strong>continuous conversation</strong> - I'll listen after each response! You can interrupt me anytime. 🔊",
        footerNote: '💡 Powered by Sarvam AI 🇮🇳 - Natural Indian voices & language understanding',
        micTitleStart: 'Click to start continuous conversation',
        micTitleStop: 'Click to stop conversation',
        listeningPlaceholder: '🎤 Listening...',
        waitingPlaceholder: 'Got: "{text}" - waiting 4s for more...',
        processingLabel: 'Processing...'
    },
    'hi-IN': {
        headerTitle: '🚔 एआई वॉइस FIR सहायक',
        headerSubtitle: 'अपनी भाषा में अपनी शिकायत बताएं',
        aiGreeting: 'नमस्ते! मैं आपका एआई सहायक हूँ। कृपया अपनी शिकायत बताएं। आप हिंदी, तेलुगु या अंग्रेजी में बोल सकते हैं।',
        inputPlaceholder: 'यहाँ टाइप करें या लगातार बातचीत के लिए माइक दबाएं...',
        sendButtonText: 'भेजें ➤',
        micHelper: '🎤 माइक दबाकर <strong>लगातार बातचीत</strong> करें - मैं हर उत्तर के बाद सुनूँगा! आप कभी भी रोक सकते हैं। 🔊',
        footerNote: '💡 सरवम AI 🇮🇳 द्वारा संचालित - भारतीय भाषाओं के लिए प्राकृतिक आवाज़ें',
        micTitleStart: 'लगातार बातचीत शुरू करें',
        micTitleStop: 'लगातार बातचीत रोकें',
        listeningPlaceholder: '🎤 सुन रहा हूँ...',
        waitingPlaceholder: 'मिला: "{text}" - 4 सेकंड तक प्रतीक्षा कर रहा हूँ...',
        processingLabel: 'प्रोसेस हो रहा है...'
    },
    'te-IN': {
        headerTitle: '🚔 ఎఐ వాయిస్ ఎఫ్‌ఐఆర్ సహాయకుడు',
        headerSubtitle: 'మీ భాషలో మీ ఫిర్యాదు చెప్పండి',
        aiGreeting: 'నమస్తే! నేను మీ ఎఐ సహాయకుడు. మీ ఫిర్యాదు తెలుపండి. మీరు తెలుగు, హిందీ లేదా ఇంగ్లీష్ లో మాట్లాడవచ్చు.',
        inputPlaceholder: 'ఇక్కడ టైప్ చేయండి లేదా నిరంతర సంభాషణ కోసం మైక్ నొక్కండి...',
        sendButtonText: 'పంపండి ➤',
        micHelper: '🎤 మైక్ నొక్కి <strong>నిరంతర సంభాషణ</strong> ప్రారంభించండి - ప్రతి సమాధానం తర్వాత నేను వింటాను! ఎప్పుడైనా ఆపవచ్చు. 🔊',
        footerNote: '💡 సర్వమ్ ఎఐ 🇮🇳 ఆధారిత సహాయం - భారతీయ భాషలకు సహజమైన గొంతులు',
        micTitleStart: 'నిరంతర సంభాషణ ప్రారంభించండి',
        micTitleStop: 'నిరంతర సంభాషణ ఆపండి',
        listeningPlaceholder: '🎤 వింటున్నాను...',
        waitingPlaceholder: 'పొందాను: "{text}" - ఇంకో 4 సెకన్లు వేచిచూస్తున్నాను...',
        processingLabel: 'ప్రాసెస్ జరుగుతోంది...'
    }
};

function applyLanguage(lang) {
    currentLanguage = lang || 'te-IN';
    const t = uiText[currentLanguage] || uiText['te-IN'];

    // Update document language hint
    document.documentElement.lang = currentLanguage.startsWith('hi') ? 'hi' : currentLanguage.startsWith('en') ? 'en' : 'te';

    if (headerTitle) headerTitle.textContent = t.headerTitle;
    if (headerSubtitle) headerSubtitle.textContent = t.headerSubtitle;
    if (aiGreeting) aiGreeting.textContent = t.aiGreeting;
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.placeholder = t.inputPlaceholder;
    if (sendButton) sendButton.textContent = t.sendButtonText;
    if (micHelper) micHelper.innerHTML = t.micHelper;
    if (footerNote) footerNote.textContent = t.footerNote;
    if (voiceButton) {
        voiceButton.title = window.conversationMode ? t.micTitleStop : t.micTitleStart;
    }
    if (languageSelect) {
        languageSelect.value = currentLanguage;
    }
}

// Initialize Speech Recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    window.recognition = recognition; // Make available globally

    recognition.continuous = true; // Keep listening continuously
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = currentLanguage;

    recognition.onstart = () => {
        isRecording = true;
        if (voiceButton) {
            voiceButton.classList.add('recording');
            voiceButton.textContent = '🔴';
        }
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.placeholder = uiText[currentLanguage].listeningPlaceholder;
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        // Show interim results
        if (!event.results[0].isFinal) {
            const textInput = document.getElementById('textInput');
            if (textInput) textInput.placeholder = uiText[currentLanguage].listeningPlaceholder;
            return; // Don't process interim results
        }

        // Only process FINAL results with actual content
        const finalText = transcript.trim();

        // Ignore empty, very short, or noise-like inputs
        if (finalText.length < 3) {
            console.log('Ignored short/noise input:', finalText);
            return;
        }

        // If user speaks while AI is talking, interrupt AI (only on final speech)
        if (window.isAISpeaking) {
            console.log('🛑 User interrupted AI');
            stopAISpeech();
        }

        // Accumulate speech if user continues talking
        if (speechTimeout) {
            // User is continuing to speak - append new text
            pendingSpeech = pendingSpeech + ' ' + finalText;
            clearTimeout(speechTimeout);
            console.log('⏱️ User still speaking, accumulated:', pendingSpeech);
        } else {
            // First speech or new speech after processing
            pendingSpeech = finalText;
            console.log('🎤 New speech captured:', pendingSpeech);
        }

        // Show waiting message
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.placeholder = uiText[currentLanguage].waitingPlaceholder.replace('{text}', pendingSpeech);

        // Wait 4 seconds before processing
        speechTimeout = setTimeout(() => {
            console.log('✅ 4 seconds of silence, processing:', pendingSpeech);

            // STOP recognition to prevent duplicates during processing
            try {
                recognition.stop();
            } catch (e) {
                console.log('Recognition already stopped');
            }

            // Process the accumulated speech
            if (textInput) textInput.placeholder = uiText[currentLanguage].processingLabel;
            handleUserSpeech(pendingSpeech);

            // Clear pending speech
            pendingSpeech = '';
            speechTimeout = null;
        }, 4000); // 4 second delay
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
        // Auto-restart in conversation mode (but not while AI is speaking or processing)
        if (window.conversationMode && !window.isAISpeaking && !window.isProcessing) {
            setTimeout(() => {
                // Double-check before restarting
                if (window.conversationMode && !window.isProcessing) {
                    try {
                        recognition.lang = currentLanguage;
                        recognition.start();
                        console.log('🎤 Recognition auto-restarted');
                    } catch (error) {
                        console.log('Recognition restart skipped:', error.message);
                    }
                }
            }, 500); // Small delay before restarting
        } else if (!window.conversationMode) {
            stopRecording();
        }
    };

    return true;
}

// Stop AI speech (for interruption)
function stopAISpeech() {
    window.isAISpeaking = false;

    // Stop backend audio
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
        window.currentAudio = null;
    }

    // Stop browser TTS
    speechSynthesis.cancel();

    console.log('🛑 AI speech interrupted by user');
}

// Handle user speech
async function handleUserSpeech(text) {
    // Prevent duplicate processing
    if (window.isProcessing) {
        console.log('⚠️ Already processing, ignoring duplicate input');
        return;
    }

    window.isProcessing = true;

    // Stop AI if it's speaking
    if (window.isAISpeaking) {
        stopAISpeech();
    }

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

        // Mark AI as speaking
        window.isAISpeaking = true;

        // Play audio from backend if available
        if (data.audio) {
            playAudioFromBackend(data.audio);
        } else {
            // Fallback to browser TTS
            speakText(data.response);
        }

    } catch (error) {
        hideTypingIndicator();
        window.isAISpeaking = false;
        window.isProcessing = false; // Reset on error

        // Restart listening on error if in conversation mode
        if (window.conversationMode && window.recognition) {
            setTimeout(() => {
                try {
                    window.recognition.start();
                } catch (e) {
                    console.log('Could not restart after error:', e.message);
                }
            }, 1000);
        }

        showError('Failed to get AI response. Please check if the server is running.');
        console.error('AI Error:', error);
    }
}

// Send message to AI backend
async function sendToAI(userMessage) {
    const language = currentLanguage;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                language: language,
                history: conversationHistory
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout - server took too long (30s). Server may be restarting, please try again.');
        }
        throw error;
    }
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
    const language = currentLanguage;
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
        window.isAISpeaking = false;
        window.isProcessing = false; // Reset processing flag
        const textInput = document.getElementById('textInput');
        if (textInput) textInput.placeholder = uiText[currentLanguage].inputPlaceholder;

        console.log('✅ Browser TTS finished, waiting before listening...');

        // Auto-restart listening if in conversation mode
        if (window.conversationMode && window.recognition) {
            setTimeout(() => {
                if (!window.isProcessing && window.conversationMode) {
                    try {
                        window.recognition.start();
                        console.log('🎤 Auto-restarted listening after browser TTS');
                    } catch (error) {
                        console.log('Recognition auto-restart skipped:', error.message);
                    }
                }
            }, 1500); // Increased delay to 1.5 seconds
        }
    };

    utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event);
        window.isAISpeaking = false;
        window.isProcessing = false; // Reset on error
    };
}

// Start/Stop conversation mode
function toggleRecording() {
    if (!recognition) {
        if (!initSpeechRecognition()) {
            showError('Speech recognition not available. Please use text input.');
            return;
        }
    }

    const t = uiText[currentLanguage] || uiText['te-IN'];

    if (window.conversationMode) {
        // Stop conversation mode
        window.conversationMode = false;
        recognition.stop();
        stopRecording();
        console.log('🛑 Conversation mode stopped');
        if (voiceButton) voiceButton.title = t.micTitleStart;
    } else {
        // Start conversation mode
        window.conversationMode = true;
        try {
            recognition.lang = currentLanguage;
            recognition.start();
            isRecording = true;
            if (voiceButton) {
                voiceButton.classList.add('recording');
                voiceButton.textContent = '🔴';
                voiceButton.title = t.micTitleStop;
            }
            const textInput = document.getElementById('textInput');
            if (textInput) textInput.placeholder = uiText[currentLanguage].inputPlaceholder;
            console.log('🎤 Conversation mode started - Always listening!');
        } catch (error) {
            console.error('Failed to start recognition:', error);
            window.conversationMode = false;
            showError('Cannot start microphone. Please use text input below.');
        }
    }
}

function stopRecording() {
    isRecording = false;
    window.conversationMode = false;

    // Clear any pending speech timeout
    if (speechTimeout) {
        clearTimeout(speechTimeout);
        speechTimeout = null;
        pendingSpeech = '';
        console.log('🛑 Cleared pending speech');
    }

    if (voiceButton) {
        voiceButton.classList.remove('recording');
        voiceButton.textContent = '🎤';
        const t = uiText[currentLanguage] || uiText['te-IN'];
        voiceButton.title = t.micTitleStart;
    }
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.placeholder = uiText[currentLanguage].inputPlaceholder;
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

if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        applyLanguage(currentLanguage);
        if (recognition) {
            recognition.lang = currentLanguage;
        }
    });
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
        const response = await fetch('/health');
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

    // Ensure default language is Telugu unless user picked something else
    if (languageSelect) {
        currentLanguage = languageSelect.value || 'te-IN';
    }
    applyLanguage(currentLanguage);

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
