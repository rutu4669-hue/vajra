#!/usr/bin/env python3
"""
Generate comprehensive project documentation PDF for INDIGO/VAJRA project
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

class ProjectReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._add_custom_styles()
    
    def _add_custom_styles(self):
        """Add custom styles for the project report"""
        # Title Styles
        self.styles.add(ParagraphStyle(
            name='ProjectTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=36
        ))
        
        self.styles.add(ParagraphStyle(
            name='ProjectSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#3b82f6'),
            spaceAfter=25,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=20
        ))
        
        # Section Heading Styles
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=15,
            spaceBefore=25,
            fontName='Helvetica-Bold',
            leading=22,
            background=colors.HexColor('#f1f5f9'),
            borderPadding=8,
            borderColor=colors.HexColor('#3b82f6'),
            borderWidth=2,
            borderStyle='SOLID'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubSectionHeading',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=10,
            spaceBefore=18,
            fontName='Helvetica-Bold',
            leading=18
        ))
        
        # Body Styles
        self.styles.add(ParagraphStyle(
            name='ProjectBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#334155'),
            spaceAfter=10,
            leading=16
        ))
        
        self.styles.add(ParagraphStyle(
            name='CodeBlock',
            parent=self.styles['BodyText'],
            fontSize=9,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=10,
            leftIndent=20,
            rightIndent=20,
            leading=12,
            borderPadding=8,
            borderColor=colors.HexColor('#cbd5e1'),
            borderWidth=1,
            borderStyle='SOLID',
            background=colors.HexColor('#f8fafc'),
            fontName='Courier'
        ))
        
        # Table Styles
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=14
        ))
        
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#334155'),
            fontName='Helvetica',
            alignment=TA_LEFT,
            leading=14
        ))
        
        # Footer Style
        self.styles.add(ParagraphStyle(
            name='ReportFooter',
            parent=self.styles['BodyText'],
            fontSize=9,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER,
            leading=12
        ))
    
    def generate_project_report(self, output_path='project_documentation.pdf'):
        """Generate comprehensive project documentation PDF"""
        buffer = open(output_path, 'wb')
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
        story = []
        
        # Title Page
        story.extend(self._create_title_page())
        story.append(PageBreak())
        
        # Table of Contents
        story.extend(self._create_table_of_contents())
        story.append(PageBreak())
        
        # Project Overview
        story.extend(self._create_project_overview())
        story.append(PageBreak())
        
        # Architecture
        story.extend(self._create_architecture_section())
        story.append(PageBreak())
        
        # Backend Documentation
        story.extend(self._create_backend_section())
        story.append(PageBreak())
        
        # Frontend Documentation
        story.extend(self._create_frontend_section())
        story.append(PageBreak())
        
        # API Documentation
        story.extend(self._create_api_section())
        story.append(PageBreak())
        
        # Services and Integrations
        story.extend(self._create_services_section())
        story.append(PageBreak())
        
        # Database Schema
        story.extend(self._create_database_section())
        story.append(PageBreak())
        
        # Deployment
        story.extend(self._create_deployment_section())
        story.append(PageBreak())
        
        # Security Features
        story.extend(self._create_security_section())
        
        doc.build(story)
        buffer.close()
        print(f"Project documentation PDF generated: {output_path}")
        return output_path
    
    def _create_title_page(self):
        """Create title page"""
        story = []
        
        # Add spacing
        story.append(Spacer(1, 2*inch))
        
        # Main title
        story.append(Paragraph("INDIGO / VAJRA", self.styles['ProjectTitle']))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph("AI Powered Threat Intelligence & Risk Analysis Dashboard", self.styles['ProjectSubtitle']))
        story.append(Spacer(1, 0.5*inch))
        
        # Project info
        info_data = [
            ['Version:', '1.0.0'],
            ['Generated:', datetime.now().strftime('%B %d, %Y at %H:%M:%S')],
            ['Type:', 'Comprehensive Project Documentation'],
            ['Scope:', 'Full Stack Application']
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 4*inch], hAlign='CENTER')
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#475569')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(info_table)
        
        story.append(Spacer(1, 2*inch))
        
        # Footer
        story.append(Paragraph("Confidential - Internal Use Only", self.styles['ReportFooter']))
        
        return story
    
    def _create_table_of_contents(self):
        """Create table of contents"""
        story = []
        
        story.append(Paragraph("Table of Contents", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.3*inch))
        
        toc_data = [
            ['1. Project Overview', 'Page 3'],
            ['2. System Architecture', 'Page 4'],
            ['3. Backend Documentation', 'Page 5'],
            ['4. Frontend Documentation', 'Page 6'],
            ['5. API Documentation', 'Page 7'],
            ['6. Services & Integrations', 'Page 8'],
            ['7. Database Schema', 'Page 9'],
            ['8. Deployment Guide', 'Page 10'],
            ['9. Security Features', 'Page 11']
        ]
        
        toc_table = Table(toc_data, colWidths=[5*inch, 1.5*inch])
        toc_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(toc_table)
        
        return story
    
    def _create_project_overview(self):
        """Create project overview section"""
        story = []
        
        story.append(Paragraph("1. Project Overview", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        overview_text = """
        <b>INDIGO/VAJRA</b> is a comprehensive cybersecurity dashboard providing real-time threat intelligence, 
        ransomware monitoring, and risk analysis capabilities. Built with modern technologies to deliver a 
        production-ready, pixel-perfect user experience with dark theme, blue highlights, and red threat colors.
        
        <b>Key Features:</b>
        • Real-time threat intelligence monitoring
        • Ransomware incident tracking and analysis
        • Live global attack visualization
        • Domain risk analysis and security assessment
        • Executive summary and risk counters
        • Multi-source threat data aggregation
        • PDF report generation
        • WebSocket real-time updates
        """
        
        story.append(Paragraph(overview_text, self.styles['ProjectBody']))
        story.append(Spacer(1, 0.3*inch))
        
        # Tech Stack Table
        story.append(Paragraph("Technology Stack", self.styles['SubSectionHeading']))
        
        tech_data = [
            ['Component', 'Technology'],
            ['Frontend Framework', 'Next.js 15 + React 19'],
            ['Backend Framework', 'FastAPI (Python)'],
            ['Database', 'PostgreSQL'],
            ['Caching', 'Redis'],
            ['Styling', 'TailwindCSS'],
            ['State Management', 'Zustand'],
            ['Charts', 'Recharts'],
            ['Authentication', 'JWT'],
            ['Real-time', 'WebSockets'],
            ['Task Scheduling', 'APScheduler']
        ]
        
        tech_table = Table(tech_data, colWidths=[2.5*inch, 3*inch])
        tech_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(tech_table)
        
        return story
    
    def _create_architecture_section(self):
        """Create architecture section"""
        story = []
        
        story.append(Paragraph("2. System Architecture", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        arch_text = """
        The system follows a modern microservices-inspired architecture with clear separation of concerns:
        
        <b>Frontend Layer:</b>
        • Next.js App Router for server-side rendering
        • React components for UI rendering
        • Zustand for client-side state management
        • Axios for API communication
        
        <b>Backend Layer:</b>
        • FastAPI for RESTful API endpoints
        • SQLAlchemy ORM for database operations
        • Redis for caching and session management
        • WebSocket manager for real-time updates
        
        <b>Data Layer:</b>
        • PostgreSQL for persistent data storage
        • Redis for high-performance caching
        • File system for generated reports
        
        <b>Integration Layer:</b>
        • Third-party API services (AlienVault, VirusTotal, etc.)
        • Background task scheduler
        • WebSocket broadcast system
        """
        
        story.append(Paragraph(arch_text, self.styles['ProjectBody']))
        
        return story
    
    def _create_backend_section(self):
        """Create backend documentation section"""
        story = []
        
        story.append(Paragraph("3. Backend Documentation", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        backend_text = """
        <b>Backend Structure:</b>
        • FastAPI application with modular router architecture
        • JWT-based authentication with refresh tokens
        • PostgreSQL database with SQLAlchemy ORM
        • Redis caching layer for performance optimization
        • WebSocket support for real-time updates
        • APScheduler for background task management
        • Comprehensive error handling and logging
        
        <b>Key Backend Components:</b>
        • main.py - Application entry point and router configuration
        • routes/ - API endpoint definitions (auth, dashboard, threat, ransomware, etc.)
        • services/ - Business logic and third-party integrations
        • models/ - Database models and schema definitions
        • schemas/ - Pydantic schemas for request/response validation
        • middleware/ - Security middleware (rate limiting, CORS, etc.)
        • websocket/ - WebSocket connection management
        • scheduler/ - Background task scheduling
        """
        
        story.append(Paragraph(backend_text, self.styles['ProjectBody']))
        story.append(Spacer(1, 0.3*inch))
        
        # Backend Routes Table
        story.append(Paragraph("API Routes", self.styles['SubSectionHeading']))
        
        routes_data = [
            ['Route', 'Description'],
            ['/api/auth/*', 'Authentication endpoints'],
            ['/api/dashboard/*', 'Dashboard data and statistics'],
            ['/api/threat-intelligence/*', 'Threat intelligence data'],
            ['/api/ransomware/*', 'Ransomware incident tracking'],
            ['/api/news/*', 'Cyber threat news feed'],
            ['/api/reports/*', 'PDF report generation'],
            ['/api/domain-risk/*', 'Domain risk analysis'],
            ['/api/companies/*', 'Company management'],
            ['/ws/dashboard', 'WebSocket for real-time updates']
        ]
        
        routes_table = Table(routes_data, colWidths=[2.5*inch, 3*inch])
        routes_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(routes_table)
        
        return story
    
    def _create_frontend_section(self):
        """Create frontend documentation section"""
        story = []
        
        story.append(Paragraph("4. Frontend Documentation", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        frontend_text = """
        <b>Frontend Structure:</b>
        • Next.js 15 with App Router architecture
        • React 19 for component-based UI
        • TypeScript for type safety
        • TailwindCSS for utility-first styling
        • Framer Motion for animations
        • Lucide Icons for iconography
        • Recharts for data visualization
        • React Simple Maps for geographic data
        
        <b>Key Frontend Pages:</b>
        • / - Main dashboard with threat overview
        • /login - Authentication page
        • /alerts - Critical alerts management
        • /companies - Company and domain analysis
        • /domain-analysis - Deep domain security analysis
        • /threat-intelligence - Threat intelligence dashboard
        • /ransomware - Ransomware incident tracking
        • /global-attacks - Global attack visualization
        • /executive-summary - Executive risk summary
        • /settings - Application settings
        
        <b>Key Components:</b>
        • TopCards - Dashboard summary cards
        • ThreatMap - Interactive global attack map
        • AlertCards - Horizontal scrolling alerts
        • DomainDetails - Comprehensive domain analysis
        • Various chart components for data visualization
        """
        
        story.append(Paragraph(frontend_text, self.styles['ProjectBody']))
        
        return story
    
    def _create_api_section(self):
        """Create API documentation section"""
        story = []
        
        story.append(Paragraph("5. API Documentation", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        api_text = """
        <b>Authentication Endpoints:</b>
        • POST /api/auth/register - Register new user
        • POST /api/auth/login - Login user
        • POST /api/auth/refresh - Refresh access token
        • POST /api/auth/logout - Logout user
        • GET /api/auth/profile - Get user profile
        
        <b>Dashboard Endpoints:</b>
        • GET /api/dashboard/summary - Get dashboard summary
        • GET /api/dashboard/alerts - Get critical alerts
        • GET /api/dashboard/attack-map - Get attack map data
        
        <b>Threat Intelligence Endpoints:</b>
        • GET /api/threat-intelligence - Get threat intelligence data
        • GET /api/threat-intelligence/trend - Get threat trend data
        • GET /api/threat-intelligence/actors - Get threat actors data
        
        <b>Ransomware Endpoints:</b>
        • GET /api/ransomware - Get ransomware incidents
        • GET /api/ransomware/stats - Get ransomware statistics
        
        <b>Report Endpoints:</b>
        • GET /api/reports/threat - Generate threat intelligence report (PDF)
        • GET /api/reports/ransomware - Generate ransomware report (PDF)
        • GET /api/reports/executive - Generate executive summary report (PDF)
        """
        
        story.append(Paragraph(api_text, self.styles['ProjectBody']))
        
        return story
    
    def _create_services_section(self):
        """Create services and integrations section"""
        story = []
        
        story.append(Paragraph("6. Services & Integrations", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        services_text = """
        <b>Third-Party Integrations:</b>
        • AlienVault OTX - Threat intelligence data
        • AbuseIPDB - IP reputation and abuse reporting
        • VirusTotal - Malware and URL analysis
        • ThreatFox - Threat intelligence indicators
        • Shodan - Internet-connected device search
        • NVD (National Vulnerability Database) - CVE data
        • Gridinsoft - Malware analysis
        • SSL Labs - SSL/TLS certificate analysis
        • URLScan.io - URL scanning and analysis
        
        <b>Internal Services:</b>
        • PDF Service - Report generation with ReportLab
        • Dashboard Service - Dashboard data aggregation
        • Threat Service - Threat intelligence processing
        • Ransomware Service - Ransomware data management
        • Domain Analysis Service - Domain security analysis
        • WebSocket Manager - Real-time connection management
        • Activity Logger - User activity tracking
        """
        
        story.append(Paragraph(services_text, self.styles['ProjectBody']))
        story.append(Spacer(1, 0.3*inch))
        
        # Background Tasks Table
        story.append(Paragraph("Background Tasks", self.styles['SubSectionHeading']))
        
        tasks_data = [
            ['Task', 'Frequency', 'Description'],
            ['Ransomware Data Fetch', 'Every 15 minutes', 'Fetch ransomware incidents from threat-ransomware.live'],
            ['Threat Intelligence Refresh', 'Every 30 minutes', 'Update threat indicators from AlienVault OTX'],
            ['Dashboard Stats Refresh', 'Every 5 minutes', 'Refresh dashboard statistics'],
            ['Activity Logging', 'Continuous', 'Track user activities and system events']
        ]
        
        tasks_table = Table(tasks_data, colWidths=[2*inch, 1.5*inch, 2*inch])
        tasks_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(tasks_table)
        
        return story
    
    def _create_database_section(self):
        """Create database schema section"""
        story = []
        
        story.append(Paragraph("7. Database Schema", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        db_text = """
        <b>Database Tables:</b>
        • users - User accounts and authentication data
        • alerts - Critical security alerts and notifications
        • threat_feeds - Threat intelligence feed sources
        • attack_map - Geographic attack data for visualization
        • attack_events - Individual attack event records
        • threat_scores - Calculated threat scores and metrics
        • ransomware_groups - Known ransomware group information
        • ransomware_incidents - Ransomware attack incident records
        • countries - Country data for attack mapping
        • news - Cyber threat news articles
        • reports - Generated report metadata
        • activity_logs - User activity tracking logs
        • companies - Monitored companies and domains
        • domain_analysis - Domain analysis results
        
        <b>Database Technologies:</b>
        • PostgreSQL 15+ - Primary relational database
        • Redis 7+ - Caching layer and session storage
        • SQLAlchemy ORM - Database interaction layer
        """
        
        story.append(Paragraph(db_text, self.styles['ProjectBody']))
        
        return story
    
    def _create_deployment_section(self):
        """Create deployment guide section"""
        story = []
        
        story.append(Paragraph("8. Deployment Guide", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        deployment_text = """
        <b>Docker Deployment:</b>
        The project includes Docker support for containerized deployment:
        
        1. Build and start all services:
           docker-compose up -d --build
        
        2. Access the application:
           • Frontend: http://localhost:3000
           • Backend API: http://localhost:8000
           • API Documentation: http://localhost:8000/docs
        
        <b>Local Development:</b>
        
        Backend Setup:
        • cd backend
        • python -m venv venv
        • source venv/bin/activate
        • pip install -r requirements.txt
        • uvicorn main:app --reload
        
        Frontend Setup:
        • cd frontend
        • npm install
        • npm run dev
        
        <b>Environment Configuration:</b>
        Required environment variables are defined in .env.example files for both backend and frontend.
        """
        
        story.append(Paragraph(deployment_text, self.styles['ProjectBody']))
        
        return story
    
    def _create_security_section(self):
        """Create security features section"""
        story = []
        
        story.append(Paragraph("9. Security Features", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        security_text = """
        <b>Authentication & Authorization:</b>
        • JWT-based authentication with access and refresh tokens
        • Password hashing with bcrypt
        • Token expiration and refresh mechanism
        • User profile management
        
        <b>API Security:</b>
        • Rate limiting with slowapi
        • CORS configuration for cross-origin requests
        • Security headers (CSP, XSS protection, etc.)
        • Input validation with Pydantic schemas
        • SQL injection prevention via ORM
        
        <b>Data Security:</b>
        • Encrypted password storage
        • Secure session management with Redis
        • Environment variable configuration for sensitive data
        • Database connection encryption
        
        <b>Monitoring & Logging:</b>
        • Comprehensive application logging
        • Activity logging for user actions
        • Error tracking and reporting
        • WebSocket connection monitoring
        """
        
        story.append(Paragraph(security_text, self.styles['ProjectBody']))
        story.append(Spacer(1, 0.5*inch))
        
        # Footer
        story.append(Paragraph("End of Project Documentation", self.styles['ReportFooter']))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}", self.styles['ReportFooter']))
        
        return story

if __name__ == "__main__":
    generator = ProjectReportGenerator()
    output_file = generator.generate_project_report('INDIGO_Project_Documentation.pdf')
    print(f"✓ Project documentation PDF generated successfully: {output_file}")
