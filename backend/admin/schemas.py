from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class AdminUserDetail(BaseModel):
    id: int
    email: EmailStr
    name: str
    hashed_password: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str
    is_active: Optional[bool] = True

class UserPasswordUpdate(BaseModel):
    new_password: str

class ConfigurationItem(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class ConfigurationUpdate(BaseModel):
    key: str
    value: str

class SystemConfig(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    category: Optional[str] = "general"
    is_sensitive: bool = False

class AuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    resource_type: str
    resource_id: Optional[int]
    details: Optional[str]
    timestamp: datetime
    ip_address: Optional[str]
    
    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_roles: List[str]
    recent_logins: int
    system_status: str
