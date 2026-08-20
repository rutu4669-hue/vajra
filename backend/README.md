# VAJRA - Backend

FastAPI backend for the VAJRA with PostgreSQL, Redis, and WebSocket support.

## Features

- RESTful API with FastAPI
- JWT authentication with refresh tokens
- PostgreSQL database with SQLAlchemy ORM
- Redis caching
- WebSocket for real-time updates
- Background task scheduling with APScheduler
- Third-party API integrations (AlienVault OTX, AbuseIPDB, VirusTotal)
- PDF report generation
- Rate limiting and security middleware
- Comprehensive logging

## Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations (if using Alembic):
```bash
alembic upgrade head
```

5. Start the server:
```bash
uvicorn main:app --reload
```

## API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── database/              # Database configuration
│   ├── database.py       # SQLAlchemy setup
│   └── redis_client.py   # Redis client
├── models/                # SQLAlchemy models
│   ├── user.py
│   ├── alert.py
│   ├── threat_feed.py
│   ├── attack_map.py
│   ├── attack_event.py
│   ├── threat_score.py
│   ├── ransomware_group.py
│   ├── ransomware_incident.py
│   ├── country.py
│   ├── news.py
│   ├── report.py
│   └── activity_log.py
├── schemas/               # Pydantic schemas
│   ├── user.py
│   ├── dashboard.py
│   ├── threat.py
│   ├── ransomware.py
│   └── news.py
├── routes/                # API routes
│   ├── auth.py
│   ├── dashboard.py
│   ├── threat.py
│   ├── ransomware.py
│   ├── news.py
│   └── reports.py
├── services/              # Business logic
│   ├── third_party/
│   │   ├── alienvault.py
│   │   ├── abuseipdb.py
│   │   └── virustotal.py
│   ├── ransomware_service.py
│   ├── threat_service.py
│   └── dashboard_service.py
├── auth/                  # Authentication
│   ├── jwt_handler.py
│   ├── password_handler.py
│   └── dependencies.py
├── middleware/            # Security middleware
│   ├── rate_limit.py
│   └── security.py
├── websocket/             # WebSocket handlers
│   ├── websocket_manager.py
│   └── websocket_routes.py
├── scheduler/             # Background tasks
│   └── scheduler.py
└── reports/               # Report generation
```

## Background Tasks

The scheduler runs the following tasks:

1. **Ransomware Data Fetch** (every 15 minutes)
   - Fetches data from threat-ransomware.live
   - Updates database with new incidents
   - Broadcasts updates via WebSocket

2. **Threat Intelligence Refresh** (every 30 minutes)
   - Fetches indicators from AlienVault OTX
   - Calculates threat scores
   - Updates database and broadcasts via WebSocket

3. **Dashboard Stats Refresh** (every 5 minutes)
   - Refreshes dashboard statistics
   - Broadcasts updates via WebSocket

## Security Features

- JWT authentication with access and refresh tokens
- Password hashing with bcrypt
- Rate limiting with slowapi
- CORS middleware
- Security headers (CSP, XSS protection, etc.)
- Input validation with Pydantic

## Environment Variables

See `.env.example` for all available environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key
- `ALGORITHM` - JWT algorithm
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Access token expiration
- `REFRESH_TOKEN_EXPIRE_DAYS` - Refresh token expiration
- `ALIENVAULT_OTX_API_KEY` - AlienVault OTX API key
- `ABUSEIPDB_API_KEY` - AbuseIPDB API key
- `VIRUSTOTAL_API_KEY` - VirusTotal API key

## Testing

Run tests with pytest:
```bash
pytest
```

## Docker

Build and run with Docker:
```bash
docker build -t ai-security-backend .
docker run -p 8000:8000 ai-security-backend
```

Or use docker-compose from the project root:
```bash
docker-compose up backend
```
