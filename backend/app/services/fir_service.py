"""
FIR Service - Business logic for FIR assistant
"""

import sys
import os

# Add project root to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from ai.sarvam.chat import chat_with_sarvam, create_fir_system_prompt
from ai.sarvam.tts import generate_speech_sarvam
from gtts import gTTS
import uuid
import base64

class FIRService:
    """Service to handle FIR-related operations"""

    def __init__(self):
        self.use_sarvam_chat = True
        self.use_sarvam_tts = True

        # Check if Sarvam AI is available
        try:
            from ai.sarvam import chat, tts
            print("✅ Sarvam AI modules loaded successfully")
        except Exception as e:
            print(f"⚠️ Sarvam AI not available: {e}")
            self.use_sarvam_chat = False
            self.use_sarvam_tts = False

    def process_message(self, user_message, language_code, history):
        """
        Process user message and generate response with audio

        Args:
            user_message: User's text input
            language_code: Language code (en-IN, hi-IN, te-IN)
            history: Conversation history

        Returns:
            dict: Response with text and audio
        """

        # Map language codes to language names
        language_map = {
            'en-IN': 'English',
            'hi-IN': 'Hindi (हिंदी)',
            'te-IN': 'Telugu (తెలుగు)'
        }
        language_name = language_map.get(language_code, 'English')

        # Get AI response
        ai_response = self._get_ai_response(user_message, language_name, language_code, history)

        # Generate audio
        audio_base64 = self._generate_audio(ai_response, language_code)

        return {
            'response': ai_response,
            'audio': audio_base64,
            'status': 'success'
        }

    def _get_ai_response(self, user_message, language_name, language_code, history):
        """Get AI response using Sarvam or fallback"""

        if self.use_sarvam_chat:
            return self._get_sarvam_response(user_message, language_name, language_code, history)
        else:
            # Fallback to basic response (or implement Gemini fallback)
            return f"[Fallback] Received: {user_message}. Sarvam AI not configured."

    def _get_sarvam_response(self, user_message, language_name, language_code, history):
        """Get response from Sarvam AI"""

        system_prompt = create_fir_system_prompt(language_name)

        # Build messages array
        messages = [{'role': 'system', 'content': system_prompt}]

        # Add conversation history with role mapping
        for msg in history:
            role = msg.get('role', 'user')
            content = msg.get('parts', [{}])[0].get('text', '')

            if content:
                # Map 'model' to 'assistant' for Sarvam AI
                sarvam_role = 'assistant' if role == 'model' else role
                messages.append({'role': sarvam_role, 'content': content})

        # Add current user message
        messages.append({'role': 'user', 'content': user_message})

        # Get response from Sarvam AI
        ai_response = chat_with_sarvam(messages, language_code)

        if not ai_response:
            ai_response = "I apologize, but I'm having trouble processing your request. Please try again."

        return ai_response

    def _generate_audio(self, text, language_code):
        """Generate audio using Sarvam TTS or fallback to gTTS"""

        try:
            if self.use_sarvam_tts:
                # Use Sarvam AI TTS
                audio_base64 = generate_speech_sarvam(text, language_code)
                if audio_base64:
                    return audio_base64

            # Fallback to gTTS
            return self._generate_gtts_audio(text, language_code)

        except Exception as e:
            print(f"Audio generation error: {str(e)}")
            return None

    def _generate_gtts_audio(self, text, language_code):
        """Fallback TTS using gTTS"""

        tts_lang_map = {
            'en-IN': 'en',
            'hi-IN': 'hi',
            'te-IN': 'te'
        }
        tts_lang = tts_lang_map.get(language_code, 'en')

        # Generate speech
        tts = gTTS(text=text, lang=tts_lang, slow=False)

        # Save to temporary file
        audio_file = f"temp_audio_{uuid.uuid4()}.mp3"
        tts.save(audio_file)

        # Read and encode as base64
        with open(audio_file, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')

        # Delete temp file
        os.remove(audio_file)

        return audio_base64
