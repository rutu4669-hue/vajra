# VAJRA Security Platform - Complete Model Workflow Diagram

## Database Model Architecture & Data Flow

```mermaid
graph TD
    Start([User Action]) --> Frontend[Frontend - Next.js]
    Frontend --> StateCheck{State Management}
    StateCheck -->|New Action| APIRequest[API Request]
    StateCheck -->|Cached Data| DisplayCached[Display Cached Data]
    
    APIRequest --> RouteLayer[FastAPI Router Layer]
    RouteLayer --> AuthCheck{Authentication Check}
    AuthCheck -->|Invalid| AuthError[Return 401 Unauthorized]
    AuthCheck -->|Valid| RouteHandler[Route Handler]
    
    AuthError --> Frontend
    
    %% Database Models Flow
    RouteHandler --> ModelSelection{Select Model}
    
    ModelSelection -->|User Operations| UserModel[User Model]
    ModelSelection -->|Company Operations| CompanyModel[Company Model]
    ModelSelection -->|Threat Operations| ThreatModel[Threat Feed Model]
    ModelSelection -->|Alert Operations| AlertModel[Alert Model]
    ModelSelection -->|Ransomware Operations| RansomwareModel[Ransomware Incident Model]
    ModelSelection -->|Attack Operations| AttackModel[Attack Event Model]
    ModelSelection -->|Activity Operations| ActivityModel[Activity Log Model]
    
    %% User Model Flow
    UserModel --> UserDB[PostgreSQL - users table]
    UserDB --> UserFields{id, email, name, hashed_password, role, is_active, created_at, updated_at}
    UserFields --> UserOperations{User Operations}
    
    UserOperations -->|Register| UserRegister[INSERT new user]
    UserOperations -->|Login| UserLogin[SELECT user + password verify]
    UserOperations -->|Update| UserUpdate[UPDATE user profile]
    UserOperations -->|Delete| UserDelete[DELETE user record]
    
    UserRegister --> UserResponse[UserResponse Schema]
    UserLogin --> TokenGeneration[JWT Token Generation]
    UserUpdate --> UserResponse
    UserDelete --> DeleteConfirmation[Delete Confirmation]
    
    TokenGeneration --> TokenStorage[Token Storage]
    TokenStorage --> Frontend
    
    %% Company Model Flow
    CompanyModel --> CompanyDB[PostgreSQL - companies table]
    CompanyDB --> CompanyFields{id, name, domain, industry, description, logo_url, is_active, monitoring_enabled, created_at, updated_at, last_analyzed}
    CompanyFields --> CompanyRelations{Relationships}
    
    CompanyRelations --> CompanyThreats[CompanyThreat Model]
    CompanyRelations --> CompanyRisk[CompanyRiskAssessment Model]
    
    CompanyThreats --> ThreatDB[PostgreSQL - company_threats table]
    ThreatDB --> ThreatFields{id, company_id, threat_type, severity, description, source, confidence_score, status, first_seen, last_seen, created_at, updated_at}
    
    CompanyRisk --> RiskDB[PostgreSQL - company_risk_assessments table]
    RiskDB --> RiskFields{id, company_id, risk_level, security_score, active_incidents, abuse_confidence_score, reputation_score, vulnerabilities_count, ssl_valid, domain_age_days, country, isp, assessment_details, created_at, updated_at}
    
    CompanyFields --> CompanyOperations{Company Operations}
    CompanyOperations -->|Create| CompanyCreate[INSERT company]
    CompanyOperations -->|Read| CompanyRead[SELECT company with relations]
    CompanyOperations -->|Update| CompanyUpdate[UPDATE company]
    CompanyOperations -->|Delete| CompanyDelete[DELETE company + cascade]
    
    CompanyCreate --> CompanyResponse[Company Schema]
    CompanyRead --> CompanyDetailResponse[CompanyDetail Schema]
    CompanyUpdate --> CompanyResponse
    CompanyDelete --> DeleteConfirmation
    
    %% Threat Feed Model Flow
    ThreatModel --> ThreatFeedDB[PostgreSQL - threat_feeds table]
    ThreatFeedDB --> ThreatFeedFields{id, feed_name, feed_url, last_updated, status, ioc_count}
    ThreatFeedFields --> ThreatOperations{Threat Operations}
    
    ThreatOperations -->|Add Feed| ThreatAdd[INSERT threat feed]
    ThreatOperations -->|Update Feed| ThreatUpdate[UPDATE feed status]
    ThreatOperations -->|Query Feeds| ThreatQuery[SELECT active feeds]
    
    ThreatAdd --> ThreatResponse[ThreatFeed Schema]
    ThreatUpdate --> ThreatResponse
    ThreatQuery --> ThreatListResponse[List[ThreatFeed Schema]]
    
    %% Alert Model Flow
    AlertModel --> AlertDB[PostgreSQL - alerts table]
    AlertDB --> AlertFields{id, title, severity, description, source, time, created_at}
    AlertFields --> AlertOperations{Alert Operations}
    
    AlertOperations -->|Create| AlertCreate[INSERT alert]
    AlertOperations -->|Read| AlertRead[SELECT alerts]
    AlertOperations -->|Update| AlertUpdate[UPDATE alert status]
    AlertOperations -->|Delete| AlertDelete[DELETE alert]
    
    AlertCreate --> AlertResponse[Alert Schema]
    AlertRead --> AlertListResponse[List[Alert Schema]]
    AlertUpdate --> AlertResponse
    AlertDelete --> DeleteConfirmation
    
    %% Ransomware Model Flow
    RansomwareModel --> RansomwareDB[PostgreSQL - ransomware_incidents table]
    RansomwareDB --> RansomwareFields{id, group_name, target, country, published_date, impact, status, description, created_at}
    RansomwareFields --> RansomwareOperations{Ransomware Operations}
    
    RansomwareOperations -->|Add Incident| RansomwareAdd[INSERT incident]
    RansomwareOperations -->|Query| RansomwareQuery[SELECT incidents]
    RansomwareOperations -->|Group Query| RansomwareGroupQuery[SELECT by group_name]
    
    RansomwareAdd --> RansomwareResponse[RansomwareIncident Schema]
    RansomwareQuery --> RansomwareListResponse[List[RansomwareIncident Schema]]
    RansomwareGroupQuery --> RansomwareGroupResponse[List[RansomwareIncident Schema]]
    
    %% Attack Event Model Flow
    AttackModel --> AttackDB[PostgreSQL - attack_events table]
    AttackDB --> AttackFields{id, event_type, source_ip, target_ip, source_country, target_country, attack_vector, severity, description, timestamp}
    AttackFields --> AttackOperations{Attack Operations}
    
    AttackOperations -->|Log Event| AttackLog[INSERT attack event]
    AttackOperations -->|Query| AttackQuery[SELECT events]
    AttackOperations -->|Map Query| AttackMapQuery[SELECT for attack map]
    
    AttackLog --> AttackResponse[AttackEvent Schema]
    AttackQuery --> AttackListResponse[List[AttackEvent Schema]]
    AttackMapQuery --> AttackMapResponse[Attack event map data]
    
    %% Activity Log Model Flow
    ActivityModel --> ActivityDB[PostgreSQL - activity_logs table]
    ActivityDB --> ActivityFields{id, user_id, action, resource, details, ip_address, timestamp}
    ActivityFields --> ActivityOperations{Activity Operations}
    
    ActivityOperations -->|Log Activity| ActivityLogInsert[INSERT activity log]
    ActivityOperations -->|Query| ActivityQuery[SELECT user activities]
    ActivityOperations -->|Audit| ActivityAudit[SELECT for audit trail]
    
    ActivityLogInsert --> ActivityResponse[ActivityLog Schema]
    ActivityQuery --> ActivityListResponse[List[ActivityLog Schema]]
    ActivityAudit --> ActivityAuditResponse[Audit trail data]
    
    %% Service Layer Integration
    UserResponse --> ServiceLayer[Service Layer]
    CompanyDetailResponse --> ServiceLayer
    ThreatListResponse --> ServiceLayer
    AlertListResponse --> ServiceLayer
    RansomwareListResponse --> ServiceLayer
    AttackMapResponse --> ServiceLayer
    ActivityAuditResponse --> ServiceLayer
    
    ServiceLayer --> ExternalServices{External Services}
    
    ExternalServices --> AlienVault[AlienVault OTX Service]
    ExternalServices --> RansomwareLive[Ransomware.live Service]
    ExternalServices --> HackerNews[Hacker News Service]
    ExternalServices --> VirusTotal[VirusTotal Service]
    ExternalServices --> AbuseIPDB[AbuseIPDB Service]
    ExternalServices --> SSLLabs[SSL Labs Service]
    ExternalServices --> DomainAnalysis[Domain Analysis Service]
    ExternalServices --> Gemini[Gemini AI Service]
    ExternalServices --> HuggingFace[HuggingFace Service]
    
    AlienVault --> AlienVaultAPI[AlienVault OTX API]
    RansomwareLive --> RansomwareLiveAPI[Ransomware.live API]
    HackerNews --> HackerNewsAPI[Hacker News API]
    VirusTotal --> VirusTotalAPI[VirusTotal API]
    AbuseIPDB --> AbuseIPDBAPI[AbuseIPDB API]
    SSLLabs --> SSLLabsAPI[SSL Labs API]
    DomainAnalysis --> DomainAnalysisAPI[Domain Analysis APIs]
    Gemini --> GeminiAPI[Gemini AI API]
    HuggingFace --> HuggingFaceAPI[HuggingFace API]
    
    %% Data Processing Flow
    AlienVaultAPI --> DataProcessing[Data Processing]
    RansomwareLiveAPI --> DataProcessing
    HackerNewsAPI --> DataProcessing
    VirusTotalAPI --> DataProcessing
    AbuseIPDBAPI --> DataProcessing
    SSLLabsAPI --> DataProcessing
    DomainAnalysisAPI --> DataProcessing
    GeminiAPI --> DataProcessing
    HuggingFaceAPI --> DataProcessing
    
    DataProcessing --> DataTransformation{Data Transformation}
    DataTransformation --> DataValidation[Data Validation]
    DataValidation --> DataStorage[Database Storage]
    DataValidation --> DataCache[Redis Cache]
    
    DataStorage --> ServiceLayer
    DataCache --> ServiceLayer
    
    %% Response Flow
    ServiceLayer --> ResponseFormatting[Response Formatting]
    ResponseFormatting --> SchemaValidation[Schema Validation]
    SchemaValidation --> APIResponse[API Response]
    
    APIResponse --> Frontend
    Frontend --> StateUpdate[State Update]
    StateUpdate --> ComponentRender[Component Render]
    ComponentRender --> DisplayResult[Display Result]
    
    DisplayResult --> WebSocketNotify{WebSocket Notification}
    WebSocketNotify -->|Real-time Update| WebSocketPush[Push Update via WebSocket]
    WebSocketPush --> OtherClients[Other Clients]
    
    DisplayResult --> End([User Action Complete])
    
    %% Styling
    style Start fill:#4CAF50,color:#fff
    style End fill:#f44336,color:#fff
    style Frontend fill:#2196F3,color:#fff
    style UserModel fill:#9C27B0,color:#fff
    style CompanyModel fill:#FF9800,color:#fff
    style ThreatModel fill:#4CAF50,color:#fff
    style AlertModel fill:#f44336,color:#fff
    style RansomwareModel fill:#E91E63,color:#fff
    style AttackModel fill:#00BCD4,color:#fff
    style ActivityModel fill:#607D8B,color:#fff
    style ServiceLayer fill:#FFC107,color:#000
    style ExternalServices fill:#8BC34A,color:#000
    style DataProcessing fill:#03A9F4,color:#fff
```

## Detailed Model Relationships

### User Model Relationships
```
User Model (users table)
├── Fields: id, email, name, hashed_password, role, is_active, created_at, updated_at
├── Relationships: None (standalone model)
├── Operations: Register, Login, Update Profile, Delete
└── Security: Password hashing, JWT token generation
```

### Company Model Relationships
```
Company Model (companies table)
├── Fields: id, name, domain, industry, description, logo_url, is_active, monitoring_enabled, created_at, updated_at, last_analyzed
├── Relationships:
│   ├── One-to-Many with CompanyThreat (company_id)
│   └── One-to-Many with CompanyRiskAssessment (company_id)
├── Operations: Create, Read, Update, Delete with cascade
└── Monitoring: Continuous monitoring status tracking
```

### CompanyThreat Model Relationships
```
CompanyThreat Model (company_threats table)
├── Fields: id, company_id, threat_type, severity, description, source, confidence_score, status, first_seen, last_seen, created_at, updated_at
├── Relationships:
│   └── Many-to-One with Company (company_id)
├── Operations: Create, Read, Update, Delete
└── Tracking: Threat lifecycle management (ACTIVE, RESOLVED, IGNORED)
```

### CompanyRiskAssessment Model Relationships
```
CompanyRiskAssessment Model (company_risk_assessments table)
├── Fields: id, company_id, risk_level, security_score, active_incidents, abuse_confidence_score, reputation_score, vulnerabilities_count, ssl_valid, domain_age_days, country, isp, assessment_details, created_at, updated_at
├── Relationships:
│   └── Many-to-One with Company (company_id)
├── Operations: Create, Read, Update, Delete
└── Assessment: Comprehensive risk scoring and tracking
```

### Alert Model Relationships
```
Alert Model (alerts table)
├── Fields: id, title, severity, description, source, time, created_at
├── Relationships: None (standalone model)
├── Operations: Create, Read, Update, Delete
└── Severity Levels: critical, high, medium, low
```

### ThreatFeed Model Relationships
```
ThreatFeed Model (threat_feeds table)
├── Fields: id, feed_name, feed_url, last_updated, status, ioc_count
├── Relationships: None (standalone model)
├── Operations: Add Feed, Update Feed, Query Feeds
└── Status Tracking: active, inactive, error
```

### RansomwareIncident Model Relationships
```
RansomwareIncident Model (ransomware_incidents table)
├── Fields: id, group_name, target, country, published_date, impact, status, description, created_at
├── Relationships: None (standalone model)
├── Operations: Add Incident, Query Incidents, Group Query
└── Impact Levels: Critical, High, Medium, Low
```

### AttackEvent Model Relationships
```
AttackEvent Model (attack_events table)
├── Fields: id, event_type, source_ip, target_ip, source_country, target_country, attack_vector, severity, description, timestamp
├── Relationships: None (standalone model)
├── Operations: Log Event, Query Events, Map Query
└── Geographic: Source and target country tracking
```

### ActivityLog Model Relationships
```
ActivityLog Model (activity_logs table)
├── Fields: id, user_id, action, resource, details, ip_address, timestamp
├── Relationships: None (standalone model)
├── Operations: Log Activity, Query Activities, Audit Trail
└── Audit: Complete user action tracking
```

## Service Layer Data Flow

### AlienVault Service Flow
```
Request → AlienVault Service → OTX API → Threat Data → IOC Processing → Database Storage → Response
```

### Ransomware Service Flow
```
Request → Ransomware Service → Ransomware.live API → Incident Data → Statistics Calculation → Database Storage → Response
```

### Hacker News Service Flow
```
Request → Hacker News Service → HN API → News Stories → Keyword Filtering → Relevance Scoring → Response
```

### Domain Analysis Service Flow
```
Request → Domain Analysis Service → Multiple APIs → Risk Assessment → SSL Check → Reputation Check → Response
```

### PDF Service Flow
```
Request → PDF Service → Data Aggregation → Template Processing → Black/White Styling → PDF Generation → File Download
```

## API Route to Model Mapping

### Authentication Routes
```
POST /api/auth/register → User Model (INSERT)
POST /api/auth/login → User Model (SELECT) + JWT Generation
POST /api/auth/refresh → User Model (SELECT) + Token Refresh
```

### Dashboard Routes
```
GET /api/dashboard/summary → Multiple Models + External APIs
GET /api/dashboard/alerts → Alert Model (SELECT)
GET /api/dashboard/attack-map → AttackEvent Model (SELECT)
```

### Company Routes
```
GET /api/companies → Company Model (SELECT)
GET /api/companies/{id} → Company Model + Relations (SELECT)
POST /api/companies → Company Model (INSERT)
PUT /api/companies/{id} → Company Model (UPDATE)
DELETE /api/companies/{id} → Company Model (DELETE with cascade)
```

### Threat Intelligence Routes
```
GET /api/threat-intelligence → ThreatFeed Model + AlienVault Service
GET /api/threat-intelligence/trend → Historical Data Processing
GET /api/threat-intelligence/actors → Threat Actor Data
GET /api/threat-intelligence/industries → Industry Data
```

### Ransomware Routes
```
GET /api/ransomware → RansomwareIncident Model + Ransomware Service
GET /api/ransomware/stats → Statistics Calculation
GET /api/ransomware/group/{name} → RansomwareIncident Model (WHERE group_name)
```

### Alert Routes
```
GET /api/alerts → Alert Model (SELECT)
POST /api/alerts → Alert Model (INSERT)
PUT /api/alerts/{id} → Alert Model (UPDATE)
DELETE /api/alerts/{id} → Alert Model (DELETE)
```

### Report Routes
```
GET /api/reports/threat-intelligence → PDF Service + Threat Data
GET /api/reports/ransomware → PDF Service + Ransomware Data
GET /api/reports/global-attacks → PDF Service + Attack Data
GET /api/reports/company/{id} → PDF Service + Company Data
GET /api/reports/executive → PDF Service + Executive Data
GET /api/reports/comprehensive → PDF Service + All Data
```

## Data Validation Flow

```
User Input → Frontend Validation → API Request → Schema Validation → Database Validation → Business Logic Validation → Response
```

## Error Handling Flow

```
Error Detection → Error Logging → User Notification → Fallback Data → Graceful Degradation → Recovery Attempt
```

## Caching Strategy Flow

```
Request → Cache Check → Cache Hit → Return Cached Data
Request → Cache Check → Cache Miss → Database Query → Cache Update → Return Data
```

## WebSocket Real-time Flow

```
Event Trigger → WebSocket Manager → Connected Clients → Event Broadcast → Client Update → UI Refresh
```

## Background Job Flow

```
Scheduler → Job Trigger → External API Call → Data Processing → Database Update → Cache Refresh → WebSocket Notification
```

## Security Flow

```
Request → JWT Validation → Permission Check → Rate Limiting → Input Sanitization → SQL Injection Prevention → XSS Prevention → Processing → Response
```
