from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import text
from models.user import User
from models.admin_models import SystemConfiguration, AdminAuditLog
from admin.schemas import AdminUserResponse, AdminUserDetail, UserRoleUpdate, SystemConfig, AuditLog, AdminStats
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_users(self) -> List[AdminUserResponse]:
        """Get all users with full transparency"""
        users = self.db.query(User).all()
        return [AdminUserResponse.model_validate(user) for user in users]

    def get_user_by_id(self, user_id: int) -> Optional[AdminUserDetail]:
        """Get user details including password (for admin visibility)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            return AdminUserDetail.model_validate(user)
        return None

    def get_user_by_email(self, email: str) -> Optional[AdminUserDetail]:
        """Get user details by email including password"""
        user = self.db.query(User).filter(User.email == email).first()
        if user:
            return AdminUserDetail.model_validate(user)
        return None

    def update_user_role(self, user_id: int, role_update: UserRoleUpdate, admin_id: int) -> Optional[AdminUserResponse]:
        """Update user role and active status"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            old_role = user.role
            user.role = role_update.role
            user.is_active = role_update.is_active
            self.db.commit()
            self.db.refresh(user)
            
            # Log the action
            self._log_audit(
                admin_id=admin_id,
                action="UPDATE_USER_ROLE",
                resource_type="user",
                resource_id=user_id,
                details=f"Changed role from {old_role} to {role_update.role}, active: {role_update.is_active}"
            )
            
            return AdminUserResponse.model_validate(user)
        return None

    def update_user_password(self, user_id: int, new_password: str, admin_id: int) -> bool:
        """Update user password (admin override)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.hashed_password = pwd_context.hash(new_password)
            self.db.commit()
            return True
        return False

    def delete_user(self, user_id: int, admin_id: int) -> bool:
        """Delete a user account"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            self.db.delete(user)
            self.db.commit()
            
            # Log the action
            self._log_audit(
                admin_id=admin_id,
                action="DELETE_USER",
                resource_type="user",
                resource_id=user_id,
                details=f"Deleted user: {user.email}"
            )
            
            return True
        return False

    def get_all_configurations(self) -> List[SystemConfig]:
        """Get all system configurations"""
        configs = self.db.query(SystemConfiguration).all()
        return [SystemConfig.model_validate(config) for config in configs]

    def get_configuration(self, key: str) -> Optional[SystemConfig]:
        """Get specific configuration by key"""
        config = self.db.query(SystemConfiguration).filter(SystemConfiguration.key == key).first()
        if config:
            return SystemConfig.model_validate(config)
        return None

    def update_configuration(self, key: str, value: str, admin_id: int) -> Optional[SystemConfig]:
        """Update system configuration"""
        config = self.db.query(SystemConfiguration).filter(SystemConfiguration.key == key).first()
        if config:
            old_value = config.value
            config.value = value
            config.updated_at = datetime.utcnow()
            config.updated_by = admin_id
            self.db.commit()
            self.db.refresh(config)
            
            # Log the action
            self._log_audit(
                admin_id=admin_id,
                action="UPDATE_CONFIG",
                resource_type="configuration",
                resource_id=config.id,
                details=f"Changed {key} from {old_value} to {value}"
            )
            
            return SystemConfig.model_validate(config)
        return None

    def create_configuration(self, config: SystemConfig, admin_id: int) -> SystemConfig:
        """Create new system configuration"""
        db_config = SystemConfiguration(
            key=config.key,
            value=config.value,
            description=config.description,
            category=config.category,
            is_sensitive=config.is_sensitive,
            updated_by=admin_id
        )
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        
        # Log the action
        self._log_audit(
            admin_id=admin_id,
            action="CREATE_CONFIG",
            resource_type="configuration",
            resource_id=db_config.id,
            details=f"Created configuration: {config.key}"
        )
        
        return SystemConfig.model_validate(db_config)

    def get_audit_logs(self, limit: int = 100) -> List[AuditLog]:
        """Get recent audit logs"""
        logs = self.db.query(AdminAuditLog).order_by(AdminAuditLog.timestamp.desc()).limit(limit).all()
        return [AuditLog.model_validate(log) for log in logs]

    def get_admin_stats(self) -> AdminStats:
        """Get admin dashboard statistics using raw SQL"""
        # Get total users
        result = self.db.execute(text("SELECT COUNT(*) FROM users"))
        total_users = result.fetchone()[0]
        
        # Get active users
        result = self.db.execute(text("SELECT COUNT(*) FROM users WHERE is_active = 1"))
        active_users = result.fetchone()[0]
        
        # Get unique roles
        result = self.db.execute(text("SELECT DISTINCT role FROM users"))
        roles = [row[0] for row in result.fetchall()]
        
        # Get recent logins (last 24 hours) - using audit logs
        recent_logins = self.db.query(AdminAuditLog).filter(
            AdminAuditLog.action == "USER_LOGIN",
            AdminAuditLog.timestamp >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        return AdminStats(
            total_users=total_users,
            active_users=active_users,
            total_roles=roles,
            recent_logins=recent_logins,
            system_status="operational"
        )

    def _log_audit(self, admin_id: int, action: str, resource_type: str, 
                   resource_id: Optional[int], details: str, ip_address: Optional[str] = None):
        """Internal method to log admin actions"""
        log = AdminAuditLog(
            admin_id=admin_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address
        )
        self.db.add(log)
        self.db.commit()
