from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from services.domain_analysis_service import domain_service
from typing import Optional, List

router = APIRouter()

class ThreatItem(BaseModel):
    type: str
    severity: str
    first_seen: str
    last_seen: str
    confidence: int
    source: Optional[str] = None

    model_config = {"extra": "allow"}

class DomainAnalysisResponse(BaseModel):
    target: str
    risk_level: str
    active_incidents: int
    security_score: int
    last_scanned: str
    threats: List[ThreatItem]
    country: Optional[str] = None
    isp: Optional[str] = None
    abuse_confidence_score: Optional[int] = None
    total_reports: Optional[int] = None
    reputation_score: Optional[int] = None
    pulse_count: Optional[int] = None
    urlscan_data: Optional[dict] = None
    virustotal_data: Optional[dict] = None
    abuseipdb_data: Optional[dict] = None
    alienvault_data: Optional[dict] = None
    domain_age_days: Optional[int] = None
    ssl_certificate: Optional[dict] = None
    dns_records: Optional[dict] = None
    last_reported: Optional[str] = None
    whois_data: Optional[dict] = None
    gridinsoft_data: Optional[dict] = None
    domscan_data: Optional[dict] = None
    vulnerabilities: Optional[List[dict]] = None
    total_vulnerabilities: Optional[int] = None
    vulnerability_risk_score: Optional[int] = None
    high_critical_vulnerabilities: Optional[int] = None
    connections: Optional[dict] = None

    model_config = {"extra": "allow"}

@router.get("/analyze", response_model=DomainAnalysisResponse)
async def analyze_domain(domain: str = Query(..., description="Domain or IP address to analyze")):
    """Analyze a domain or IP address for security risks using multi-source threat intelligence."""
    try:
        if not domain or not domain.strip():
            raise HTTPException(status_code=400, detail="Domain or IP address is required")

        result = await domain_service.analyze_domain(domain.strip())

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing domain: {str(e)}")


@router.get("/validate")
async def validate_domain(domain: str = Query(..., description="Domain or IP to validate")):
    """Validate if the input is a proper domain or IP address format."""
    try:
        is_domain = domain_service.is_valid_domain(domain)
        is_ip = domain_service.is_valid_ip(domain)
        return {
            "valid": is_domain or is_ip,
            "type": "domain" if is_domain else ("ip" if is_ip else "invalid"),
            "input": domain,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating domain: {str(e)}")
