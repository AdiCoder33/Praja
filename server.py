from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from gtts import gTTS
import uuid
import base64

# Import Sarvam AI modules
try:
    from sarvam_tts import generate_speech_sarvam
    from sarvam_chat import chat_with_sarvam, create_fir_system_prompt
    USE_SARVAM_CHAT = True
    USE_SARVAM_TTS = True
    print("✅ Using Sarvam AI for Chat & TTS (Full Indian AI stack!)")
except Exception as e:
    USE_SARVAM_CHAT = False
    USE_SARVAM_TTS = False
    print(f"⚠️ Sarvam AI not available: {e}")
    print("⚠️ Falling back to Gemini + gTTS")

# Import Gemini as fallback for chat
if not USE_SARVAM_CHAT:
    import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Configure Gemini API (only if Sarvam Chat is not available)
if not USE_SARVAM_CHAT:
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

        if USE_SARVAM_CHAT:
            # Use Sarvam AI for chat (Indian AI)
            system_prompt = create_fir_system_prompt(language_name)

            # Build messages array for Sarvam AI
            messages = []

            # Add system message
            messages.append({
                'role': 'system',
                'content': system_prompt
            })

            # Add conversation history
            for msg in history:
                role = msg.get('role', 'user')
                content = msg.get('parts', [{}])[0].get('text', '')

                if content:
                    # Map Gemini's 'model' role to Sarvam's 'assistant' role
                    sarvam_role = 'assistant' if role == 'model' else role

                    messages.append({
                        'role': sarvam_role,
                        'content': content
                    })

            # Add current user message
            messages.append({
                'role': 'user',
                'content': user_message
            })

            # Get response from Sarvam AI
            ai_response = chat_with_sarvam(messages, language_code)

            if not ai_response:
                ai_response = "I apologize, but I'm having trouble processing your request. Please try again."

        else:
            # Fallback to Gemini
            model = genai.GenerativeModel('models/gemini-flash-lite-latest')
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(language=language_name)
            chat = model.start_chat(history=[])

            if not history:
                chat.send_message(system_prompt)
            else:
                for msg in history:
                    if msg['role'] == 'user':
                        chat.send_message(msg['parts'][0]['text'])

            response = chat.send_message(user_message)
            ai_response = response.text

        # Generate audio for the response
        audio_base64 = None
        try:
            if USE_SARVAM_TTS:
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

    if USE_SARVAM_CHAT:
        print("🤖 AI Chat: Sarvam AI (Made in India 🇮🇳)")
    else:
        print("🤖 AI Chat: Gemini (Google)")
        print("🔑 API Key: " + ("✅ Set" if GEMINI_API_KEY else "❌ Missing"))

    if USE_SARVAM_TTS:
        print("🔊 Voice Output: Sarvam AI (Natural Indian voices)")
    else:
        print("🔊 Voice Output: gTTS (Google)")

    print("🔒 Certificate: Self-signed (accept browser warning)")
    print("\n👉 Open: https://localhost:5000\n")

    # Serve frontend and API from single Flask server
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        ssl_context=('cert.pem', 'key.pem')
    )
