"""
Test manual PDF generation endpoint
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.fir_extractor import FIRDataExtractor
from app.services.pdf_generator import FIRPDFGenerator

# Sample conversation history
sample_conversation = [
    {'role': 'model', 'parts': [{'text': 'Hello! How can I help you today?'}]},
    {'role': 'user', 'parts': [{'text': 'I want to file a complaint about a lost mobile'}]},
    {'role': 'model', 'parts': [{'text': 'I understand. Can you please tell me your name?'}]},
    {'role': 'user', 'parts': [{'text': 'My name is Rajesh Kumar'}]},
    {'role': 'model', 'parts': [{'text': 'Thank you Rajesh. What is your contact number?'}]},
    {'role': 'user', 'parts': [{'text': '9876543210'}]},
    {'role': 'model', 'parts': [{'text': 'When did you lose your mobile?'}]},
    {'role': 'user', 'parts': [{'text': 'Yesterday around 3 PM'}]},
    {'role': 'model', 'parts': [{'text': 'Where did this happen?'}]},
    {'role': 'user', 'parts': [{'text': 'At Ameerpet Metro Station in Hyderabad'}]},
]

print("Testing manual PDF generation...")
print("=" * 50)

# Extract data
extractor = FIRDataExtractor()
result = extractor.extract_fir_data(sample_conversation, 'en-IN')

print(f"\n✓ Extraction Complete: {result.get('complete', False)}")
print(f"✓ Data extracted: {len(result.get('data', {}))} fields")

if result.get('missing_fields'):
    print(f"⚠ Missing fields: {result.get('missing_fields')}")

# Generate PDF
pdf_generator = FIRPDFGenerator()
pdf_path = pdf_generator.generate_fir_pdf(result['data'])

print(f"\n✅ PDF Generated: {pdf_path}")
print("\nTest completed successfully!")
