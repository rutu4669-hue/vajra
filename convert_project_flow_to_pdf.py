#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import re

def parse_markdown_to_paragraphs(md_content, styles):
    """Parse markdown content and convert to reportlab paragraphs"""
    paragraphs = []
    lines = md_content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            paragraphs.append(Spacer(1, 12))
            continue
            
        # Headers
        if line.startswith('# '):
            text = line[2:].strip()
            paragraphs.append(Paragraph(text, styles['Heading1']))
            paragraphs.append(Spacer(1, 12))
        elif line.startswith('## '):
            text = line[3:].strip()
            paragraphs.append(Paragraph(text, styles['Heading2']))
            paragraphs.append(Spacer(1, 8))
        elif line.startswith('### '):
            text = line[4:].strip()
            paragraphs.append(Paragraph(text, styles['Heading3']))
            paragraphs.append(Spacer(1, 6))
        # Code blocks (skip mermaid diagrams)
        elif line.startswith('```'):
            continue
        # Lists
        elif line.startswith('- '):
            text = line[2:].strip()
            paragraphs.append(Paragraph(f"• {text}", styles['Normal']))
        elif line.startswith('* '):
            text = line[2:].strip()
            paragraphs.append(Paragraph(f"• {text}", styles['Normal']))
        elif line.startswith('├──'):
            text = line[4:].strip()
            paragraphs.append(Paragraph(f"  └── {text}", styles['Code']))
        elif line.startswith('│   '):
            text = line[4:].strip()
            paragraphs.append(Paragraph(f"      {text}", styles['Code']))
        elif line.startswith('└──'):
            text = line[4:].strip()
            paragraphs.append(Paragraph(f"  └── {text}", styles['Code']))
        # Regular text
        else:
            # Handle inline code
            line = re.sub(r'`([^`]+)`', r'<font face="Courier">\1</font>', line)
            paragraphs.append(Paragraph(line, styles['Normal']))
    
    return paragraphs

def create_pdf():
    # Read markdown file
    with open('PROJECT_DATA_FLOW_DIAGRAM.md', 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF
    doc = SimpleDocTemplate('PROJECT_DATA_FLOW_DIAGRAM.pdf', pagesize=A4, 
                           rightMargin=72, leftMargin=72, 
                           topMargin=72, bottomMargin=36)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Modify existing styles
    styles['Heading1'].fontSize = 16
    styles['Heading1'].textColor = colors.black
    styles['Heading1'].spaceAfter = 20
    styles['Heading1'].fontName = 'Helvetica-Bold'
    
    styles['Heading2'].fontSize = 14
    styles['Heading2'].textColor = colors.black
    styles['Heading2'].spaceAfter = 12
    styles['Heading2'].fontName = 'Helvetica-Bold'
    
    styles['Heading3'].fontSize = 12
    styles['Heading3'].textColor = colors.black
    styles['Heading3'].spaceAfter = 8
    styles['Heading3'].fontName = 'Helvetica-Bold'
    
    styles['Normal'].fontSize = 10
    styles['Normal'].textColor = colors.black
    styles['Normal'].spaceAfter = 6
    styles['Normal'].fontName = 'Helvetica'
    styles['Normal'].leading = 14
    
    # Modify code style
    if 'Code' in styles:
        styles['Code'].fontSize = 9
        styles['Code'].textColor = colors.black
        styles['Code'].fontName = 'Courier'
        styles['Code'].leftIndent = 20
        styles['Code'].spaceAfter = 4
    else:
        styles.add(ParagraphStyle(
            name='Code',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.black,
            fontName='Courier',
            leftIndent=20,
            spaceAfter=4
        ))
    
    # Add title
    story = []
    story.append(Paragraph("VAJRA Security Platform - Complete Data Flow Diagram", styles['Heading1']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("This document shows the complete data flow from user login through all system modules to logout.", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Parse markdown and create paragraphs
    story.extend(parse_markdown_to_paragraphs(md_content, styles))
    
    # Build PDF
    doc.build(story)
    print("PDF generated successfully: PROJECT_DATA_FLOW_DIAGRAM.pdf")

if __name__ == "__main__":
    create_pdf()
