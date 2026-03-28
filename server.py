from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# System prompt for FIR assistant
SYSTEM_PROMPT = """You are an AI assistant helping people file FIR (First Information Report) in India.

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
        language = data.get('language', 'en-IN')
        history = data.get('history', [])

        # Initialize model (using lite version for lower quota usage)
        model = genai.GenerativeModel('models/gemini-flash-lite-latest')

        # Create chat with system instruction
        chat = model.start_chat(history=[])

        # Send system prompt first if history is empty
        if not history:
            chat.send_message(SYSTEM_PROMPT)
        else:
            # Rebuild chat history
            for msg in history:
                if msg['role'] == 'user':
                    chat.send_message(msg['parts'][0]['text'])

        # Send user message
        response = chat.send_message(user_message)
        ai_response = response.text

        return jsonify({
            'response': ai_response,
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

if __name__ == '__main__':
    print("🚀 Starting FIR Voice Assistant Server...")
    print("📡 Server will run on http://localhost:5000")
    print("🔑 Make sure your GEMINI_API_KEY is set in .env file")
    app.run(debug=True, host='0.0.0.0', port=5000)
