"""
Script to reset admin password
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import SessionLocal
from models.user import User
from auth.password_handler import hash_password

def reset_admin_password():
    """Reset admin password to default"""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == "admin@indigo.com").first()
        if user:
            new_password = "admin123"
            user.hashed_password = hash_password(new_password)
            db.commit()
            print("Admin password reset successfully!")
            print(f"Email: {user.email}")
            print(f"New Password: {new_password}")
        else:
            print("Admin user not found!")
            
    except Exception as e:
        print(f"Error resetting password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
