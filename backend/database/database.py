from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_NEON_DB = "postgresql://neondb_owner:npg_WzCOhSJ0dn6f@ep-nameless-bird-ay266zed-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
raw_db_url = os.getenv("DATABASE_URL") or DEFAULT_NEON_DB

if not raw_db_url or raw_db_url == "sqlite:///./ai_security.db":
    DATABASE_URL = DEFAULT_NEON_DB
else:
    DATABASE_URL = raw_db_url
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# For SQLite, we need to check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
