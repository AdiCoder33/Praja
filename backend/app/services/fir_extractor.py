"""
FIR Data Extractor Service
Extracts structured FIR data from conversation history using AI
"""

from ai.sarvam.chat import chat_with_sarvam
import json
import re


class FIRDataExtractor:
    """Extract and validate FIR data from conversation"""

    def __init__(self):
        self.required_fields = {
            'basic': ['complainant_name', 'contact', 'complaint_type'],
            'incident': ['incident_date', 'incident_location', 'description']
        }

    def extract_fir_data(self, conversation_history, language_code='en-IN'):
        """
        Extract FIR data from conversation history using AI

        Args:
            conversation_history: List of conversation messages
            language_code: Language code

        Returns:
            dict: Extracted FIR data with completeness flag
        """

        # Create extraction prompt
        extraction_prompt = self._create_extraction_prompt(conversation_history)

        messages = [
            {'role': 'system', 'content': extraction_prompt},
            {'role': 'user', 'content': 'Extract FIR data from the conversation above.'}
        ]

        # Get AI to extract data
        response = chat_with_sarvam(messages, language_code)

        if not response:
            return {'complete': False, 'data': {}}

        # Parse the JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find raw JSON
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    return {'complete': False, 'data': {}}

            fir_data = json.loads(json_str)

            # Check completeness
            is_complete = self._check_completeness(fir_data)

            return {
                'complete': is_complete,
                'data': fir_data,
                'missing_fields': self._get_missing_fields(fir_data)
            }

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response was: {response}")
            return {'complete': False, 'data': {}}

    def _create_extraction_prompt(self, conversation_history):
        """Create prompt for data extraction"""

        # Build conversation text
        conversation_text = "CONVERSATION:\n"
        for msg in conversation_history:
            role = msg.get('role', 'user')
            content = msg.get('parts', [{}])[0].get('text', '')
            if content:
                speaker = 'AI' if role == 'model' else 'User'
                conversation_text += f"{speaker}: {content}\n"

        return f"""You are an AI data extractor. Extract FIR (First Information Report) information from the conversation below.

{conversation_text}

Extract the following information in JSON format:

{{
    "complainant_name": "full name of complainant",
    "guardian_name": "father's or husband's name",
    "age": "age in years",
    "address": "full address",
    "contact": "phone number",
    "email": "email if mentioned",
    "complaint_type": "type like 'Lost Mobile', 'Theft', 'Cyber Fraud', etc.",
    "incident_date": "date when incident occurred",
    "incident_time": "time if mentioned",
    "incident_location": "exact location where incident happened",
    "description": "brief description of what happened",
    "property_details": true/false,
    "item_description": "description of lost/stolen item",
    "estimated_value": "value in rupees (number only)",
    "serial_number": "IMEI or serial number if applicable",
    "suspect_details": "description of suspect if any",
    "witness_details": "witness information if any"
}}

RULES:
1. Only include fields that were EXPLICITLY mentioned in conversation
2. Use "N/A" for fields not discussed
3. Extract exact values, don't infer or guess
4. Return valid JSON only, no additional text
5. If a field wasn't mentioned, use "N/A" as value

Return ONLY the JSON object, nothing else."""

    def _check_completeness(self, fir_data):
        """Check if all required fields are present"""

        # Check basic required fields
        for field in self.required_fields['basic']:
            value = fir_data.get(field, 'N/A')
            if not value or value == 'N/A' or value.strip() == '':
                return False

        # Check incident fields
        for field in self.required_fields['incident']:
            value = fir_data.get(field, 'N/A')
            if not value or value == 'N/A' or value.strip() == '':
                return False

        # All required fields present
        return True

    def _get_missing_fields(self, fir_data):
        """Get list of missing required fields"""

        missing = []

        for field in self.required_fields['basic'] + self.required_fields['incident']:
            value = fir_data.get(field, 'N/A')
            if not value or value == 'N/A' or value.strip() == '':
                missing.append(field)

        return missing


# Test function
if __name__ == "__main__":
    extractor = FIRDataExtractor()

    # Sample conversation
    sample_conversation = [
        {'role': 'model', 'parts': [{'text': 'What is your name?'}]},
        {'role': 'user', 'parts': [{'text': 'My name is Ravi Kumar'}]},
        {'role': 'model', 'parts': [{'text': 'What is your contact number?'}]},
        {'role': 'user', 'parts': [{'text': '9876543210'}]},
        {'role': 'model', 'parts': [{'text': 'What type of complaint do you want to file?'}]},
        {'role': 'user', 'parts': [{'text': 'I lost my mobile phone'}]},
        {'role': 'model', 'parts': [{'text': 'When did this happen?'}]},
        {'role': 'user', 'parts': [{'text': 'Yesterday around 3 PM'}]},
        {'role': 'model', 'parts': [{'text': 'Where did you lose it?'}]},
        {'role': 'user', 'parts': [{'text': 'At Ameerpet Metro Station in Hyderabad'}]}
    ]

    result = extractor.extract_fir_data(sample_conversation)
    print(f"Complete: {result['complete']}")
    print(f"Data: {json.dumps(result['data'], indent=2)}")
    print(f"Missing: {result['missing_fields']}")
