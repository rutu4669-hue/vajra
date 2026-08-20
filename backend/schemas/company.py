from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., description="Company name")
    domain: str = Field(..., description="Company domain")
    industry: Optional[str] = Field(None, description="Industry sector")
    description: Optional[str] = Field(None, description="Company description")
    logo_url: Optional[str] = Field(None, description="Company logo URL")
    monitoring_enabled: bool = Field(True, description="Whether monitoring is enabled")

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    monitoring_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

class CompanyResponse(CompanyBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_analyzed: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CompanyThreatBase(BaseModel):
    threat_type: str = Field(..., description="Type of threat")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    description: Optional[str] = Field(None, description="Threat description")
    source: Optional[str] = Field(None, description="Threat intelligence source")
    confidence_score: int = Field(0, ge=0, le=100, description="Confidence score 0-100")
    status: str = Field("ACTIVE", description="Status: ACTIVE, RESOLVED, IGNORED")

class CompanyThreatCreate(CompanyThreatBase):
    company_id: int

class CompanyThreatResponse(CompanyThreatBase):
    id: int
    company_id: int
    first_seen: datetime
    last_seen: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CompanyRiskAssessmentBase(BaseModel):
    risk_level: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")
    security_score: int = Field(0, ge=0, le=100, description="Security score 0-100")
    active_incidents: int = Field(0, description="Number of active incidents")
    abuse_confidence_score: int = Field(0, ge=0, le=100, description="Abuse confidence score")
    reputation_score: int = Field(0, ge=0, le=100, description="Reputation score")
    vulnerabilities_count: int = Field(0, description="Number of vulnerabilities")
    ssl_valid: bool = Field(True, description="SSL certificate validity")
    domain_age_days: Optional[int] = Field(None, description="Domain age in days")
    country: Optional[str] = Field(None, description="Country code")
    isp: Optional[str] = Field(None, description="ISP name")
    assessment_details: Optional[str] = Field(None, description="Additional assessment details (JSON)")

class CompanyRiskAssessmentCreate(CompanyRiskAssessmentBase):
    company_id: int

class CompanyRiskAssessmentResponse(CompanyRiskAssessmentBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CompanyWithDetails(CompanyResponse):
    latest_risk_assessment: Optional[CompanyRiskAssessmentResponse] = None
    active_threats_count: int = 0
    total_threats_count: int = 0
