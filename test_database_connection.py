#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database.database import engine, SessionLocal, Base
from models.user import User
from models.company import Company
from models.alert import Alert
from sqlalchemy import text
import time

def test_postgresql_connection():
    """Test PostgreSQL database connection"""
    print("Testing PostgreSQL Database Connection...")
    print("-" * 50)
    
    try:
        # Test engine connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✓ PostgreSQL Connection: SUCCESS")
            print(f"  Database URL: {engine.url}")
            
        # Test session
        db = SessionLocal()
        try:
            # Test query
            user_count = db.query(User).count()
            print(f"✓ Session Query: SUCCESS")
            print(f"  Total Users: {user_count}")
            
            company_count = db.query(Company).count()
            print(f"  Total Companies: {company_count}")
            
            alert_count = db.query(Alert).count()
            print(f"  Total Alerts: {alert_count}")
            
        finally:
            db.close()
            
        return True
        
    except Exception as e:
        print(f"✗ PostgreSQL Connection: FAILED")
        print(f"  Error: {str(e)}")
        return False

def test_firebase_connection():
    """Test Firebase Firestore connection"""
    print("\nTesting Firebase Firestore Connection...")
    print("-" * 50)
    
    try:
        from services.firebase_service import firebase_service
        
        # Try to initialize
        firebase_service.initialize()
        
        if firebase_service._initialized:
            print("✓ Firebase Admin SDK: INITIALIZED")
            
            # Test Firestore connection
            try:
                # Try to get a collection (will fail if no service account)
                test_data = firebase_service.db.collection('users').limit(1).stream()
                print("✓ Firestore Connection: SUCCESS")
                return True
            except Exception as e:
                print(f"✗ Firestore Connection: FAILED")
                print(f"  Error: {str(e)}")
                print(f"  Note: Service account key may be missing")
                return False
        else:
            print("✗ Firebase Admin SDK: NOT INITIALIZED")
            print("  Note: Service account key not configured")
            return False
            
    except Exception as e:
        print(f"✗ Firebase Connection: FAILED")
        print(f"  Error: {str(e)}")
        return False

def test_database_tables():
    """Test if database tables exist"""
    print("\nTesting Database Tables...")
    print("-" * 50)
    
    try:
        db = SessionLocal()
        
        # Check if tables exist by querying them
        tables = {
            'users': User,
            'companies': Company,
            'alerts': Alert
        }
        
        for table_name, model in tables.items():
            try:
                count = db.query(model).count()
                print(f"✓ Table '{table_name}': EXISTS ({count} records)")
            except Exception as e:
                print(f"✗ Table '{table_name}': MISSING OR ERROR")
                print(f"  Error: {str(e)}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"✗ Database Tables Check: FAILED")
        print(f"  Error: {str(e)}")
        return False

def main():
    print("=" * 50)
    print("VAJRA Platform Database Connection Test")
    print("=" * 50)
    print()
    
    # Test PostgreSQL
    pg_status = test_postgresql_connection()
    
    # Test Firebase
    firebase_status = test_firebase_connection()
    
    # Test tables
    tables_status = test_database_tables()
    
    # Summary
    print("\n" + "=" * 50)
    print("CONNECTION TEST SUMMARY")
    print("=" * 50)
    print(f"PostgreSQL: {'✓ CONNECTED' if pg_status else '✗ FAILED'}")
    print(f"Firebase: {'✓ CONNECTED' if firebase_status else '✗ FAILED'}")
    print(f"Database Tables: {'✓ OK' if tables_status else '✗ ERROR'}")
    print("=" * 50)
    
    if pg_status and tables_status:
        print("\n✓ Main database is properly connected and operational")
    else:
        print("\n✗ Database connection issues detected")
    
    if not firebase_status:
        print("\n⚠ Firebase requires service account key configuration")

if __name__ == "__main__":
    main()
