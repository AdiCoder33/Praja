"""
Groq LLM client for FIR summarization
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables from config folder
config_path = os.path.join(os.path.dirname(__file__), '../config/.env')
load_dotenv(config_path)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
API_URL = 'https://api.groq.com/openai/v1/chat/completions'
MODEL = 'llama-3.3-70b-versatile'

def summarize_fir_conversation(history):
    """
    Create a crisp 5-10 line FIR summary from conversation history.

    history: list of {role, parts:[{text}]} as collected in FIRService
    returns: summary text or None on failure
    """
    if not GROQ_API_KEY:
        return None

    # Flatten conversation to text (cap length to avoid oversized prompts)
    segments = []
    for msg in history:
        role = msg.get('role', 'user')
        text = ''
        parts = msg.get('parts', [])
        if parts and len(parts) > 0:
            text = parts[0].get('text', '')
        if not text:
            continue
        prefix = 'User:' if role == 'user' else 'Assistant:'
        segments.append(f"{prefix} {text}")

    convo_text = '\n'.join(segments)[-4000:]

    system_prompt = (
        "You are an FIR summarizer for police officers. Using the conversation, "
        "produce a structured note in English with 5-10 short lines. Keep total under 140 words. "
        "Use these exact labels (one line each):\n"
        "1) Acts & Sections:\n"
        "2) Occurrence (date/time window):\n"
        "3) Place (address/area/landmark):\n"
        "4) Complainant (name/contact if present):\n"
        "5) Accused (names/unknown/description):\n"
        "6) Property (items/value):\n"
        "7) Key Details (concise incident facts):\n"
        "8) Urgency (High/Medium/Low with 1-2 words rationale):\n"
        "9) Action Suggested (one line next step).\n"
        "If a field is missing, write 'Not stated'. No preamble or extra commentary."
    )

    try:
        res = requests.post(
            API_URL,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}',
            },
            json={
                'model': MODEL,
                'temperature': 0.3,
                'max_tokens': 320,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': convo_text},
                ],
            },
            timeout=20,
        )

        if not res.ok:
            try:
                detail = res.text
                print(f"Groq summarize error {res.status_code}: {detail}")
            except Exception:
                print(f"Groq summarize error {res.status_code}")
            return None

        data = res.json()
        return data.get('choices', [{}])[0].get('message', {}).get('content', '').strip() or None
    except Exception as exc:
        print(f"Groq summarize exception: {exc}")
        return None
