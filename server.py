from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from gtts import gTTS
import uuid
import base64

# Try to import Sarvam AI (fallback to gTTS if not available)
try:
    from sarvam_tts import generate_speech_sarvam
    USE_SARVAM = True
    print("✅ Using Sarvam AI for TTS (Better Indian language support!)")
except:
    USE_SARVAM = False
    print("⚠️ Sarvam AI not configured, using gTTS")

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# System prompt for FIR assistant
SYSTEM_PROMPT_TEMPLATE = """You are an AI assistant helping people file FIR (First Information Report) in India.

IMPORTANT: Respond in {language} language only. All your responses must be in {language}.

Your role:
1. Have a natural, empathetic conversation with the complainant
2. Ask relevant questions based on the type of complaint
3. Collect information systematically but naturally
4. Keep responses SHORT and conversational (2-3 sentences max)
5. Ask ONE question at a time
6. Be supportive and professional

Information to collect based on complaint type:

**For Lost Mobile/Items:**
- When did you lose it?
- Where did it happen (exact location)?
- What is the item (mobile brand/model, IMEI if available)?
- Estimated value?
- Any suspects or suspicious activity?

**For Theft:**
- When did the theft occur?
- Where did it happen?
- What was stolen (describe items)?
- Did you see the suspect? (description if yes)
- Were there any witnesses?
- Estimated value of stolen items?

**For Cyber Fraud:**
- What type of fraud (UPI, banking, OTP, phishing)?
- When did you discover it?
- How much money was lost?
- Do you have transaction details/screenshots?
- Did you report to bank/cyber cell?

Keep responses natural, short, and empathetic. Don't sound like a form.
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        language_code = data.get('language', 'en-IN')
        history = data.get('history', [])

        # Map language codes to language names
        language_map = {
            'en-IN': 'English',
            'hi-IN': 'Hindi (हिंदी)',
            'te-IN': 'Telugu (తెలుగు)'
        }
        language_name = language_map.get(language_code, 'English')

        # Initialize model (using lite version for lower quota usage)
        model = genai.GenerativeModel('models/gemini-flash-lite-latest')

        # Create system prompt with selected language
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(language=language_name)

        # Create chat with system instruction
        chat = model.start_chat(history=[])

        # Send system prompt first if history is empty
        if not history:
            chat.send_message(system_prompt)
        else:
            # Rebuild chat history
            for msg in history:
                if msg['role'] == 'user':
                    chat.send_message(msg['parts'][0]['text'])

        # Send user message
        response = chat.send_message(user_message)
        ai_response = response.text

        # Generate audio for the response
        audio_base64 = None
        try:
            if USE_SARVAM:
                # Use Sarvam AI TTS (better for Indian languages)
                audio_base64 = generate_speech_sarvam(ai_response, language_code)
            else:
                # Fallback to gTTS
                tts_lang_map = {
                    'en-IN': 'en',
                    'hi-IN': 'hi',
                    'te-IN': 'te'
                }
                tts_lang = tts_lang_map.get(language_code, 'en')

                # Generate speech
                tts = gTTS(text=ai_response, lang=tts_lang, slow=False)

                # Save to temporary file
                audio_file = f"temp_audio_{uuid.uuid4()}.mp3"
                tts.save(audio_file)

                # Read and encode as base64
                with open(audio_file, 'rb') as f:
                    audio_data = f.read()
                    audio_base64 = base64.b64encode(audio_data).decode('utf-8')

                # Delete temp file
                os.remove(audio_file)

        except Exception as audio_error:
            print(f"Audio generation error: {str(audio_error)}")
            # Continue without audio if it fails

        return jsonify({
            'response': ai_response,
            'audio': audio_base64,
            'status': 'success'
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'response': 'I apologize, but I encountered an error. Please try again.',
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'FIR Assistant API is running'})

# Serve frontend files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    print("🚀 Starting AI Voice FIR Assistant...")
    print("📡 Server: https://localhost:5000")
    print("🎤 Voice Input: ENABLED with HTTPS")
    print("🔑 API Key: " + ("✅ Set" if GEMINI_API_KEY else "❌ Missing"))
    print("🔒 Certificate: Self-signed (accept browser warning)")
    print("\n👉 Open: https://localhost:5000\n")

    # Serve frontend and API from single Flask server
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        ssl_context=('cert.pem', 'key.pem')
    )
