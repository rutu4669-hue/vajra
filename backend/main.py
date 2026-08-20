from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from logging.config import dictConfig

from database.database import engine, Base
from websocket.websocket_manager import websocket_manager
from routes import auth, dashboard, threat, ransomware, news, reports, ai, alerts, threat_actors, industries, notifications, domain, domain_analysis, companies, soc
from admin import routes as admin_routes
from websocket.websocket_routes import router as websocket_router
from scheduler.scheduler import scheduler
from middleware.security import add_security_headers
from middleware.rate_limit import limiter

# Configure logging
dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["default"],
    },
})

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up VAJRA backend...")
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    
    try:
        # Start scheduler
        scheduler.start()
        logger.info("Scheduler started successfully")
    except Exception as e:
        logger.error(f"Scheduler startup error: {e}")
    
    logger.info("Backend started successfully")
    yield
    # Shutdown
    logger.info("Shutting down VAJRA backend...")
    try:
        scheduler.shutdown()
    except Exception as e:
        logger.error(f"Scheduler shutdown error: {e}")
    try:
        await websocket_manager.disconnect_all()
    except Exception as e:
        logger.error(f"WebSocket disconnect error: {e}")

app = FastAPI(
    title="VAJRA API",
    description="AI Powered Threat Intelligence & Risk Analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware (temporarily disabled for debugging)
# app.middleware("http")(add_security_headers)

# Rate limiter
app.state.limiter = limiter

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(threat.router, prefix="/api/threat-intelligence", tags=["Threat Intelligence"])
app.include_router(ransomware.router, prefix="/api/ransomware", tags=["Ransomware"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(threat_actors.router, prefix="/api/threat-intelligence/actors", tags=["Threat Actors"])
app.include_router(industries.router, prefix="/api/threat-intelligence/industries", tags=["Industries"])
app.include_router(notifications.router, prefix="/api", tags=["Notifications"])
app.include_router(admin_routes.router, tags=["Admin"])
app.include_router(domain.router, prefix="/api/domain-risk", tags=["Domain Risk"])
app.include_router(domain_analysis.router, prefix="/api/domain-analysis", tags=["Domain Analysis"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(soc.router, prefix="/api/soc", tags=["SOC Integration"])
app.include_router(websocket_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2026-08-20"}

@app.get("/")
async def root():
    return {"message": "VAJRA API", "status": "running", "version": "1.0.0"}

