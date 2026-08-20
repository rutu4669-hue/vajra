"""
Script to reset admin password
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_WzCOhSJ0dn6f@ep-nameless-bird-ay266zed-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from database.database import SessionLocal, engine, Base
from models.user import User
from auth.password_handler import hash_password

def reset_admin_password():
    """Reset admin password to default or create if missing"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == "admin@indigo.com").first()
        new_password = "admin123"
        if user:
            user.hashed_password = hash_password(new_password)
            user.role = "Admin"
            user.is_active = True
            db.commit()
            print("Admin password reset successfully!")
            print(f"Email: {user.email}")
            print(f"New Password: {new_password}")
        else:
            admin_user = User(
                email="admin@indigo.com",
                name="Admin User",
                hashed_password=hash_password(new_password),
                role="Admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
            print(f"Email: admin@indigo.com")
            print(f"Password: {new_password}")
            
    except Exception as e:
        print(f"Error resetting password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
