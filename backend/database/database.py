from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_db_url = os.getenv("DATABASE_URL")

if not raw_db_url or "sqlite:///./ai_security.db" in raw_db_url:
    db_file_path = os.path.join(BASE_DIR, "ai_security.db")
    DATABASE_URL = f"sqlite:///{db_file_path}"
else:
    DATABASE_URL = raw_db_url

# For SQLite, we need to check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
