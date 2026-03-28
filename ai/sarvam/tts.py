"""
Sarvam AI Text-to-Speech Integration
Supports: Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia
"""

import requests
import base64
import os
from dotenv import load_dotenv

# Load environment variables from config folder
config_path = os.path.join(os.path.dirname(__file__), '../../config/.env')
load_dotenv(config_path)

SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

def generate_speech_sarvam(text, language_code='te-IN'):
    """
    Generate speech using Sarvam AI TTS

    Args:
        text: Text to convert to speech
        language_code: Language code (en-IN, hi-IN, te-IN, ta-IN, etc.)

    Returns:
        base64 encoded audio or None if failed
    """

    # Map language codes to Sarvam AI language codes
    lang_map = {
        'en-IN': 'en-IN',
        'hi-IN': 'hi-IN',
        'te-IN': 'te-IN',
        'ta-IN': 'ta-IN',
        'kn-IN': 'kn-IN',
        'ml-IN': 'ml-IN',
        'bn-IN': 'bn-IN',
        'gu-IN': 'gu-IN',
        'mr-IN': 'mr-IN',
        'pa-IN': 'pa-IN',
        'or-IN': 'or-IN'
    }

    sarvam_lang = lang_map.get(language_code, 'en-IN')

    headers = {
        'API-Subscription-Key': SARVAM_API_KEY,
        'Content-Type': 'application/json'
    }

    payload = {
        'inputs': [text],
        'target_language_code': sarvam_lang,
        'speaker': 'kavya',  # Female voice (other options: anushka, vidya, priya)
        # Male voices: abhilash, karun, rahul, rohan
        'pace': 1.0,
        'speech_sample_rate': 22050,
        'enable_preprocessing': True,
        'model': 'bulbul:v3'  # Latest model (v2, v3-beta, v3)
    }

    try:
        response = requests.post(SARVAM_TTS_URL, json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            # Sarvam returns base64 encoded audio
            audio_base64 = data.get('audios', [None])[0]
            return audio_base64
        else:
            print(f"Sarvam TTS Error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"Sarvam TTS Exception: {str(e)}")
        return None


# Test function
if __name__ == "__main__":
    # Test Telugu
    audio = generate_speech_sarvam("నమస్కారం, నేను మీకు ఎలా సహాయం చేయగలను?", "te-IN")
    if audio:
        print("✅ Telugu TTS working!")

    # Test Hindi
    audio = generate_speech_sarvam("नमस्ते, मैं आपकी कैसे मदद कर सकता हूं?", "hi-IN")
    if audio:
        print("✅ Hindi TTS working!")
