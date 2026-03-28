"""
Chat API endpoint for FIR assistant
"""

from flask import Blueprint, request, jsonify
from app.services.fir_service import FIRService

bp = Blueprint('chat', __name__)
fir_service = FIRService()

@bp.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        user_message = data.get('message', '')
        language_code = data.get('language', 'en-IN')
        history = data.get('history', [])

        if not user_message:
            return jsonify({
                'response': 'Please provide a message',
                'status': 'error'
            }), 400

        # Process through FIR service
        result = fir_service.process_message(user_message, language_code, history)

        return jsonify(result)

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'response': 'I apologize, but I encountered an error. Please try again.',
            'status': 'error',
            'error': str(e)
        }), 500
