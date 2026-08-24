from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from logging.config import dictConfig

from database.database import engine, Base, SessionLocal
from models.user import User
from auth.password_handler import hash_password
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
        
        # Run column migrations for existing PostgreSQL databases
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT TRUE;"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR;"))
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;"))
                
                # Company ownership & visibility columns
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_name VARCHAR;"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by_user_email VARCHAR;"))
                conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;"))
                conn.execute(text("UPDATE companies SET is_global = TRUE WHERE is_global IS NULL;"))
                
                conn.commit()
                logger.info("Database table columns verified/migrated successfully")
        except Exception as mig_err:
            logger.warning(f"Column migration check notice: {mig_err}")
            
        # Seed default admin user
        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.email == "admin@indigo.com").first()
            if not admin_user:
                admin_user = User(
                    email="admin@indigo.com",
                    name="Admin User",
                    hashed_password=hash_password("admin123"),
                    role="Admin",
                    is_active=True
                )
                db.add(admin_user)
                db.commit()
                logger.info("Default admin user created successfully")
            else:
                admin_user.hashed_password = hash_password("admin123")
                admin_user.role = "Admin"
                admin_user.is_active = True
                db.commit()
                logger.info("Default admin user updated/verified successfully")
        except Exception as seed_err:
            logger.error(f"Error seeding admin user: {seed_err}")
            db.rollback()
            
        # Seed default initial global companies if table is empty
        try:
            from models.company import Company
            company_count = db.query(Company).count()
            if company_count == 0:
                default_companies = [
                    {"name": "Google LLC", "domain": "google.com", "industry": "Technology", "description": "Global technology and cloud infrastructure leader", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                    {"name": "Microsoft Corporation", "domain": "microsoft.com", "industry": "Technology", "description": "Enterprise cloud computing, software, and cybersecurity solutions", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                    {"name": "Amazon AWS", "domain": "amazon.com", "industry": "Technology", "description": "E-commerce and comprehensive cloud computing infrastructure", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                    {"name": "Cloudflare Inc.", "domain": "cloudflare.com", "industry": "Telecommunications", "description": "Web security, DDoS mitigation, and global edge network", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                    {"name": "Apple Inc.", "domain": "apple.com", "industry": "Technology", "description": "Consumer electronics, software ecosystem, and digital services", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                    {"name": "Cisco Systems", "domain": "cisco.com", "industry": "Telecommunications", "description": "Networking hardware, telecommunications, and cybersecurity solutions", "is_global": True, "created_by_user_name": "System Admin", "created_by_user_email": "admin@indigo.com"},
                ]
                for comp_info in default_companies:
                    comp = Company(**comp_info, is_active=True, monitoring_enabled=True)
                    db.add(comp)
                db.commit()
                logger.info("Default initial 6 monitored companies seeded successfully")
        except Exception as comp_seed_err:
            logger.error(f"Error seeding default companies: {comp_seed_err}")
            db.rollback()
        finally:
            db.close()
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
origins = [
    "https://vajraaa.netlify.app",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.netlify\.app|https://.*\.onrender\.com|https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
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
    return {"status": "healthy", "timestamp": "2026-08-20T10:00:00Z"}

@app.get("/")
async def root():
    return {"message": "VAJRA API", "status": "running", "version": "1.0.0"}

