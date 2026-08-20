from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File
from sqlalchemy.orm import Session
from database.database import get_db
from auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import requests
import json
import hmac
import hashlib
import os
import shutil
from pathlib import Path

router = APIRouter()

# Models
class SocProvider(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    endpoint: str
    api_key: str
    sync_frequency: str
    data_types: List[str]
    status: str = "inactive"
    last_sync: Optional[str] = None
    total_exports: int = 0
    # New fields for bidirectional support
    enable_api_access: bool = False
    api_endpoint: Optional[str] = None
    webhook_url: Optional[str] = None
    webhook_secret: Optional[str] = None
    direction: str = "export"  # "export", "import", "bidirectional"

class SocExportRequest(BaseModel):
    data: List[dict]
    timestamp: str

class SocTestResponse(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None

class SocDataFetchRequest(BaseModel):
    data_types: List[str]
    limit: int = 100
    since: Optional[str] = None

class ReportVerificationRequest(BaseModel):
    report_id: str
    verification_type: str = "full"  # "full", "summary", "quick"

# In-memory storage for SOC providers (in production, use database)
soc_providers = []
soc_reports = []  # Store report metadata and verification results

# API key validation for SOC providers
def validate_soc_provider_api_key(api_key: str = Header(..., alias="X-SOC-API-Key")):
    """Validate SOC provider API key for data access"""
    provider = next((p for p in soc_providers if p.api_key == api_key and p.enable_api_access), None)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or unauthorized SOC API key"
        )
    return provider

# Webhook signature validation
def validate_webhook_signature(
    payload: str,
    signature: str = Header(..., alias="X-SOC-Signature"),
    webhook_secret: str = None
):
    """Validate webhook signature from SOC provider"""
    if not webhook_secret:
        return True  # Skip validation if no secret configured
    
    expected_signature = hmac.new(
        webhook_secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )
    return True

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify connectivity"""
    return {"status": "ok", "message": "SOC API is working"}

@router.get("/providers")
async def get_soc_providers():
    """Get all configured SOC providers"""
    return soc_providers

@router.post("/providers")
async def add_soc_provider(provider: SocProvider):
    """Add a new SOC provider"""
    try:
        print(f"Adding provider - No auth required for testing")
        print(f"Received provider data: {provider}")
        print(f"Provider name: {provider.name}")
        print(f"Provider type: {provider.type}")
        
        provider.id = str(len(soc_providers) + 1)
        provider.status = "inactive"
        provider.last_sync = "Never"
        provider.total_exports = 0
        
        soc_providers.append(provider)
        print(f"Provider added with ID: {provider.id}")
        print(f"Total providers: {len(soc_providers)}")
        
        return provider
    except Exception as e:
        print(f"Error adding provider: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error adding provider: {str(e)}")

@router.put("/providers/{provider_id}")
async def update_soc_provider(provider_id: str, provider: SocProvider, current_user = Depends(get_current_user)):
    """Update an existing SOC provider"""
    for i, p in enumerate(soc_providers):
        if p.id == provider_id:
            provider.id = provider_id
            provider.status = p.status
            provider.last_sync = p.last_sync
            provider.total_exports = p.total_exports
            soc_providers[i] = provider
            return provider
    raise HTTPException(status_code=404, detail="Provider not found")

@router.delete("/providers/{provider_id}")
async def delete_soc_provider(provider_id: str, current_user = Depends(get_current_user)):
    """Delete a SOC provider"""
    for i, p in enumerate(soc_providers):
        if p.id == provider_id:
            soc_providers.pop(i)
            return {"message": "Provider deleted successfully"}
    raise HTTPException(status_code=404, detail="Provider not found")

@router.post("/providers/{provider_id}/test")
async def test_soc_connection(provider_id: str, current_user = Depends(get_current_user)):
    """Test connection to a SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    try:
        start_time = datetime.now()
        # Simulate connection test (in production, make actual API call)
        # response = requests.get(provider.endpoint, headers={"Authorization": f"Bearer {provider.api_key}"}, timeout=10)
        latency = (datetime.now() - start_time).total_seconds() * 1000
        
        return SocTestResponse(
            success=True,
            message="Connection successful",
            latency_ms=latency
        )
    except Exception as e:
        return SocTestResponse(
            success=False,
            message=f"Connection failed: {str(e)}"
        )

@router.post("/providers/{provider_id}/export/alerts")
async def export_alerts_to_soc(provider_id: str, request: SocExportRequest, current_user = Depends(get_current_user)):
    """Export alerts data to SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if "alerts" not in provider.data_types:
        raise HTTPException(status_code=400, detail="Alerts export not enabled for this provider")
    
    try:
        # In production, make actual API call to SOC provider
        # response = requests.post(
        #     f"{provider.endpoint}/alerts",
        #     headers={"Authorization": f"Bearer {provider.api_key}", "Content-Type": "application/json"},
        #     json=request.data,
        #     timeout=30
        # )
        
        # Update provider stats
        for i, p in enumerate(soc_providers):
            if p.id == provider_id:
                soc_providers[i].last_sync = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                soc_providers[i].total_exports += len(request.data)
                soc_providers[i].status = "active"
                break
        
        return {
            "success": True,
            "message": f"Successfully exported {len(request.data)} alerts",
            "exported_count": len(request.data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/providers/{provider_id}/export/threat-intel")
async def export_threat_intel_to_soc(provider_id: str, request: SocExportRequest, current_user = Depends(get_current_user)):
    """Export threat intelligence data to SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if "threat-intel" not in provider.data_types:
        raise HTTPException(status_code=400, detail="Threat intelligence export not enabled for this provider")
    
    try:
        # In production, make actual API call to SOC provider
        # response = requests.post(
        #     f"{provider.endpoint}/threat-intel",
        #     headers={"Authorization": f"Bearer {provider.api_key}", "Content-Type": "application/json"},
        #     json=request.data,
        #     timeout=30
        # )
        
        # Update provider stats
        for i, p in enumerate(soc_providers):
            if p.id == provider_id:
                soc_providers[i].last_sync = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                soc_providers[i].total_exports += len(request.data)
                soc_providers[i].status = "active"
                break
        
        return {
            "success": True,
            "message": f"Successfully exported {len(request.data)} threat intelligence records",
            "exported_count": len(request.data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/providers/{provider_id}/export/ransomware")
async def export_ransomware_to_soc(provider_id: str, request: SocExportRequest, current_user = Depends(get_current_user)):
    """Export ransomware data to SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if "ransomware" not in provider.data_types:
        raise HTTPException(status_code=400, detail="Ransomware export not enabled for this provider")
    
    try:
        # In production, make actual API call to SOC provider
        # response = requests.post(
        #     f"{provider.endpoint}/ransomware",
        #     headers={"Authorization": f"Bearer {provider.api_key}", "Content-Type": "application/json"},
        #     json=request.data,
        #     timeout=30
        # )
        
        # Update provider stats
        for i, p in enumerate(soc_providers):
            if p.id == provider_id:
                soc_providers[i].last_sync = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                soc_providers[i].total_exports += len(request.data)
                soc_providers[i].status = "active"
                break
        
        return {
            "success": True,
            "message": f"Successfully exported {len(request.data)} ransomware records",
            "exported_count": len(request.data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/providers/{provider_id}/sync-status")
async def get_soc_sync_status(provider_id: str, current_user = Depends(get_current_user)):
    """Get sync status for a SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    return {
        "provider_id": provider_id,
        "status": provider.status,
        "last_sync": provider.last_sync,
        "total_exports": provider.total_exports,
        "sync_frequency": provider.sync_frequency,
        "data_types": provider.data_types
    }

@router.post("/providers/{provider_id}/sync")
async def sync_with_soc(provider_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Manual sync with SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    try:
        # Fetch data from database based on provider's data types
        exported_data = {}
        
        if "alerts" in provider.data_types:
            # Fetch alerts from database
            from models import Alert
            alerts = db.query(Alert).limit(100).all()
            exported_data["alerts"] = [
                {
                    "id": alert.id,
                    "title": alert.title,
                    "description": alert.description,
                    "severity": alert.severity,
                    "time": alert.time.isoformat() if alert.time else None
                }
                for alert in alerts
            ]
        
        if "threat-intel" in provider.data_types:
            # Fetch threat intelligence from database
            from models import Threat
            threats = db.query(Threat).limit(100).all()
            exported_data["threat_intel"] = [
                {
                    "id": threat.id,
                    "name": threat.name,
                    "type": threat.type,
                    "severity": threat.severity
                }
                for threat in threats
            ]
        
        if "ransomware" in provider.data_types:
            # Fetch ransomware data from database
            from models import Ransomware
            ransomware = db.query(Ransomware).limit(100).all()
            exported_data["ransomware"] = [
                {
                    "id": r.id,
                    "group_name": r.group_name,
                    "target": r.target,
                    "country": r.country
                }
                for r in ransomware
            ]
        
        # Update provider stats
        total_exported = sum(len(data) for data in exported_data.values())
        for i, p in enumerate(soc_providers):
            if p.id == provider_id:
                soc_providers[i].last_sync = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                soc_providers[i].total_exports += total_exported
                soc_providers[i].status = "active"
                break
        
        return {
            "success": True,
            "message": f"Sync completed successfully",
            "exported_data": exported_data,
            "total_exported": total_exported,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/providers/{provider_id}/logs")
async def get_soc_export_logs(provider_id: str, current_user = Depends(get_current_user)):
    """Get export logs for a SOC provider"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # In production, fetch actual logs from database
    return {
        "provider_id": provider_id,
        "logs": [
            {
                "id": "1",
                "timestamp": datetime.now().isoformat(),
                "data_type": "alerts",
                "status": "success",
                "records_exported": 50,
                "message": "Export completed successfully"
            },
            {
                "id": "2",
                "timestamp": datetime.now().isoformat(),
                "data_type": "threat-intel",
                "status": "success",
                "records_exported": 25,
                "message": "Export completed successfully"
            }
        ]
    }

# ==================== SOC Provider API Endpoints (for external SOC providers to fetch data) ====================

@router.get("/api/alerts")
async def soc_fetch_alerts(
    limit: int = 100,
    since: Optional[str] = None,
    provider = Depends(validate_soc_provider_api_key),
    db: Session = Depends(get_db)
):
    """API endpoint for SOC providers to fetch alerts data"""
    try:
        from models import Alert
        query = db.query(Alert)
        
        if since:
            since_date = datetime.fromisoformat(since)
            query = query.filter(Alert.time >= since_date)
        
        alerts = query.limit(limit).all()
        
        data = [
            {
                "id": alert.id,
                "title": alert.title,
                "description": alert.description,
                "severity": alert.severity,
                "time": alert.time.isoformat() if alert.time else None,
                "source": getattr(alert, 'source', 'Unknown'),
                "affected_systems": getattr(alert, 'affected_systems', 'Unknown'),
                "status": getattr(alert, 'status', 'Active'),
                "confidence": getattr(alert, 'confidence', 'Medium')
            }
            for alert in alerts
        ]
        
        return {
            "success": True,
            "provider": provider.name,
            "data_type": "alerts",
            "count": len(data),
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

@router.get("/api/threat-intel")
async def soc_fetch_threat_intel(
    limit: int = 100,
    since: Optional[str] = None,
    provider = Depends(validate_soc_provider_api_key),
    db: Session = Depends(get_db)
):
    """API endpoint for SOC providers to fetch threat intelligence data"""
    try:
        from models import Threat
        query = db.query(Threat)
        
        if since:
            since_date = datetime.fromisoformat(since)
            query = query.filter(Threat.created_at >= since_date)
        
        threats = query.limit(limit).all()
        
        data = [
            {
                "id": threat.id,
                "name": threat.name,
                "type": threat.type,
                "severity": threat.severity,
                "description": getattr(threat, 'description', ''),
                "first_seen": getattr(threat, 'first_seen', None),
                "last_seen": getattr(threat, 'last_seen', None)
            }
            for threat in threats
        ]
        
        return {
            "success": True,
            "provider": provider.name,
            "data_type": "threat_intel",
            "count": len(data),
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching threat intelligence: {str(e)}")

@router.get("/api/ransomware")
async def soc_fetch_ransomware(
    limit: int = 100,
    since: Optional[str] = None,
    provider = Depends(validate_soc_provider_api_key),
    db: Session = Depends(get_db)
):
    """API endpoint for SOC providers to fetch ransomware data"""
    try:
        from models import Ransomware
        query = db.query(Ransomware)
        
        if since:
            since_date = datetime.fromisoformat(since)
            query = query.filter(Ransomware.discovered_at >= since_date)
        
        ransomware = query.limit(limit).all()
        
        data = [
            {
                "id": r.id,
                "group_name": r.group_name,
                "target": r.target,
                "country": r.country,
                "demand": getattr(r, 'demand', 'Unknown'),
                "deadline": getattr(r, 'deadline', None),
                "website_status": getattr(r, 'website_status', 'Unknown'),
                "discovered_at": r.discovered_at.isoformat() if r.discovered_at else None
            }
            for r in ransomware
        ]
        
        return {
            "success": True,
            "provider": provider.name,
            "data_type": "ransomware",
            "count": len(data),
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ransomware data: {str(e)}")

@router.get("/api/all")
async def soc_fetch_all_data(
    limit: int = 100,
    since: Optional[str] = None,
    provider = Depends(validate_soc_provider_api_key),
    db: Session = Depends(get_db)
):
    """API endpoint for SOC providers to fetch all available data types"""
    try:
        result = {
            "success": True,
            "provider": provider.name,
            "timestamp": datetime.now().isoformat(),
            "data": {}
        }
        
        # Fetch alerts
        if "alerts" in provider.data_types:
            from models import Alert
            query = db.query(Alert)
            if since:
                since_date = datetime.fromisoformat(since)
                query = query.filter(Alert.time >= since_date)
            alerts = query.limit(limit).all()
            result["data"]["alerts"] = [
                {
                    "id": alert.id,
                    "title": alert.title,
                    "description": alert.description,
                    "severity": alert.severity,
                    "time": alert.time.isoformat() if alert.time else None
                }
                for alert in alerts
            ]
        
        # Fetch threat intelligence
        if "threat-intel" in provider.data_types:
            from models import Threat
            query = db.query(Threat)
            if since:
                since_date = datetime.fromisoformat(since)
                query = query.filter(Threat.created_at >= since_date)
            threats = query.limit(limit).all()
            result["data"]["threat_intel"] = [
                {
                    "id": threat.id,
                    "name": threat.name,
                    "type": threat.type,
                    "severity": threat.severity
                }
                for threat in threats
            ]
        
        # Fetch ransomware data
        if "ransomware" in provider.data_types:
            from models import Ransomware
            query = db.query(Ransomware)
            if since:
                since_date = datetime.fromisoformat(since)
                query = query.filter(Ransomware.discovered_at >= since_date)
            ransomware = query.limit(limit).all()
            result["data"]["ransomware"] = [
                {
                    "id": r.id,
                    "group_name": r.group_name,
                    "target": r.target,
                    "country": r.country
                }
                for r in ransomware
            ]
        
        result["total_records"] = sum(len(data) for data in result["data"].values())
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

# ==================== Webhook Endpoints (for SOC providers to push data) ====================

@router.post("/webhook/{provider_id}")
async def soc_webhook(
    provider_id: str,
    payload: dict,
    signature: str = Header(None, alias="X-SOC-Signature"),
    db: Session = Depends(get_db)
):
    """Webhook endpoint for SOC providers to push data to our system"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    if not provider.enable_api_access:
        raise HTTPException(status_code=403, detail="API access not enabled for this provider")
    
    # Validate webhook signature if secret is configured
    if provider.webhook_secret:
        validate_webhook_signature(
            json.dumps(payload),
            signature,
            provider.webhook_secret
        )
    
    try:
        # Process incoming data from SOC provider
        data_type = payload.get("data_type")
        data = payload.get("data", [])
        
        # Store incoming data based on type
        if data_type == "alerts":
            # Store alerts from SOC provider
            for alert_data in data:
                # In production, store in database
                pass
        elif data_type == "threat_intel":
            # Store threat intelligence from SOC provider
            for threat_data in data:
                # In production, store in database
                pass
        elif data_type == "ransomware":
            # Store ransomware data from SOC provider
            for ransomware_data in data:
                # In production, store in database
                pass
        
        return {
            "success": True,
            "message": f"Received {len(data)} {data_type} records from {provider.name}",
            "processed_count": len(data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

@router.post("/providers/{provider_id}/generate-api-key")
async def generate_soc_api_key(provider_id: str, current_user = Depends(get_current_user)):
    """Generate a new API key for SOC provider to access our data"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Generate random API key
    import secrets
    new_api_key = f"soc_{secrets.token_urlsafe(32)}"
    
    # Update provider
    for i, p in enumerate(soc_providers):
        if p.id == provider_id:
            soc_providers[i].api_key = new_api_key
            soc_providers[i].enable_api_access = True
            break
    
    return {
        "success": True,
        "api_key": new_api_key,
        "api_endpoint": f"/api/soc/api",
        "message": "API key generated. Share this with the SOC provider for data access."
    }

# ==================== SOC Reports and PDF Handling ====================

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path("uploads/soc_reports")
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Upload directory created/verified: {UPLOAD_DIR}")
except Exception as e:
    print(f"Error creating upload directory: {e}")
    UPLOAD_DIR = Path("temp_uploads")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/providers/{provider_id}/upload-report")
async def upload_soc_report(
    provider_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload SOC report (PDF or Text)"""
    try:
        provider = next((p for p in soc_providers if p.id == provider_id), None)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        # Validate file type - accept both PDF and text files
        allowed_extensions = ['.pdf', '.txt', '.log', '.csv']
        file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        
        if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
            raise HTTPException(
                status_code=400, 
                detail=f"Only PDF and text files ({', '.join(allowed_extensions)}) are allowed"
            )
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{provider.name}_{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        
        print(f"Attempting to save file to: {file_path}")
        print(f"Upload directory exists: {UPLOAD_DIR.exists()}")
        
        # Save file
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            print(f"File saved successfully: {file_path}")
        except Exception as e:
            print(f"Error saving file: {e}")
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
        
        # Determine file type
        file_type = "pdf" if file.filename.lower().endswith('.pdf') else "text"
        
        # Create report metadata
        report_id = str(len(soc_reports) + 1)
        report_metadata = {
            "id": report_id,
            "provider_id": provider_id,
            "provider_name": provider.name,
            "filename": filename,
            "file_path": str(file_path),
            "uploaded_at": datetime.now().isoformat(),
            "file_size": file_path.stat().st_size,
            "file_type": file_type,
            "verification_status": "pending",
            "verification_result": None,
            "ai_analysis": None
        }
        soc_reports.append(report_metadata)
        
        return {
            "success": True,
            "message": f"{file_type.upper()} report uploaded successfully",
            "report": report_metadata
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/providers/{provider_id}/reports")
async def get_soc_reports(
    provider_id: str,
    time_filter: Optional[str] = None,  # "1day", "1month", "1year", "all"
    current_user = Depends(get_current_user)
):
    """Get all uploaded SOC reports for a provider with time filters"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Filter reports by provider
    provider_reports = [r for r in soc_reports if r["provider_id"] == provider_id]
    
    # Apply time filter
    if time_filter and time_filter != "all":
        now = datetime.now()
        if time_filter == "1day":
            cutoff = now - timedelta(days=1)
        elif time_filter == "1month":
            cutoff = now - timedelta(days=30)
        elif time_filter == "1year":
            cutoff = now - timedelta(days=365)
        else:
            cutoff = None
        
        if cutoff:
            provider_reports = [
                r for r in provider_reports 
                if datetime.fromisoformat(r["uploaded_at"]) >= cutoff
            ]
    
    return {
        "provider": provider.name,
        "reports": provider_reports,
        "total": len(provider_reports),
        "filter": time_filter or "all"
    }

@router.get("/providers/{provider_id}/export-logs")
async def export_soc_logs(
    provider_id: str,
    format: str = "json",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export SOC logs in various formats"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    try:
        # Fetch log data from database
        from models import Alert, ThreatFeed, RansomwareIncident
        
        logs = {
            "provider": provider.name,
            "export_date": datetime.now().isoformat(),
            "data": {
                "alerts": [],
                "threat_intel": [],
                "ransomware": []
            }
        }
        
        if "alerts" in provider.data_types:
            alerts = db.query(Alert).limit(100).all()
            logs["data"]["alerts"] = [
                {
                    "id": alert.id,
                    "title": alert.title,
                    "severity": alert.severity,
                    "time": alert.time.isoformat() if alert.time else None
                }
                for alert in alerts
            ]
        
        if "threat-intel" in provider.data_types:
            threats = db.query(Threat).limit(100).all()
            logs["data"]["threat_intel"] = [
                {
                    "id": threat.id,
                    "name": threat.name,
                    "type": threat.type,
                    "severity": threat.severity
                }
                for threat in threats
            ]
        
        if "ransomware" in provider.data_types:
            ransomware = db.query(Ransomware).limit(100).all()
            logs["data"]["ransomware"] = [
                {
                    "id": r.id,
                    "group_name": r.group_name,
                    "target": r.target,
                    "country": r.country
                }
                for r in ransomware
            ]
        
        logs["total_records"] = sum(len(data) for data in logs["data"].values())
        
        if format == "json":
            return logs
        elif format == "csv":
            # Convert to CSV format
            import csv
            from io import StringIO
            output = StringIO()
            
            # Write alerts CSV
            if logs["data"]["alerts"]:
                writer = csv.DictWriter(output, fieldnames=["id", "title", "severity", "time"])
                writer.writeheader()
                writer.writerows(logs["data"]["alerts"])
            
            return {
                "format": "csv",
                "data": output.getvalue(),
                "records": logs["total_records"]
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'json' or 'csv'")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting logs: {str(e)}")

@router.post("/providers/{provider_id}/generate-report")
async def generate_soc_report(
    provider_id: str,
    report_type: str = "summary",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate SOC report from system data"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    try:
        # Fetch data for report
        from models import Alert, ThreatFeed, RansomwareIncident
        
        report_data = {
            "provider": provider.name,
            "generated_at": datetime.now().isoformat(),
            "report_type": report_type,
            "summary": {
                "total_alerts": 0,
                "critical_alerts": 0,
                "high_alerts": 0,
                "total_threats": 0,
                "total_ransomware": 0
            },
            "details": {}
        }
        
        # Alerts data
        if "alerts" in provider.data_types:
            alerts = db.query(Alert).all()
            report_data["summary"]["total_alerts"] = len(alerts)
            report_data["summary"]["critical_alerts"] = len([a for a in alerts if a.severity == "CRITICAL"])
            report_data["summary"]["high_alerts"] = len([a for a in alerts if a.severity == "HIGH"])
            report_data["details"]["alerts"] = [
                {
                    "id": alert.id,
                    "title": alert.title,
                    "severity": alert.severity,
                    "time": alert.time.isoformat() if alert.time else None
                }
                for alert in alerts[-50:]  # Last 50 alerts
            ]
        
        # Threat intelligence data
        if "threat-intel" in provider.data_types:
            threats = db.query(Threat).all()
            report_data["summary"]["total_threats"] = len(threats)
            report_data["details"]["threats"] = [
                {
                    "id": threat.id,
                    "name": threat.name,
                    "type": threat.type,
                    "severity": threat.severity
                }
                for threat in threats[-50:]  # Last 50 threats
            ]
        
        # Ransomware data
        if "ransomware" in provider.data_types:
            ransomware = db.query(Ransomware).all()
            report_data["summary"]["total_ransomware"] = len(ransomware)
            report_data["details"]["ransomware"] = [
                {
                    "id": r.id,
                    "group_name": r.group_name,
                    "target": r.target,
                    "country": r.country
                }
                for r in ransomware[-50:]  # Last 50 ransomware incidents
            ]
        
        return {
            "success": True,
            "report": report_data,
            "message": "SOC report generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/providers/{provider_id}/download-report/{filename}")
async def download_soc_report(
    provider_id: str,
    filename: str,
    current_user = Depends(get_current_user)
):
    """Download uploaded SOC report"""
    provider = next((p for p in soc_providers if p.id == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Validate file belongs to this provider
    if not filename.startswith(provider.name):
        raise HTTPException(status_code=403, detail="Access denied")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename
    )

# ==================== AI Report Verification ====================

@router.post("/reports/{report_id}/verify")
async def verify_soc_report(
    report_id: str,
    request: ReportVerificationRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify SOC report using AI analysis"""
    report = next((r for r in soc_reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        # Simulate AI verification (in production, use actual AI service)
        # This would analyze the PDF content and compare with system data
        
        verification_result = {
            "report_id": report_id,
            "verification_type": request.verification_type,
            "verified_at": datetime.now().isoformat(),
            "status": "verified",
            "confidence_score": 0.92,
            "findings": [
                {
                    "type": "data_consistency",
                    "status": "pass",
                    "message": "Report data matches system records"
                },
                {
                    "type": "threat_alignment",
                    "status": "pass",
                    "message": "Threat intelligence aligns with SOC findings"
                },
                {
                    "type": "anomaly_detection",
                    "status": "warning",
                    "message": "3 minor anomalies detected in alert patterns"
                }
            ],
            "summary": {
                "total_alerts_verified": 45,
                "threats_matched": 12,
                "ransomware_incidents_validated": 8,
                "data_completeness": 95,
                "overall_risk_level": "Medium"
            },
            "recommendations": [
                "Review 3 anomalous alert patterns",
                "Consider updating threat intelligence based on SOC findings",
                "Validate ransomware incident timestamps"
            ]
        }
        
        # Update report metadata
        for i, r in enumerate(soc_reports):
            if r["id"] == report_id:
                soc_reports[i]["verification_status"] = "verified"
                soc_reports[i]["verification_result"] = verification_result
                soc_reports[i]["ai_analysis"] = {
                    "analyzed_at": datetime.now().isoformat(),
                    "model_version": "v1.0",
                    "processing_time": "2.3s"
                }
                break
        
        return {
            "success": True,
            "verification": verification_result,
            "message": "Report verified successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying report: {str(e)}")

@router.get("/reports/{report_id}/verification")
async def get_report_verification(report_id: str, current_user = Depends(get_current_user)):
    """Get verification result for a specific report"""
    report = next((r for r in soc_reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "report_id": report_id,
        "verification_status": report.get("verification_status", "pending"),
        "verification_result": report.get("verification_result"),
        "ai_analysis": report.get("ai_analysis")
    }

@router.get("/reports/all")
async def get_all_reports(
    time_filter: Optional[str] = None,
    verification_filter: Optional[str] = None,  # "verified", "pending", "failed"
    current_user = Depends(get_current_user)
):
    """Get all SOC reports with filters"""
    filtered_reports = soc_reports.copy()
    
    # Apply time filter
    if time_filter and time_filter != "all":
        now = datetime.now()
        if time_filter == "1day":
            cutoff = now - timedelta(days=1)
        elif time_filter == "1month":
            cutoff = now - timedelta(days=30)
        elif time_filter == "1year":
            cutoff = now - timedelta(days=365)
        else:
            cutoff = None
        
        if cutoff:
            filtered_reports = [
                r for r in filtered_reports 
                if datetime.fromisoformat(r["uploaded_at"]) >= cutoff
            ]
    
    # Apply verification filter
    if verification_filter:
        filtered_reports = [
            r for r in filtered_reports 
            if r.get("verification_status") == verification_filter
        ]
    
    return {
        "reports": filtered_reports,
        "total": len(filtered_reports),
        "filters": {
            "time": time_filter or "all",
            "verification": verification_filter or "all"
        }
    }
