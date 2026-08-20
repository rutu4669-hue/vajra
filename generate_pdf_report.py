import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_vajra_pdf_report():
    pdf_path_artifact = "/Users/surajmujumdar/.gemini/antigravity-ide/brain/78a87757-f334-4d6c-a21d-c1e6a6ecfbec/VAJRA_Threat_Intelligence_Ransomware_Report.pdf"
    pdf_path_workspace = "/Users/surajmujumdar/Desktop/indigo/new/INDIGO/VAJRA_Threat_Intelligence_Ransomware_Report.pdf"
    pdf_path_public = "/Users/surajmujumdar/Desktop/indigo/new/INDIGO/frontend/public/VAJRA_Threat_Intelligence_Ransomware_Report.pdf"

    doc = SimpleDocTemplate(
        pdf_path_workspace,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    COLOR_PRIMARY = colors.HexColor('#0F172A')     # Navy Slate
    COLOR_ACCENT = colors.HexColor('#2563EB')      # Blue
    COLOR_DANGER = colors.HexColor('#DC2626')      # Red
    COLOR_WARNING = colors.HexColor('#D97706')     # Amber
    COLOR_TEXT = colors.HexColor('#334155')        # Slate Text
    COLOR_BG_LIGHT = colors.HexColor('#F8FAFC')    # Light Slate

    # Styles
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=COLOR_PRIMARY,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=COLOR_ACCENT,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    style_heading1 = ParagraphStyle(
        'H1',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        textColor=COLOR_PRIMARY,
        fontName='Helvetica-Bold',
        spaceBefore=15,
        spaceAfter=8
    )

    style_heading2 = ParagraphStyle(
        'H2',
        parent=styles['Heading3'],
        fontSize=12,
        leading=16,
        textColor=COLOR_ACCENT,
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=5
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=COLOR_TEXT,
        fontName='Helvetica',
        spaceAfter=6
    )

    style_bullet = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=COLOR_TEXT,
        fontName='Helvetica',
        leftIndent=15,
        spaceAfter=4
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("🛡️ VAJRA AI THREAT INTELLIGENCE PLATFORM", style_title))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Ransomware Intelligence, Enterprise Use Cases & C-Suite Benefits Report", style_subtitle))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=COLOR_ACCENT, spaceBefore=5, spaceAfter=15))

    # Executive Overview
    elements.append(Paragraph("1. Executive Summary", style_heading1))
    elements.append(Paragraph(
        "This strategic report presents the operational capabilities and business ROI of the <b>VAJRA AI Threat Intelligence Platform</b>. "
        "Built specifically for modern enterprise SecOps and C-Suite leadership, VAJRA unifies 9 real-time telemetry sources into an automated "
        "perimeter defense engine. By continuously auditing domain security scores (0–100), SSL/TLS certificate chains, unpatched NIST NVD vulnerabilities, "
        "and active Ransomware-as-a-Service (RaaS) victim announcements, VAJRA shifts enterprise security from reactive incident cleanup to proactive threat prevention.",
        style_body
    ))
    elements.append(Spacer(1, 10))

    # Threat Landscape & Ransomware Focus
    elements.append(Paragraph("2. The Escalating Ransomware Crisis & Live Intelligence", style_heading1))
    elements.append(Paragraph(
        "Modern ransomware syndicates operate as highly organized RaaS enterprises executing <b>double-extortion attacks</b>—exfiltrating sensitive corporate IP "
        "prior to locking infrastructure. Average downtime costs now exceed <b>$1.85 Million</b> per incident, excluding reputational loss and compliance fines.",
        style_body
    ))
    
    r_data = [
        [Paragraph("<b>Threat Group</b>", style_bullet), Paragraph("<b>Target Sector</b>", style_bullet), Paragraph("<b>Attack TTP</b>", style_bullet), Paragraph("<b>Severity</b>", style_bullet)],
        [Paragraph("LockBit 3.0", style_body), Paragraph("Aviation & Logistics", style_body), Paragraph("Credential theft & RDP exploit", style_body), Paragraph("<font color='#DC2626'><b>HIGH</b></font>", style_body)],
        [Paragraph("BlackCat / ALPHV", style_body), Paragraph("Healthcare & Finance", style_body), Paragraph("Data exfiltration + double extortion", style_body), Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", style_body)],
        [Paragraph("Cl0p", style_body), Paragraph("Managed Service Providers", style_body), Paragraph("Zero-day vulnerability exploitation", style_body), Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", style_body)],
        [Paragraph("Akira", style_body), Paragraph("Commercial Real Estate", style_body), Paragraph("VPN gateway compromise", style_body), Paragraph("<font color='#D97706'><b>MEDIUM</b></font>", style_body)]
    ]
    r_table = Table(r_data, colWidths=[110, 140, 190, 80])
    r_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_BG_LIGHT),
        ('TEXTCOLOR', (0,0), (-1,0), COLOR_PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1'))
    ]))
    elements.append(r_table)
    elements.append(Spacer(1, 15))

    # Key Use Cases
    elements.append(Paragraph("3. Real-World Enterprise Use Cases", style_heading1))
    
    elements.append(Paragraph("✈️ Use Case 1: Aviation & Transportation Security (e.g., IndiGo Airlines)", style_heading2))
    elements.append(Paragraph("• <b>Challenge</b>: Passenger booking portals, flight APIs, and subdomains process millions of transactions daily, making them prime targets for ransomware and credential stuffing.", style_bullet))
    elements.append(Paragraph("• <b>VAJRA Solution</b>: Continuous parallel inspection of primary domains ('goindigo.in') auditing SSL certificate validity, active AbuseIPDB scores, and open NVD CVEs.", style_bullet))
    elements.append(Paragraph("• <b>Outcome</b>: Detects untrusted certificates, expired subdomains, and zero-day vulnerabilities before cybercriminals launch operational disruption attacks.", style_bullet))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("⚡ Use Case 2: SOC Operations & Executive Briefing Automation", style_heading2))
    elements.append(Paragraph("• <b>Challenge</b>: SOC analysts lose valuable hours during incidents manually querying disparate threat databases and assembling executive briefings.", style_bullet))
    elements.append(Paragraph("• <b>VAJRA Solution</b>: 5-Tab Deep Domain Inspection (Overview, Threats, CVEs, SSL Audit, DNS) paired with one-click automated PDF export engine.", style_bullet))
    elements.append(Paragraph("• <b>Outcome</b>: <b>90% reduction in investigation time</b> and instant publication of board-ready executive summaries.", style_bullet))
    elements.append(Spacer(1, 15))

    # Strategic Benefits
    elements.append(Paragraph("4. Strategic Benefits for CISO & Executive Leadership", style_heading1))
    elements.append(Paragraph("1. <b>Proactive Threat Mitigation</b>: Neutralizes perimeter risks (expired TLS certificates, high AbuseIPDB scores, unpatched CVEs) before ransomware deployment.", style_bullet))
    elements.append(Paragraph("2. <b>Consolidated 9-Feed Telemetry</b>: Ingests NVD, AlienVault OTX, Ransomware.live, URLScan, VirusTotal, AbuseIPDB, WHOIS, DNS, and TLS sockets into one platform.", style_bullet))
    elements.append(Paragraph("3. <b>Boardroom & C-Suite Transparency</b>: Standardized 0–100 Security Risk Scores provide clear, defensible metrics for executive board meetings.", style_bullet))
    elements.append(Paragraph("4. <b>Supply Chain Security</b>: Continuous third-party vendor domain auditing prevents vendor-side lateral breaches.", style_bullet))
    elements.append(Spacer(1, 20))

    # Footer Signoff
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=10, spaceAfter=10))
    elements.append(Paragraph("Report Generated by VAJRA AI Threat Intelligence Platform • Confidential Executive Briefing", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.HexColor('#94A3B8'))))

    # Build Document
    doc.build(elements)

    # Copy to artifact & public folders
    import shutil
    shutil.copy(pdf_path_workspace, pdf_path_artifact)
    shutil.copy(pdf_path_workspace, pdf_path_public)
    print("✅ VAJRA PDF Report generated successfully!")

if __name__ == "__main__":
    create_vajra_pdf_report()
