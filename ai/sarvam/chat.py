"""
Sarvam AI Chat/LLM Integration
Uses Sarvam-1 model for conversational AI
"""

from sarvamai import SarvamAI
import os
from dotenv import load_dotenv

# Load environment variables from config folder
config_path = os.path.join(os.path.dirname(__file__), '../../config/.env')
load_dotenv(config_path)

SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')

# Initialize Sarvam AI client
client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

def chat_with_sarvam(messages, language='en-IN'):
    """
    Chat with Sarvam AI LLM

    Args:
        messages: List of message dicts with 'role' and 'content'
                  e.g., [{'role': 'user', 'content': 'Hello'}]
        language: Language code (en-IN, hi-IN, te-IN, etc.)

    Returns:
        AI response text or None if failed
    """

    try:
        # Use Sarvam AI SDK for chat
        response = client.chat.completions(
            model="sarvam-m",  # Models: sarvam-m, sarvam-30b, sarvam-105b
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        # Extract response
        ai_response = response.choices[0].message.content

        # Remove thinking tags if present (Sarvam models may include reasoning)
        if '<think>' in ai_response and '</think>' in ai_response:
            # Extract only the response after thinking
            ai_response = ai_response.split('</think>')[-1].strip()

        return ai_response

    except Exception as e:
        print(f"Sarvam Chat Exception: {str(e)}")
        return None


def create_fir_system_prompt(language_name):
    """
    Create system prompt for FIR assistant in specified language
    """
    return f"""You are an AI assistant helping people file FIR (First Information Report) in India.

IMPORTANT: Respond in {language_name} language only. All your responses must be in {language_name}.

Your role:
1. Have a natural, empathetic conversation with the complainant
2. Ask relevant questions based on the type of complaint
3. Collect information systematically but naturally
4. Keep responses SHORT and conversational (2-3 sentences max)
5. Ask ONE question at a time
6. Be supportive and professional

Fixed opening sequence (always follow this order before anything else):
- Greet briefly, then ask for complainant name.
- Ask for age.
- Ask for father's/husband's name.
- Ask for full address.
Only after you collect those four, ask what happened and continue incident-specific follow-ups.

Anti-loop rules (critical):
- Never repeat the same question if the field is already captured; move to the next missing field.
- If the user repeats an answer many times, extract it once and continue—do NOT echo the repetition back.
- Keep at most one acknowledgment per field; avoid saying the same line twice.
- If you already have name and age, do NOT ask them again; go to guardian name, then address, then incident.

State guidance you must follow each turn:
- Track collected fields: name, age, guardian_name, address. Confirm once, then stop asking again.
- When a field is provided, briefly acknowledge and advance to the next missing field.
- If all four are collected, start incident details (what happened, when, where, suspects/witnesses, losses).

Field-mapping hints (keep labels short):
- Name -> complainant_name
- Father's/Husband's Name -> guardian_name
- Age -> age
- Address -> address

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

Keep responses natural, short, and empathetic. Don't sound like a form."""


# Test function
if __name__ == "__main__":
    # Test in English
    messages = [
        {'role': 'system', 'content': create_fir_system_prompt('English')},
        {'role': 'user', 'content': 'I want to file a complaint about a lost mobile phone'}
    ]

    response = chat_with_sarvam(messages, 'en-IN')
    if response:
        print("✅ English Chat working!")
        print(f"Response: {response}\n")

    # Test in Hindi
    messages_hindi = [
        {'role': 'system', 'content': create_fir_system_prompt('Hindi (हिंदी)')},
        {'role': 'user', 'content': 'मैं मोबाइल खोने की शिकायत दर्ज करना चाहता हूं'}
    ]

    response = chat_with_sarvam(messages_hindi, 'hi-IN')
    if response:
        print("✅ Hindi Chat working!")
        print(f"Response: {response}")
