#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
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

def create_model_tables(story, styles):
    """Create tables for model relationships"""
    
    # User Model Table
    story.append(Paragraph("User Model Structure", styles['Heading3']))
    user_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['email', 'String', 'Unique, Indexed'],
        ['name', 'String', 'User Name'],
        ['hashed_password', 'String', 'Hashed Password'],
        ['role', 'String', 'SOC Analyst (default)'],
        ['is_active', 'Boolean', 'Active Status'],
        ['created_at', 'DateTime', 'Creation Timestamp'],
        ['updated_at', 'DateTime', 'Update Timestamp']
    ]
    user_table = Table(user_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    user_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(user_table)
    story.append(Spacer(1, 12))
    
    # Company Model Table
    story.append(Paragraph("Company Model Structure", styles['Heading3']))
    company_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['name', 'String', 'Company Name'],
        ['domain', 'String', 'Unique Domain'],
        ['industry', 'String', 'Industry Type'],
        ['description', 'Text', 'Company Description'],
        ['logo_url', 'String', 'Logo URL'],
        ['is_active', 'Boolean', 'Active Status'],
        ['monitoring_enabled', 'Boolean', 'Monitoring Status'],
        ['created_at', 'DateTime', 'Creation Timestamp'],
        ['updated_at', 'DateTime', 'Update Timestamp'],
        ['last_analyzed', 'DateTime', 'Last Analysis']
    ]
    company_table = Table(company_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    company_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(company_table)
    story.append(Spacer(1, 12))
    
    # CompanyThreat Model Table
    story.append(Paragraph("CompanyThreat Model Structure", styles['Heading3']))
    threat_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['company_id', 'Integer', 'Foreign Key (companies)'],
        ['threat_type', 'String', 'Threat Type'],
        ['severity', 'String', 'LOW/MEDIUM/HIGH/CRITICAL'],
        ['description', 'Text', 'Threat Description'],
        ['source', 'String', 'Threat Source'],
        ['confidence_score', 'Integer', '0-100 Confidence'],
        ['status', 'String', 'ACTIVE/RESOLVED/IGNORED'],
        ['first_seen', 'DateTime', 'First Detection'],
        ['last_seen', 'DateTime', 'Last Detection'],
        ['created_at', 'DateTime', 'Creation Timestamp'],
        ['updated_at', 'DateTime', 'Update Timestamp']
    ]
    threat_table = Table(threat_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    threat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(threat_table)
    story.append(Spacer(1, 12))
    
    # CompanyRiskAssessment Model Table
    story.append(Paragraph("CompanyRiskAssessment Model Structure", styles['Heading3']))
    risk_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['company_id', 'Integer', 'Foreign Key (companies)'],
        ['risk_level', 'String', 'LOW/MEDIUM/HIGH/CRITICAL'],
        ['security_score', 'Integer', '0-100 Score'],
        ['active_incidents', 'Integer', 'Active Incident Count'],
        ['abuse_confidence_score', 'Integer', 'Abuse Confidence'],
        ['reputation_score', 'Integer', 'Reputation Score'],
        ['vulnerabilities_count', 'Integer', 'Vulnerability Count'],
        ['ssl_valid', 'Boolean', 'SSL Certificate Status'],
        ['domain_age_days', 'Integer', 'Domain Age in Days'],
        ['country', 'String', 'Country'],
        ['isp', 'String', 'ISP/Provider'],
        ['assessment_details', 'Text', 'Additional Details (JSON)'],
        ['created_at', 'DateTime', 'Creation Timestamp'],
        ['updated_at', 'DateTime', 'Update Timestamp']
    ]
    risk_table = Table(risk_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 12))
    
    # Alert Model Table
    story.append(Paragraph("Alert Model Structure", styles['Heading3']))
    alert_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['title', 'String', 'Alert Title'],
        ['severity', 'String', 'critical/high/medium/low'],
        ['description', 'Text', 'Alert Description'],
        ['source', 'String', 'Alert Source'],
        ['time', 'String', 'Alert Time'],
        ['created_at', 'DateTime', 'Creation Timestamp']
    ]
    alert_table = Table(alert_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(alert_table)
    story.append(Spacer(1, 12))
    
    # RansomwareIncident Model Table
    story.append(Paragraph("RansomwareIncident Model Structure", styles['Heading3']))
    ransomware_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['group_name', 'String', 'Ransomware Group'],
        ['target', 'String', 'Target Organization'],
        ['country', 'String', 'Target Country'],
        ['published_date', 'DateTime', 'Publication Date'],
        ['impact', 'String', 'Critical/High/Medium/Low'],
        ['status', 'String', 'Published Status'],
        ['description', 'Text', 'Incident Description'],
        ['created_at', 'DateTime', 'Creation Timestamp']
    ]
    ransomware_table = Table(ransomware_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    ransomware_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(ransomware_table)
    story.append(Spacer(1, 12))
    
    # AttackEvent Model Table
    story.append(Paragraph("AttackEvent Model Structure", styles['Heading3']))
    attack_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['event_type', 'String', 'Attack Event Type'],
        ['source_ip', 'String', 'Source IP Address'],
        ['target_ip', 'String', 'Target IP Address'],
        ['source_country', 'String', 'Source Country'],
        ['target_country', 'String', 'Target Country'],
        ['attack_vector', 'String', 'Attack Vector'],
        ['severity', 'String', 'Severity Level'],
        ['description', 'Text', 'Event Description'],
        ['timestamp', 'DateTime', 'Event Timestamp']
    ]
    attack_table = Table(attack_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    attack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(attack_table)
    story.append(Spacer(1, 12))
    
    # ActivityLog Model Table
    story.append(Paragraph("ActivityLog Model Structure", styles['Heading3']))
    activity_data = [
        ['Field', 'Type', 'Description'],
        ['id', 'Integer', 'Primary Key'],
        ['user_id', 'Integer', 'User ID'],
        ['action', 'String', 'User Action'],
        ['resource', 'String', 'Affected Resource'],
        ['details', 'Text', 'Action Details'],
        ['ip_address', 'String', 'IP Address'],
        ['timestamp', 'DateTime', 'Action Timestamp']
    ]
    activity_table = Table(activity_data, colWidths=[2*inch, 1.5*inch, 2.5*inch])
    activity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.black),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8)
    ]))
    story.append(activity_table)
    story.append(Spacer(1, 12))

def create_pdf():
    # Read markdown file
    with open('MODEL_WORKFLOW_DIAGRAM.md', 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF
    doc = SimpleDocTemplate('MODEL_WORKFLOW_DIAGRAM.pdf', pagesize=A4, 
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
    story.append(Paragraph("VAJRA Security Platform - Complete Model Workflow", styles['Heading1']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("This document shows the complete database model architecture, relationships, and data flow for all models in the VAJRA Security Platform.", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Parse markdown and create paragraphs
    story.extend(parse_markdown_to_paragraphs(md_content, styles))
    
    # Add page break and model tables
    story.append(PageBreak())
    story.append(Paragraph("Database Model Structures", styles['Heading1']))
    story.append(Spacer(1, 20))
    
    create_model_tables(story, styles)
    
    # Build PDF
    doc.build(story)
    print("PDF generated successfully: MODEL_WORKFLOW_DIAGRAM.pdf")

if __name__ == "__main__":
    create_pdf()
