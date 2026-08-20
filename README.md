# VAJRA

AI Powered Threat Intelligence & Risk Analysis Dashboard

## Overview

The VAJRA is a comprehensive cybersecurity dashboard that provides real-time threat intelligence, ransomware monitoring, and risk analysis. Built with modern technologies to deliver a production-ready, pixel-perfect user experience with dark theme, blue highlights, and red threat colors.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide Icons** - Icon library
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Charting library
- **React Simple Maps** - Interactive maps
- **Zustand** - State management

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **Redis** - Caching layer
- **WebSockets** - Real-time communication
- **APScheduler** - Background task scheduling

### Security
- **JWT** - Authentication with access and refresh tokens
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Security Headers** - Helmet-like protection

## Features

### Core Modules
1. **Threat Intelligence** - Real-time threat monitoring and analysis
2. **Threat-Ransomware.live** - Ransomware incident tracking

### Dashboard Components
- **Live Global Attack Map** - Animated attack visualization with country targeting
- **Critical Alerts** - Horizontal scrolling alert cards with severity badges
- **Threat Intelligence Summary** - Threat scores, trends, and IOC counts
- **Ransomware Live Table** - Detailed ransomware incident data
- **Live Cyber Threat News** - Real-time threat news feed
- **Attack Trend Graph** - 6-month attack visualization
- **Executive Summary** - Risk counters and key metrics

### Third-Party Integrations
- AlienVault OTX
- AbuseIPDB
- VirusTotal
- ThreatFox
- Shodan

## Project Structure

```
INDIGO/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   └── store/            # Zustand stores
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.js
├── backend/
│   ├── api/                  # API routes
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── schemas/              # Pydantic schemas
│   ├── routes/               # FastAPI routers
│   ├── middleware/           # Security middleware
│   ├── database/             # Database configuration
│   ├── websocket/            # WebSocket handlers
│   ├── reports/              # Report generation
│   ├── auth/                 # Authentication
│   ├── scheduler/            # Background tasks
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd INDIGO
```

2. Create environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Update environment variables in `.env` files with your actual values

4. Start all services:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/alerts` - Get critical alerts
- `GET /api/dashboard/attack-map` - Get attack map data

### Threat Intelligence
- `GET /api/threat-intelligence` - Get threat intelligence data
- `GET /api/threat-intelligence/trend` - Get threat trend data

### Ransomware
- `GET /api/ransomware` - Get ransomware incidents
- `GET /api/ransomware/stats` - Get ransomware statistics

### News
- `GET /api/news` - Get cyber threat news

### Reports
- `GET /api/reports/threat` - Generate threat intelligence report (PDF)
- `GET /api/reports/ransomware` - Generate ransomware report (PDF)
- `GET /api/reports/executive` - Generate executive summary report (PDF)

### WebSocket
- `WS /ws/dashboard` - Real-time dashboard updates

## Background Tasks

The platform includes scheduled background tasks:
- **Ransomware Data Fetch**: Every 15 minutes
- **Threat Intelligence Refresh**: Every 30 minutes
- **Dashboard Stats Refresh**: Every 5 minutes

## Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Security headers (CSP, XSS protection, etc.)
- Input validation with Pydantic

## Database Schema

### Tables
- `users` - User accounts and authentication
- `alerts` - Critical security alerts
- `threat_feeds` - Threat intelligence feed sources
- `attack_map` - Geographic attack data
- `attack_events` - Individual attack events
- `threat_scores` - Calculated threat scores
- `ransomware_groups` - Known ransomware groups
- `ransomware_incidents` - Ransomware attack incidents
- `countries` - Country data for attack mapping
- `news` - Cyber threat news articles
- `reports` - Generated reports
- `activity_logs` - User activity tracking

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ai_security_platform
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALIENVAULT_OTX_API_KEY=your_otx_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Development

### Adding New Features
1. Create database models in `backend/models/`
2. Create Pydantic schemas in `backend/schemas/`
3. Implement business logic in `backend/services/`
4. Add API routes in `backend/routes/`
5. Create frontend components in `frontend/src/components/`
6. Add API services in `frontend/src/services/`
7. Update state management in `frontend/src/store/`

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d --build
```

### Production Considerations
- Use strong secrets for JWT and database
- Enable HTTPS in production
- Configure proper CORS origins
- Set up monitoring and logging
- Use environment-specific configurations
- Implement backup strategies for database

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries, contact the development team.
