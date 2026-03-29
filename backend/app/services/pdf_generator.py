"""
PDF Generator Service for FIR Reports
Generates templated FIR PDF documents
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import os
import uuid

class FIRPDFGenerator:
    """Generate FIR PDF documents"""

    def __init__(self):
        self.output_dir = os.path.join(os.path.dirname(__file__), '../../generated_firs')
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_fir_pdf(self, fir_data):
        """
        Generate FIR PDF from collected data

        Args:
            fir_data: Dictionary containing FIR details

        Returns:
            str: Path to generated PDF file
        """

        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"FIR_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=A4,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=18)

        # Container for PDF elements
        elements = []

        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1  # Center
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#333333'),
            spaceAfter=12,
            spaceBefore=12
        )

        normal_style = styles['Normal']

        # Header
        elements.append(Paragraph("FIRST INFORMATION REPORT (FIR)", title_style))
        elements.append(Paragraph("As per Section 154 Cr.P.C.", styles['Normal']))
        elements.append(Spacer(1, 20))

        # FIR Number and Date Table
        header_data = [
            ['FIR No:', fir_data.get('fir_number', 'Auto-Generated'),
             'Date:', datetime.now().strftime("%d/%m/%Y")],
            ['Police Station:', fir_data.get('police_station', 'To be assigned'),
             'District:', fir_data.get('district', 'To be assigned')]
        ]

        header_table = Table(header_data, colWidths=[1.5*inch, 2*inch, 1*inch, 1.5*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(header_table)
        elements.append(Spacer(1, 20))

        # Section 1: Complainant Details
        elements.append(Paragraph("1. COMPLAINANT DETAILS", heading_style))

        complainant_data = [
            ['Name:', fir_data.get('complainant_name', 'N/A')],
            ['Father\'s/Husband\'s Name:', fir_data.get('guardian_name', 'N/A')],
            ['Age:', fir_data.get('age', 'N/A')],
            ['Address:', fir_data.get('address', 'N/A')],
            ['Contact Number:', fir_data.get('contact', 'N/A')],
            ['Email:', fir_data.get('email', 'N/A')]
        ]

        complainant_table = Table(complainant_data, colWidths=[2*inch, 4*inch])
        complainant_table.setStyle(self._get_table_style())
        elements.append(complainant_table)
        elements.append(Spacer(1, 15))

        # Section 2: Incident Details
        elements.append(Paragraph("2. INCIDENT DETAILS", heading_style))

        incident_data = [
            ['Type of Complaint:', fir_data.get('complaint_type', 'N/A')],
            ['Date of Incident:', fir_data.get('incident_date', 'N/A')],
            ['Time of Incident:', fir_data.get('incident_time', 'N/A')],
            ['Place of Incident:', fir_data.get('incident_location', 'N/A')]
        ]

        incident_table = Table(incident_data, colWidths=[2*inch, 4*inch])
        incident_table.setStyle(self._get_table_style())
        elements.append(incident_table)
        elements.append(Spacer(1, 15))

        # Section 3: Description of Incident
        elements.append(Paragraph("3. DESCRIPTION OF INCIDENT", heading_style))
        description = fir_data.get('description', 'No description provided')
        elements.append(Paragraph(description, normal_style))
        elements.append(Spacer(1, 15))

        # Section 4: Lost/Stolen Property Details (if applicable)
        if fir_data.get('property_details'):
            elements.append(Paragraph("4. PROPERTY DETAILS", heading_style))

            property_data = [
                ['Item Description:', fir_data.get('item_description', 'N/A')],
                ['Estimated Value:', f"₹ {fir_data.get('estimated_value', '0')}"],
                ['Serial/IMEI Number:', fir_data.get('serial_number', 'N/A')]
            ]

            property_table = Table(property_data, colWidths=[2*inch, 4*inch])
            property_table.setStyle(self._get_table_style())
            elements.append(property_table)
            elements.append(Spacer(1, 15))

        # Section 5: Suspect Details (if any)
        if fir_data.get('suspect_details'):
            elements.append(Paragraph("5. SUSPECT INFORMATION", heading_style))
            elements.append(Paragraph(fir_data.get('suspect_details', 'No suspects identified'), normal_style))
            elements.append(Spacer(1, 15))

        # Section 6: Witness Details (if any)
        if fir_data.get('witness_details'):
            elements.append(Paragraph("6. WITNESS INFORMATION", heading_style))
            elements.append(Paragraph(fir_data.get('witness_details', 'No witnesses'), normal_style))
            elements.append(Spacer(1, 15))

        # Footer - Declaration
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("DECLARATION", heading_style))
        declaration = """I hereby declare that the information provided above is true to the best of my knowledge
        and belief. I understand that providing false information is a punishable offense."""
        elements.append(Paragraph(declaration, normal_style))
        elements.append(Spacer(1, 30))

        # Signature section
        signature_data = [
            ['Complainant Signature:', '_' * 40, 'Date:', '_' * 20],
            ['', '', '', ''],
            ['Police Officer Name:', '_' * 40, 'Signature:', '_' * 20]
        ]

        signature_table = Table(signature_data, colWidths=[1.8*inch, 2.2*inch, 1*inch, 2*inch])
        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (-1, -1), 8)
        ]))
        elements.append(signature_table)

        # Footer note
        elements.append(Spacer(1, 30))
        footer_note = f"<i>Generated by AI FIR Assistant on {datetime.now().strftime('%d %B %Y at %I:%M %p')}</i>"
        elements.append(Paragraph(footer_note, styles['Italic']))

        # Build PDF
        doc.build(elements)

        return filepath

    def _get_table_style(self):
        """Return standard table style"""
        return TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ])

    def get_pdf_path(self, filename):
        """Get full path for a PDF file"""
        return os.path.join(self.output_dir, filename)


# Test function
if __name__ == "__main__":
    # Test PDF generation
    generator = FIRPDFGenerator()

    sample_data = {
        'fir_number': 'AUTO-2024-001',
        'police_station': 'Cyber Crime Police Station',
        'district': 'Hyderabad',
        'complainant_name': 'Test User',
        'guardian_name': 'Test Guardian',
        'age': '30',
        'address': '123, Test Street, Hyderabad, Telangana - 500001',
        'contact': '+91 9876543210',
        'email': 'test@example.com',
        'complaint_type': 'Lost Mobile Phone',
        'incident_date': '25/03/2024',
        'incident_time': '02:30 PM',
        'incident_location': 'Ameerpet Metro Station, Hyderabad',
        'description': 'I lost my mobile phone while traveling in the metro. I realized it was missing when I got down at Ameerpet station.',
        'property_details': True,
        'item_description': 'Samsung Galaxy S23 (Black Color)',
        'estimated_value': '65000',
        'serial_number': '123456789012345',
        'suspect_details': 'No suspects identified',
        'witness_details': 'No witnesses'
    }

    pdf_path = generator.generate_fir_pdf(sample_data)
    print(f"✅ Test PDF generated: {pdf_path}")
