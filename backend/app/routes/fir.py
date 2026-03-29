"""
FIR PDF download and generation endpoints
"""

from flask import Blueprint, send_file, jsonify, request
from app.services.fir_extractor import FIRDataExtractor
from app.services.pdf_generator import FIRPDFGenerator
import os

bp = Blueprint('fir', __name__)

# Initialize services
extractor = FIRDataExtractor()
pdf_generator = FIRPDFGenerator()

@bp.route('/api/fir/download/<filename>', methods=['GET'])
def download_fir(filename):
    """Download generated FIR PDF"""
    try:
        # Security: Validate filename to prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({
                'error': 'Invalid filename',
                'status': 'error'
            }), 400

        # Get PDF path
        pdf_dir = os.path.join(os.path.dirname(__file__), '../../generated_firs')
        pdf_path = os.path.join(pdf_dir, filename)

        # Check if file exists
        if not os.path.exists(pdf_path):
            return jsonify({
                'error': 'PDF not found',
                'status': 'error'
            }), 404

        # Send file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        print(f"Error downloading PDF: {str(e)}")
        return jsonify({
            'error': 'Failed to download PDF',
            'status': 'error'
        }), 500


@bp.route('/api/fir/generate', methods=['POST'])
def generate_fir():
    """Generate FIR PDF from conversation history on demand"""
    try:
        data = request.json
        history = data.get('history', [])
        language_code = data.get('language', 'en-IN')

        if not history or len(history) == 0:
            return jsonify({
                'error': 'No conversation history provided',
                'status': 'error'
            }), 400

        print(f"📥 Received {len(history)} messages for PDF generation")
        print(f"   Language: {language_code}")

        # Extract FIR data from conversation
        extraction_result = extractor.extract_fir_data(history, language_code)
        fir_data = extraction_result.get('data', {})

        print(f"📊 Extracted data: {fir_data}")

        # If extraction completely failed, create basic data from conversation
        if not fir_data or len(fir_data) == 0:
            print("⚠️ AI extraction failed, creating basic data from conversation")
            fir_data = create_basic_fir_data(history)

        # Generate PDF even if incomplete
        pdf_path = pdf_generator.generate_fir_pdf(fir_data)
        pdf_filename = os.path.basename(pdf_path)

        print(f"✅ Manual PDF generated: {pdf_filename}")
        print(f"   Complete: {extraction_result.get('complete', False)}")
        if extraction_result.get('missing_fields'):
            print(f"   Missing: {extraction_result.get('missing_fields')}")

        return jsonify({
            'status': 'success',
            'pdf_filename': pdf_filename,
            'complete': extraction_result.get('complete', False),
            'missing_fields': extraction_result.get('missing_fields', [])
        })

    except Exception as e:
        print(f"Error generating FIR PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Failed to generate PDF: {str(e)}',
            'status': 'error'
        }), 500


def create_basic_fir_data(history):
    """Create basic FIR data from conversation when AI extraction fails"""
    # Combine all user messages as description
    user_messages = []
    ai_messages = []

    for msg in history:
        role = msg.get('role', 'user')
        parts = msg.get('parts', [])
        if parts and len(parts) > 0:
            text = parts[0].get('text', '')
            if role == 'user':
                user_messages.append(text)
            else:
                ai_messages.append(text)

    description = "User complaint:\n" + "\n".join(user_messages)

    return {
        'complainant_name': 'N/A',
        'contact': 'N/A',
        'complaint_type': 'General Complaint',
        'incident_date': 'N/A',
        'incident_location': 'N/A',
        'description': description,
        'property_details': False
    }
