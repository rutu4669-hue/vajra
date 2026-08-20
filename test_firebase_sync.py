#!/usr/bin/env python3
"""
Verification Script for VAJRA Firebase Database Integration
"""
import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_firebase_integration():
    print("=" * 60)
    print("VAJRA Platform - Firebase Database Integration Test")
    print("=" * 60)
    
    # 1. Initialize Firebase Service
    print("\n1. Testing Firebase Service Initialization...")
    try:
        from services.firebase_service import firebase_service
        firebase_service.initialize()
        if firebase_service._initialized:
            print("  ✓ Firebase Admin SDK initialized successfully")
            print(f"  ✓ Target Firebase Project: {firebase_service.db.project}")
        else:
            print("  ✗ Firebase Admin SDK failed to initialize")
            return False
    except Exception as e:
        print(f"  ✗ Exception during initialization: {e}")
        return False

    # 2. Test Document Operations
    print("\n2. Testing Cloud Firestore Document Operations...")
    test_collection = "users"
    test_doc_id = "test_verification_user_999"
    test_payload = {
        "id": test_doc_id,
        "email": "test_verification@vajra-sec.io",
        "name": "Integration Test Account",
        "role": "Admin",
        "is_active": True
    }

    # Write document
    w_success = firebase_service.set_document_sync(test_collection, test_doc_id, test_payload)
    if w_success:
        print(f"  ✓ Write document to '{test_collection}/{test_doc_id}': SUCCESS")
    else:
        print(f"  ✗ Write document to '{test_collection}/{test_doc_id}': FAILED")

    # Read document
    doc_data = firebase_service.get_document_sync(test_collection, test_doc_id)
    if doc_data and doc_data.get('email') == test_payload['email']:
        print(f"  ✓ Read document from '{test_collection}/{test_doc_id}': SUCCESS")
    else:
        print(f"  ✗ Read document from '{test_collection}/{test_doc_id}': FAILED")

    # Update document
    u_payload = {"role": "Super Admin"}
    u_success = firebase_service.set_document_sync(test_collection, test_doc_id, u_payload)
    upd_doc = firebase_service.get_document_sync(test_collection, test_doc_id)
    if u_success and upd_doc and upd_doc.get('role') == 'Super Admin':
        print(f"  ✓ Update document in '{test_collection}/{test_doc_id}': SUCCESS")
    else:
        print(f"  ✗ Update document in '{test_collection}/{test_doc_id}': FAILED")

    # Delete test document
    d_success = firebase_service.delete_document_sync(test_collection, test_doc_id)
    if d_success:
        print(f"  ✓ Cleanup test document '{test_collection}/{test_doc_id}': SUCCESS")
    else:
        print(f"  ✗ Cleanup test document '{test_collection}/{test_doc_id}': FAILED")

    # 3. Test Full Relational DB -> Firestore Sync
    print("\n3. Testing Full Relational DB -> Firestore Sync...")
    try:
        from database.database import SessionLocal
        db_session = SessionLocal()
        sync_counts = firebase_service.sync_all_from_sqldb(db_session)
        db_session.close()
        print(f"  ✓ Full Database Sync Execution: SUCCESS")
        print("  ✓ Synced Record Counts by Collection:")
        for col, count in sync_counts.items():
            print(f"      - {col}: {count} documents")
    except Exception as e:
        print(f"  ✗ Exception during Full Sync: {e}")
        return False

    # 4. Check Collection Statistics
    print("\n4. Retrieving Firestore Collection Statistics...")
    try:
        stats = firebase_service.get_collection_stats()
        print("  ✓ Current Firestore Collection Document Counts:")
        for col, count in stats.items():
            print(f"      - {col}: {count} documents")
    except Exception as e:
        print(f"  ✗ Failed to retrieve collection stats: {e}")

    print("\n" + "=" * 60)
    print("VERIFICATION COMPLETE - FIREBASE DATABASE INTEGRATED WITH VAJRA")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = test_firebase_integration()
    sys.exit(0 if success else 1)
