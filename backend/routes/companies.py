from fastapi import APIRouter, Depends, HTTPException, Query
import json
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime

from database.database import get_db
from models.company import Company, CompanyThreat, CompanyRiskAssessment
from models.user import User
from auth.dependencies import get_optional_current_user
from schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyResponse, CompanyWithDetails,
    CompanyThreatCreate, CompanyThreatResponse,
    CompanyRiskAssessmentCreate, CompanyRiskAssessmentResponse
)
from services.domain_analysis_service import domain_service
from services.ssl_labs_service import ssl_labs_service
from services.web_alert_service import web_alert_service

router = APIRouter()

# Company CRUD Operations
@router.post("/", response_model=CompanyResponse)
async def create_company(
    company: CompanyCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create a new company for monitoring with user attribution and role separation"""
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    
    # Determine visibility and creator info
    if is_admin:
        # Admin creates global companies by default unless explicitly specified
        is_global = company.is_global if company.is_global is not None else True
        created_by_id = current_user.id if current_user else None
        created_by_name = current_user.name if current_user else "Admin"
        created_by_email = current_user.email if current_user else "admin@indigo.com"
    elif current_user:
        # Regular user creates user-scoped private company
        is_global = False
        created_by_id = current_user.id
        created_by_name = current_user.name
        created_by_email = current_user.email
    else:
        # Fallback if no user authenticated
        is_global = True
        created_by_id = None
        created_by_name = "System"
        created_by_email = None

    # Check for domain conflicts:
    # 1. Is there an active global company with this domain?
    global_company = db.query(Company).filter(
        Company.domain == company.domain,
        Company.is_global == True,
        Company.is_active == True
    ).first()
    if global_company:
        raise HTTPException(
            status_code=400, 
            detail="Domain is already being monitored globally by administrators"
        )
    
    # 2. Did this specific user already add this domain?
    if created_by_id:
        user_company = db.query(Company).filter(
            Company.domain == company.domain,
            Company.created_by_user_id == created_by_id
        ).first()
        if user_company:
            if not user_company.is_active:
                user_company.name = company.name
                user_company.industry = company.industry
                user_company.description = company.description
                user_company.monitoring_enabled = company.monitoring_enabled
                user_company.is_active = True
                db.commit()
                db.refresh(user_company)
                return user_company
            else:
                raise HTTPException(status_code=400, detail="Domain is already in your monitoring list")

    company_data = company.model_dump()
    company_data["is_global"] = is_global
    company_data["created_by_user_id"] = created_by_id
    company_data["created_by_user_name"] = created_by_name
    company_data["created_by_user_email"] = created_by_email
    
    db_company = Company(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(db_company)
    except Exception:
        pass
        
    return db_company

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = True,
    filter_by: Optional[str] = Query(None, description="Filter: all, global, my, users"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get companies filtered by user role and ownership"""
    query = db.query(Company)
    if active_only:
        query = query.filter(Company.is_active == True)
        
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    
    if is_admin:
        # Admin can see all companies (global + all users' monitored companies)
        if filter_by == "global":
            query = query.filter(Company.is_global == True)
        elif filter_by == "my":
            query = query.filter(Company.created_by_user_id == current_user.id)
        elif filter_by == "users":
            query = query.filter(Company.is_global == False)
    elif current_user:
        # Regular logged-in user can only see Global companies OR their own monitored companies
        if filter_by == "global":
            query = query.filter(Company.is_global == True)
        elif filter_by == "my":
            query = query.filter(Company.created_by_user_id == current_user.id, Company.is_global == False)
        else:
            query = query.filter(
                or_(
                    Company.is_global == True,
                    Company.created_by_user_id == current_user.id
                )
            )
    else:
        # Unauthenticated: show global companies only
        query = query.filter(Company.is_global == True)
        
    return query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{company_id}", response_model=CompanyWithDetails)
async def get_company(
    company_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get company details with latest risk assessment, threat counts, and access verification"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    # Verify access: global OR created by current user OR admin
    if not company.is_global and not is_admin:
        if not current_user or company.created_by_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to view this company")
    
    # Get latest risk assessment
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    # Get threat counts
    active_threats_count = db.query(CompanyThreat)\
        .filter(CompanyThreat.company_id == company_id, CompanyThreat.status == "ACTIVE")\
        .count()
    total_threats_count = db.query(CompanyThreat)\
        .filter(CompanyThreat.company_id == company_id)\
        .count()
    
    company_dict = CompanyResponse.model_validate(company).model_dump()
    company_dict["latest_risk_assessment"] = CompanyRiskAssessmentResponse.model_validate(latest_assessment) if latest_assessment else None
    company_dict["active_threats_count"] = active_threats_count
    company_dict["total_threats_count"] = total_threats_count
    
    return company_dict

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int, 
    company_update: CompanyUpdate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Update company details with role/ownership permission check"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    if not is_admin:
        if not current_user or company.created_by_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Permission denied: You can only update companies you created")
    
    update_data = company_update.model_dump(exclude_unset=True)
    # Non-admins cannot toggle is_global
    if not is_admin and "is_global" in update_data:
        del update_data["is_global"]

    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(company)
    except Exception:
        pass
    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Delete a company permanently from monitoring with role permission check"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    if not is_admin:
        if company.is_global:
            raise HTTPException(status_code=403, detail="Permission denied: Regular users cannot remove global admin companies")
        if not current_user or company.created_by_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Permission denied: You can only delete companies you have added")
    
    db.delete(company)
    db.commit()
    try:
        from services.firebase_service import firebase_service
        firebase_service.delete_document_sync('companies', str(company_id))
    except Exception:
        pass
    return {"message": "Company deleted successfully"}

# Company Threat Operations
@router.post("/{company_id}/threats", response_model=CompanyThreatResponse)
async def create_threat(company_id: int, threat: CompanyThreatCreate, db: Session = Depends(get_db)):
    """Add a threat to a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_threat = CompanyThreat(**threat.model_dump(), company_id=company_id)
    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)
    return db_threat

@router.get("/{company_id}/threats", response_model=List[CompanyThreatResponse])
async def get_threats(
    company_id: int,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get threats for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    query = db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id)
    
    if status:
        query = query.filter(CompanyThreat.status == status)
    if severity:
        query = query.filter(CompanyThreat.severity == severity)
    
    return query.order_by(CompanyThreat.last_seen.desc()).offset(skip).limit(limit).all()

@router.put("/threats/{threat_id}", response_model=CompanyThreatResponse)
async def update_threat(threat_id: int, threat_update: dict, db: Session = Depends(get_db)):
    """Update threat status or details"""
    threat = db.query(CompanyThreat).filter(CompanyThreat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    for field, value in threat_update.items():
        if hasattr(threat, field):
            setattr(threat, field, value)
    
    threat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(threat)
    return threat

# Company Risk Assessment Operations
@router.post("/{company_id}/assessments", response_model=CompanyRiskAssessmentResponse)
async def create_risk_assessment(company_id: int, assessment: CompanyRiskAssessmentCreate, db: Session = Depends(get_db)):
    """Create a risk assessment for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_assessment = CompanyRiskAssessment(**assessment.model_dump(), company_id=company_id)
    db.add(db_assessment)
    
    # Update company last_analyzed timestamp
    company.last_analyzed = datetime.utcnow()
    
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/{company_id}/assessments", response_model=List[CompanyRiskAssessmentResponse])
async def get_risk_assessments(
    company_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get risk assessments for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

# Analyze Company Domain
@router.post("/{company_id}/analyze")
async def analyze_company(company_id: int, db: Session = Depends(get_db)):
    """Analyze company domain using threat intelligence APIs"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Use domain analysis service to get threat intelligence
    analysis_result = await domain_service.analyze_domain(company.domain)
    
    # Create risk assessment
    vuln_count = analysis_result.get("total_vulnerabilities") or len(analysis_result.get("vulnerabilities", [])) or analysis_result.get("nvd_data", {}).get("total_vulnerabilities", 0)
    risk_assessment = CompanyRiskAssessment(
        company_id=company_id,
        risk_level=analysis_result.get("risk_level", "MEDIUM"),
        security_score=analysis_result.get("security_score", 50),
        active_incidents=analysis_result.get("active_incidents", 0),
        abuse_confidence_score=analysis_result.get("abuse_confidence_score", 0),
        reputation_score=analysis_result.get("reputation_score", 50),
        vulnerabilities_count=vuln_count,
        ssl_valid=analysis_result.get("ssl_certificate", {}).get("valid", True),
        domain_age_days=analysis_result.get("domain_age_days"),
        country=analysis_result.get("country"),
        isp=analysis_result.get("isp"),
        assessment_details=json.dumps(analysis_result)
    )
    db.add(risk_assessment)
    
    # Create threats from analysis with API source information
    for threat_data in analysis_result.get("threats", []):
        threat = CompanyThreat(
            company_id=company_id,
            threat_type=threat_data.get("type", "Unknown"),
            severity=threat_data.get("severity", "MEDIUM"),
            description=threat_data.get("type"),
            source=threat_data.get("source", "Domain Analysis"),
            confidence_score=threat_data.get("confidence", 70),
            status="ACTIVE"
        )
        db.add(threat)
    
    # Update company last_analyzed
    company.last_analyzed = datetime.utcnow()
    
    db.commit()
    db.refresh(risk_assessment)
    
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(company)
        firebase_service.sync_risk_assessment_to_firestore(risk_assessment)
    except Exception:
        pass
    
    return {
        "message": "Company analyzed successfully",
        "risk_assessment": CompanyRiskAssessmentResponse.model_validate(risk_assessment),
        "threats_found": len(analysis_result.get("threats", [])),
        "analysis_data": analysis_result,
        "api_sources": {
            "urlscan": "urlscan_data" in analysis_result,
            "abuseipdb": "abuseipdb_data" in analysis_result,
            "virustotal": "virustotal_data" in analysis_result,
            "alienvault": "alienvault_data" in analysis_result,
            "whoisxml": "whois_data" in analysis_result
        }
    }

@router.get("/{company_id}/analysis")
async def get_company_analysis(company_id: int, refresh: bool = False, db: Session = Depends(get_db)):
    """Get full domain intelligence analysis (including VirusTotal, Vulnerabilities, Resolved IPs) for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if we have recent stored assessment details unless refresh requested
    if not refresh:
        latest_assessment = db.query(CompanyRiskAssessment)\
            .filter(CompanyRiskAssessment.company_id == company_id)\
            .order_by(CompanyRiskAssessment.created_at.desc())\
            .first()
        if latest_assessment and latest_assessment.assessment_details:
            try:
                data = json.loads(latest_assessment.assessment_details)
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "analysis_data": data,
                    "from_cache": True
                }
            except Exception:
                pass
    
    # Run fresh live analysis
    analysis_result = await domain_service.analyze_domain(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "analysis_data": analysis_result,
        "from_cache": False
    }

# Threat History and Trends
@router.get("/{company_id}/threat-history")
async def get_threat_history(
    company_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get threat history for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get threat history from domain analysis service
    history = domain_service.get_threat_history(company.domain, days)
    
    # Also get historical risk assessments from database
    db_assessments = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .limit(days)\
        .all()
    
    return {
        "domain_history": history,
        "database_assessments": [
            {
                "id": a.id,
                "risk_level": a.risk_level,
                "security_score": a.security_score,
                "active_incidents": a.active_incidents,
                "created_at": a.created_at.isoformat()
            }
            for a in db_assessments
        ]
    }

@router.get("/{company_id}/threat-trends")
async def get_threat_trends(
    company_id: int,
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db)
):
    """Get threat trends for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get threat trends from domain analysis service
    trends = domain_service.get_threat_trends(company.domain, days)
    
    return trends

# SSL Certificate Analysis
@router.post("/{company_id}/ssl-certificate")
async def analyze_ssl_certificate(company_id: int, db: Session = Depends(get_db)):
    """Analyze SSL certificate for company domain using SSL Labs API"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Use SSL Labs service to analyze SSL certificate
    ssl_data = await ssl_labs_service.analyze_domain(company.domain)
    
    return {
        "message": "SSL certificate analysis completed",
        "company_id": company_id,
        "domain": company.domain,
        "ssl_data": ssl_data
    }

@router.get("/{company_id}/ssl-certificate")
async def get_ssl_certificate(company_id: int, db: Session = Depends(get_db)):
    """Get SSL certificate analysis for company domain"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Use SSL Labs service to analyze SSL certificate
    ssl_data = await ssl_labs_service.analyze_domain(company.domain)
    
    return {
        "company_id": company_id,
        "domain": company.domain,
        "ssl_data": ssl_data
    }

# Web Alerts Search
@router.post("/{company_id}/web-alerts")
async def search_web_alerts(company_id: int, days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Search for security alerts and incidents about the company across the web"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Use web alert service to search for alerts
    alert_data = await web_alert_service.search_company_alerts(company.name, company.domain, days)
    
    return {
        "message": "Web alert search completed",
        "company_id": company_id,
        "company_name": company.name,
        "domain": company.domain,
        "alert_data": alert_data
    }

@router.get("/{company_id}/web-alerts")
async def get_web_alerts(company_id: int, days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Get web alerts for the company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Use web alert service to search for alerts
    alert_data = await web_alert_service.search_company_alerts(company.name, company.domain, days)
    
    return {
        "company_id": company_id,
        "company_name": company.name,
        "domain": company.domain,
        "alert_data": alert_data
    }
