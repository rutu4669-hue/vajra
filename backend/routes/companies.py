from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
import json
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime

from database.database import get_db, SessionLocal
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

async def perform_company_analysis_internal(company_id: int):
    """Internal helper to analyze company domain and save full vulnerability & VirusTotal intelligence to DB"""
    db = SessionLocal()
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return None
        
        analysis_result = await domain_service.analyze_domain(company.domain)
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
        
        # Clear existing active threats for this company to avoid stale duplicates
        db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id).delete()
        
        for threat_data in analysis_result.get("threats", []):
            threat = CompanyThreat(
                company_id=company_id,
                threat_type=threat_data.get("type", "Unknown"),
                severity=threat_data.get("severity", "MEDIUM"),
                description=threat_data.get("type"),
                source=threat_data.get("source", "Threat Intelligence"),
                confidence_score=threat_data.get("confidence", 70),
                status="ACTIVE"
            )
            db.add(threat)
        
        company.last_analyzed = datetime.utcnow()
        db.commit()
        db.refresh(risk_assessment)
        
        try:
            from services.firebase_service import firebase_service
            firebase_service.sync_company_to_firestore(company)
            firebase_service.sync_risk_assessment_to_firestore(risk_assessment)
        except Exception:
            pass
            
        return risk_assessment
    except Exception as e:
        db.rollback()
        return None
    finally:
        db.close()

# Company CRUD Operations
@router.post("/", response_model=CompanyWithDetails)
async def create_company(
    company: CompanyCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create a new company for monitoring, save to DB, and immediately trigger background vulnerability & threat analysis"""
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    
    # Determine visibility and creator info
    if is_admin:
        is_global = company.is_global if company.is_global is not None else True
        created_by_id = current_user.id if current_user else None
        created_by_name = current_user.name if current_user else "Admin"
        created_by_email = current_user.email if current_user else "admin@indigo.com"
    elif current_user:
        is_global = False
        created_by_id = current_user.id
        created_by_name = current_user.name
        created_by_email = current_user.email
    else:
        is_global = True
        created_by_id = None
        created_by_name = "System"
        created_by_email = "system@indigo.com"

    # Check for domain duplication
    clean_domain = company.domain.strip().lower()
    if is_global:
        existing_global = db.query(Company).filter(Company.domain == clean_domain, Company.is_global == True).first()
        if existing_global:
            if not existing_global.is_active:
                existing_global.is_active = True
                db.commit()
                db.refresh(existing_global)
                background_tasks.add_task(perform_company_analysis_internal, existing_global.id)
                comp_dict = CompanyResponse.model_validate(existing_global).model_dump()
                comp_dict["latest_risk_assessment"] = None
                comp_dict["active_threats_count"] = 0
                comp_dict["total_threats_count"] = 0
                return comp_dict
            else:
                raise HTTPException(status_code=400, detail="Global company with this domain already exists")
    else:
        if current_user:
            user_company = db.query(Company).filter(
                Company.domain == clean_domain,
                Company.created_by_user_id == current_user.id,
                Company.is_global == False
            ).first()
            if user_company:
                if not user_company.is_active:
                    user_company.is_active = True
                    db.commit()
                    db.refresh(user_company)
                    background_tasks.add_task(perform_company_analysis_internal, user_company.id)
                    comp_dict = CompanyResponse.model_validate(user_company).model_dump()
                    comp_dict["latest_risk_assessment"] = None
                    comp_dict["active_threats_count"] = 0
                    comp_dict["total_threats_count"] = 0
                    return comp_dict
                else:
                    raise HTTPException(status_code=400, detail="Domain is already in your monitoring list")

    company_data = company.model_dump()
    company_data["domain"] = clean_domain
    company_data["is_global"] = is_global
    company_data["created_by_user_id"] = created_by_id
    company_data["created_by_user_name"] = created_by_name
    company_data["created_by_user_email"] = created_by_email
    
    db_company = Company(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    # Automatically schedule background domain analysis to fetch vulnerabilities, VirusTotal reputation, and IPs immediately
    background_tasks.add_task(perform_company_analysis_internal, db_company.id)
    
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(db_company)
    except Exception:
        pass
        
    comp_dict = CompanyResponse.model_validate(db_company).model_dump()
    comp_dict["latest_risk_assessment"] = None
    comp_dict["active_threats_count"] = 0
    comp_dict["total_threats_count"] = 0
    return comp_dict

@router.get("/", response_model=List[CompanyWithDetails])
async def get_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = True,
    filter_by: Optional[str] = Query(None, description="Filter: all, global, my, users"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get companies with latest risk assessment, vulnerability count, and threat statistics"""
    query = db.query(Company)
    if active_only:
        query = query.filter(Company.is_active == True)
        
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    
    if is_admin:
        if filter_by == "global":
            query = query.filter(Company.is_global == True)
        elif filter_by == "my":
            query = query.filter(Company.created_by_user_id == current_user.id)
        elif filter_by == "users":
            query = query.filter(Company.is_global == False)
    elif current_user:
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
        if filter_by == "global":
            query = query.filter(Company.is_global == True)
        elif filter_by == "users":
            query = query.filter(Company.is_global == False)
        
    companies_list = query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for c in companies_list:
        latest_assessment = db.query(CompanyRiskAssessment)\
            .filter(CompanyRiskAssessment.company_id == c.id)\
            .order_by(CompanyRiskAssessment.created_at.desc())\
            .first()
        active_threats = db.query(CompanyThreat)\
            .filter(CompanyThreat.company_id == c.id, CompanyThreat.status == "ACTIVE")\
            .count()
        total_threats = db.query(CompanyThreat)\
            .filter(CompanyThreat.company_id == c.id)\
            .count()
        c_dict = CompanyResponse.model_validate(c).model_dump()
        c_dict["latest_risk_assessment"] = CompanyRiskAssessmentResponse.model_validate(latest_assessment) if latest_assessment else None
        c_dict["active_threats_count"] = active_threats
        c_dict["total_threats_count"] = total_threats
        results.append(c_dict)
    return results

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
    if not company.is_global and not is_admin:
        if not current_user or company.created_by_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to view this company")
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
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
    
    db_threat = CompanyThreat(
        company_id=company_id,
        threat_type=threat.threat_type,
        severity=threat.severity,
        description=threat.description,
        source=threat.source,
        confidence_score=threat.confidence_score,
        status=threat.status,
        first_seen=datetime.utcnow(),
        last_seen=datetime.utcnow()
    )
    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)
    return db_threat

@router.get("/{company_id}/threats", response_model=List[CompanyThreatResponse])
async def get_company_threats(
    company_id: int, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all threats for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    query = db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id)
    if status:
        query = query.filter(CompanyThreat.status == status)
    
    return query.order_by(CompanyThreat.last_seen.desc()).all()

@router.put("/threats/{threat_id}/status")
async def update_threat_status(threat_id: int, status: str, db: Session = Depends(get_db)):
    """Update threat status (ACTIVE, RESOLVED, IGNORED)"""
    threat = db.query(CompanyThreat).filter(CompanyThreat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    threat.status = status
    db.commit()
    return {"message": "Threat status updated successfully"}

# Company Risk Assessment Operations
@router.post("/{company_id}/assessments", response_model=CompanyRiskAssessmentResponse)
async def create_risk_assessment(
    company_id: int, 
    assessment: CompanyRiskAssessmentCreate, 
    db: Session = Depends(get_db)
):
    """Create a new risk assessment for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_assessment = CompanyRiskAssessment(
        company_id=company_id,
        **assessment.model_dump()
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/{company_id}/assessments", response_model=List[CompanyRiskAssessmentResponse])
async def get_company_assessments(
    company_id: int,
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get risk assessment history for a company"""
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
    """Analyze company domain and refresh vulnerability, VirusTotal, and threat telemetry"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Run analysis
    analysis_result = await domain_service.analyze_domain(company.domain)
    
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
    
    # Refresh threats
    db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id).delete()
    for threat_data in analysis_result.get("threats", []):
        threat = CompanyThreat(
            company_id=company_id,
            threat_type=threat_data.get("type", "Unknown"),
            severity=threat_data.get("severity", "MEDIUM"),
            description=threat_data.get("type"),
            source=threat_data.get("source", "Threat Intelligence"),
            confidence_score=threat_data.get("confidence", 70),
            status="ACTIVE"
        )
        db.add(threat)
    
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
        "analysis_data": analysis_result
    }

@router.get("/{company_id}/analysis")
async def get_company_analysis(company_id: int, refresh: bool = False, db: Session = Depends(get_db)):
    """Get full domain intelligence analysis (including VirusTotal, Vulnerabilities, Resolved IPs) for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
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
    
    assessments = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.asc())\
        .limit(days)\
        .all()
    
    return [
        {
            "date": a.created_at.strftime("%Y-%m-%d"),
            "risk_score": a.security_score,
            "threats_count": a.active_incidents,
            "vulnerabilities_count": a.vulnerabilities_count
        }
        for a in assessments
    ]
