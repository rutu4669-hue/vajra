from fastapi import APIRouter, HTTPException, Query
from services.alienvault_service import alienvault_service
from services.gridinsoft_service import gridinsoft_service
from services.nvd_service import nvd_service
from typing import Dict, Any

router = APIRouter()

@router.get("/scan")
async def scan_domain_risk(domain: str = Query(..., description="The domain/IP to scan (e.g. example.com or 8.8.8.8)")):
    if not domain or ("." not in domain and ":" not in domain):
        raise HTTPException(status_code=400, detail="Invalid domain or IP format. Input must contain a valid separator.")
    
    # Clean domain input
    clean_domain = domain.lower().strip()
    if clean_domain.startswith("http://"):
        clean_domain = clean_domain[7:]
    elif clean_domain.startswith("https://"):
        clean_domain = clean_domain[8:]
    if clean_domain.startswith("www."):
        clean_domain = clean_domain[4:]
    
    # Strip any trailing paths
    clean_domain = clean_domain.split("/")[0]
    
    # Get AlienVault domain risk data
    result = await alienvault_service.check_domain_risk(clean_domain)
    
    # Get Gridinsoft domain information
    gridinsoft_data = await gridinsoft_service.get_domain_info(clean_domain)
    
    # Get NVD vulnerability data
    nvd_data = await nvd_service.get_domain_vulnerabilities(clean_domain)
    
    # Merge the data
    result.update({
        "trust_score": gridinsoft_data.get("trust_score"),
        "domain_age": gridinsoft_data.get("domain_age"),
        "global_rank": gridinsoft_data.get("global_rank"),
        "location": gridinsoft_data.get("location"),
        "is_malicious": gridinsoft_data.get("is_malicious"),
        "threat_level": gridinsoft_data.get("threat_level"),
        "categories": gridinsoft_data.get("categories"),
        "ssl_info": gridinsoft_data.get("ssl_info"),
        "dns_info": gridinsoft_data.get("dns_info"),
        "analysis": gridinsoft_data.get("analysis"),
        "history": gridinsoft_data.get("history"),
        "connections": gridinsoft_data.get("connections"),
        "security": gridinsoft_data.get("security"),
        # NVD vulnerability data
        "vulnerabilities": nvd_data.get("vulnerabilities", []),
        "total_vulnerabilities": nvd_data.get("total_vulnerabilities", 0),
        "vulnerability_risk_score": nvd_data.get("risk_score", 0),
        "high_critical_vulnerabilities": nvd_data.get("high_critical_count", 0)
    })
    
    return result
