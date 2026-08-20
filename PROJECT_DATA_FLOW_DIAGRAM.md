# VAJRA Security Platform - Complete Data Flow Diagram

## User Journey from Login to Logout

```mermaid
graph TD
    Start([User Opens Application]) --> LoginScreen[Login Screen]
    LoginScreen --> UserInput{User Enters Credentials}
    UserInput -->|Valid Credentials| AuthAPI[POST /api/auth/login]
    UserInput -->|Invalid Credentials| LoginError[Show Error Message]
    LoginError --> LoginScreen
    
    AuthAPI --> JWTGeneration[Generate JWT Tokens]
    JWTGeneration --> TokenStorage[Store Tokens in LocalStorage]
    TokenStorage --> RedirectDashboard[Redirect to Dashboard]
    
    RedirectDashboard --> DashboardLoad[Dashboard Component Loads]
    DashboardLoad --> AuthCheck{Check Authentication}
    AuthCheck -->|Not Authenticated| LoginScreen
    AuthCheck -->|Authenticated| DashboardInit[Initialize Dashboard]
    
    DashboardInit --> ParallelLoad[Load Dashboard Data]
    ParallelLoad --> SummaryAPI[GET /api/dashboard/summary]
    ParallelLoad --> AlertsAPI[GET /api/dashboard/alerts]
    ParallelLoad --> AttackMapAPI[GET /api/dashboard/attack-map]
    
    SummaryAPI --> AlienVaultService[AlienVault Service]
    AlienVaultService --> AlienVaultAPI[AlienVault OTX API]
    AlienVaultAPI --> SummaryData[Threat Intelligence Data]
    SummaryData --> DisplaySummary[Display Summary Cards]
    
    AlertsAPI --> MockAlerts[Mock Alert Data]
    MockAlerts --> DisplayAlerts[Display Critical Alerts]
    
    AttackMapAPI --> MockMap[Mock Map Data]
    MockMap --> DisplayMap[Display Attack Map]
    
    DisplaySummary --> DashboardReady[Dashboard Ready]
    DisplayAlerts --> DashboardReady
    DisplayMap --> DashboardReady
    
    DashboardReady --> UserNavigation{User Navigation}
    
    UserNavigation -->|Threat Intelligence| ThreatModule[Threat Intelligence Module]
    UserNavigation -->|Ransomware| RansomwareModule[Ransomware Module]
    UserNavigation -->|News| NewsModule[News Module]
    UserNavigation -->|Companies| CompaniesModule[Companies Module]
    UserNavigation -->|Domain Analysis| DomainModule[Domain Analysis Module]
    UserNavigation -->|Reports| ReportsModule[Reports Module]
    UserNavigation -->|Logout| LogoutFlow[Logout Flow]
    
    %% Threat Intelligence Module Flow
    ThreatModule --> ThreatAPI[GET /api/threat-intelligence]
    ThreatModule --> ThreatTrendAPI[GET /api/threat-intelligence/trend]
    ThreatModule --> ThreatActorsAPI[GET /api/threat-intelligence/actors]
    ThreatModule --> ThreatIndustriesAPI[GET /api/threat-intelligence/industries]
    
    ThreatAPI --> AlienVaultThreat[AlienVault Threat Data]
    ThreatTrendAPI --> MockTrend[Mock Trend Data]
    ThreatActorsAPI --> ThreatActorsDB[Database Query]
    ThreatIndustriesAPI --> IndustriesDB[Database Query]
    
    AlienVaultThreat --> DisplayThreat[Display Threat Data]
    MockTrend --> DisplayTrend[Display Trend Charts]
    ThreatActorsDB --> DisplayActors[Display Threat Actors]
    IndustriesDB --> DisplayIndustries[Display Industry Data]
    
    DisplayThreat --> ThreatComplete[Threat Module Complete]
    DisplayTrend --> ThreatComplete
    DisplayActors --> ThreatComplete
    DisplayIndustries --> ThreatComplete
    
    ThreatComplete --> UserNavigation
    
    %% Ransomware Module Flow
    RansomwareModule --> RansomwareAPI[GET /api/ransomware]
    RansomwareModule --> RansomwareStatsAPI[GET /api/ransomware/stats]
    RansomwareModule --> RansomwareGroupAPI[GET /api/ransomware/group/{name}]
    
    RansomwareAPI --> RansomwareService[Ransomware Service]
    RansomwareStatsAPI --> RansomwareStatsService[Ransomware Stats Service]
    RansomwareGroupAPI --> RansomwareGroupService[Ransomware Group Service]
    
    RansomwareService --> RansomwareLiveAPI[Ransomware.live API]
    RansomwareStatsService --> RansomwareLiveStatsAPI[Ransomware.live Stats API]
    RansomwareGroupService --> RansomwareLiveGroupAPI[Ransomware.live Group API]
    
    RansomwareLiveAPI --> RansomwareData[Ransomware Incident Data]
    RansomwareLiveStatsAPI --> RansomwareStatsData[Ransomware Statistics]
    RansomwareLiveGroupAPI --> RansomwareGroupData[Ransomware Group Data]
    
    RansomwareData --> DisplayRansomware[Display Ransomware Incidents]
    RansomwareStatsData --> DisplayRansomwareStats[Display Ransomware Stats]
    RansomwareGroupData --> DisplayRansomwareGroup[Display Group Data]
    
    DisplayRansomware --> RansomwareComplete[Ransomware Module Complete]
    DisplayRansomwareStats --> RansomwareComplete
    DisplayRansomwareGroup --> RansomwareComplete
    
    RansomwareComplete --> UserNavigation
    
    %% News Module Flow
    NewsModule --> NewsAPI[GET /api/news]
    NewsAPI --> HackerNewsService[Hacker News Service]
    HackerNewsService --> HackerNewsAPI[Hacker News API]
    HackerNewsAPI --> NewsData[News Stories Data]
    NewsData --> FilterNews[Filter Cybersecurity Keywords]
    FilterNews --> DisplayNews[Display News Feed]
    DisplayNews --> NewsComplete[News Module Complete]
    NewsComplete --> UserNavigation
    
    %% Companies Module Flow
    CompaniesModule --> CompaniesListAPI[GET /api/companies]
    CompaniesModule --> CompanyDetailAPI[GET /api/companies/{id}]
    CompaniesModule --> AddCompanyAPI[POST /api/companies]
    
    CompaniesListAPI --> CompaniesDB[Database Query]
    CompanyDetailAPI --> CompanyDetailDB[Database Query with Risk Assessment]
    AddCompanyAPI --> CompanyCreate[Create Company in Database]
    
    CompaniesDB --> DisplayCompanies[Display Company List]
    CompanyDetailDB --> DisplayCompanyDetail[Display Company Details]
    CompanyCreate --> CompanyCreated[Company Created Successfully]
    
    DisplayCompanies --> CompaniesComplete[Companies Module Complete]
    DisplayCompanyDetail --> CompaniesComplete
    CompanyCreated --> CompaniesComplete
    
    CompaniesComplete --> UserNavigation
    
    %% Domain Analysis Module Flow
    DomainModule --> DomainRiskAPI[GET /api/domain-risk/{domain}]
    DomainModule --> DomainAnalysisAPI[GET /api/domain-analysis/{domain}]
    
    DomainRiskAPI --> DomainRiskService[Domain Risk Service]
    DomainAnalysisAPI --> DomainAnalysisService[Domain Analysis Service]
    
    DomainRiskService --> ExternalDomainAPI[External Domain APIs]
    DomainAnalysisService --> ExternalDomainAnalysisAPI[External Domain Analysis APIs]
    
    ExternalDomainAPI --> DomainRiskData[Domain Risk Data]
    ExternalDomainAnalysisAPI --> DomainAnalysisData[Domain Analysis Data]
    
    DomainRiskData --> DisplayDomainRisk[Display Domain Risk]
    DomainAnalysisData --> DisplayDomainAnalysis[Display Domain Analysis]
    
    DisplayDomainRisk --> DomainComplete[Domain Module Complete]
    DisplayDomainAnalysis --> DomainComplete
    
    DomainComplete --> UserNavigation
    
    %% Reports Module Flow
    ReportsModule --> ReportSelection{Select Report Type}
    
    ReportSelection -->|Threat Intelligence| ThreatReportAPI[GET /api/reports/threat-intelligence]
    ReportSelection -->|Ransomware| RansomwareReportAPI[GET /api/reports/ransomware]
    ReportSelection -->|Global Attacks| GlobalAttacksReportAPI[GET /api/reports/global-attacks]
    ReportSelection -->|Company| CompanyReportAPI[GET /api/reports/company/{id}]
    ReportSelection -->|Executive| ExecutiveReportAPI[GET /api/reports/executive]
    ReportSelection -->|Comprehensive| ComprehensiveReportAPI[GET /api/reports/comprehensive]
    
    ThreatReportAPI --> PDFServiceThreat[PDF Service - Threat Intelligence]
    RansomwareReportAPI --> PDFServiceRansomware[PDF Service - Ransomware]
    GlobalAttacksReportAPI --> PDFServiceGlobal[PDF Service - Global Attacks]
    CompanyReportAPI --> PDFServiceCompany[PDF Service - Company]
    ExecutiveReportAPI --> PDFServiceExecutive[PDF Service - Executive]
    ComprehensiveReportAPI --> PDFServiceComprehensive[PDF Service - Comprehensive]
    
    PDFServiceThreat --> PDFGenerationThreat[Generate PDF with Black/White Styling]
    PDFServiceRansomware --> PDFGenerationRansomware[Generate PDF with Black/White Styling]
    PDFServiceGlobal --> PDFGenerationGlobal[Generate PDF with Black/White Styling]
    PDFServiceCompany --> PDFGenerationCompany[Generate PDF with Black/White Styling]
    PDFServiceExecutive --> PDFGenerationExecutive[Generate PDF with Black/White Styling]
    PDFServiceComprehensive --> PDFGenerationComprehensive[Generate Combined PDF]
    
    PDFGenerationThreat --> DownloadThreat[Download Threat Intelligence PDF]
    PDFGenerationRansomware --> DownloadRansomware[Download Ransomware PDF]
    PDFGenerationGlobal --> DownloadGlobal[Download Global Attacks PDF]
    PDFGenerationCompany --> DownloadCompany[Download Company PDF]
    PDFGenerationExecutive --> DownloadExecutive[Download Executive PDF]
    PDFGenerationComprehensive --> DownloadComprehensive[Download Comprehensive PDF]
    
    DownloadThreat --> ReportsComplete[Reports Module Complete]
    DownloadRansomware --> ReportsComplete
    DownloadGlobal --> ReportsComplete
    DownloadCompany --> ReportsComplete
    DownloadExecutive --> ReportsComplete
    DownloadComprehensive --> ReportsComplete
    
    ReportsComplete --> UserNavigation
    
    %% Logout Flow
    LogoutFlow --> LogoutAPI[POST /api/auth/logout]
    LogoutAPI --> ClearTokens[Clear Tokens from LocalStorage]
    ClearTokens --> RedirectLogin[Redirect to Login Screen]
    RedirectLogin --> End([Session Ended])
    
    %% WebSocket Real-time Updates
    DashboardReady --> WebSocketConnect[Connect to WebSocket /ws]
    WebSocketConnect --> WebSocketEvents{WebSocket Events}
    
    WebSocketEvents -->|Threat Updates| ThreatUpdate[Update Threat Data]
    WebSocketEvents -->|Alert Notifications| AlertNotification[Show New Alert]
    WebSocketEvents -->|Dashboard Refresh| DashboardRefresh[Refresh Dashboard]
    
    ThreatUpdate --> UpdateThreatDisplay[Update Threat Display]
    AlertNotification --> UpdateAlertDisplay[Update Alert Display]
    DashboardRefresh --> RefreshDashboardData[Refresh All Dashboard Data]
    
    UpdateThreatDisplay --> DashboardReady
    UpdateAlertDisplay --> DashboardReady
    RefreshDashboardData --> DashboardReady
    
    %% Background Data Sync
    DashboardReady --> BackgroundSync[Background Data Sync]
    BackgroundSync --> Scheduler[Scheduler Service]
    Scheduler --> PeriodicUpdates[Periodic Data Updates]
    
    PeriodicUpdates --> UpdateAlienVault[Update AlienVault Data]
    PeriodicUpdates --> UpdateRansomware[Update Ransomware Data]
    PeriodicUpdates --> UpdateNews[Update Hacker News Data]
    
    UpdateAlienVault --> CacheAlienVault[Cache Updated Data]
    UpdateRansomware --> CacheRansomware[Cache Updated Data]
    UpdateNews --> CacheNews[Cache Updated Data]
    
    CacheAlienVault --> WebSocketEvents
    CacheRansomware --> WebSocketEvents
    CacheNews --> WebSocketEvents
    
    style Start fill:#4CAF50,color:#fff
    style End fill:#f44336,color:#fff
    style LoginScreen fill:#2196F3,color:#fff
    style DashboardReady fill:#FF9800,color:#fff
    style UserNavigation fill:#9C27B0,color:#fff
    style ThreatComplete fill:#4CAF50,color:#fff
    style RansomwareComplete fill:#4CAF50,color:#fff
    style NewsComplete fill:#4CAF50,color:#fff
    style CompaniesComplete fill:#4CAF50,color:#fff
    style DomainComplete fill:#4CAF50,color:#fff
    style ReportsComplete fill:#4CAF50,color:#fff
```

## Detailed Component Data Flow

### Authentication Flow
```
User → Login Form → Frontend Validation → API Call → Backend Validation 
→ Database Query → JWT Generation → Token Storage → Dashboard Redirect
```

### Dashboard Data Flow
```
Dashboard Component → Multiple API Calls → External Services (AlienVault) 
→ Data Processing → State Management → Component Rendering → Real-time Updates
```

### Threat Intelligence Flow
```
Threat Module → API Requests → AlienVault Service → External API 
→ Data Transformation → State Update → Visualization Display
```

### Ransomware Tracking Flow
```
Ransomware Module → API Requests → Ransomware Service → Ransomware.live API 
→ Data Processing → Statistics Calculation → Incident Display
```

### News Feed Flow
```
News Module → API Request → Hacker News Service → Hacker News API 
→ Keyword Filtering → Relevance Scoring → News Display
```

### Company Risk Assessment Flow
```
Companies Module → Database Query → Risk Assessment Calculation 
→ Threat Analysis → Report Generation → Dashboard Display
```

### Report Generation Flow
```
Report Selection → API Request → PDF Service → Data Aggregation 
→ PDF Generation (Black/White Styling) → File Download
```

### Real-time Updates Flow
```
WebSocket Connection → Event Listening → Data Updates → State Management 
→ UI Re-render → User Notification
```

### Background Sync Flow
```
Scheduler → Periodic Triggers → External API Calls → Data Caching 
→ WebSocket Events → Client Updates
```

## Database Operations Flow

```
User Operations:
├── Register: Create User Record
├── Login: Query User & Validate Password
├── Update: Modify User Profile
└── Delete: Remove User Record

Company Operations:
├── Create: Add Company to Monitoring
├── Read: Fetch Company Details & Risk Assessment
├── Update: Modify Company Information
└── Delete: Remove Company from Monitoring

Threat Operations:
├── Create: Log New Threat
├── Read: Query Threat Data
├── Update: Update Threat Status
└── Delete: Archive Old Threats

Alert Operations:
├── Create: Generate Security Alerts
├── Read: Fetch User Alerts
├── Update: Mark as Read/Resolved
└── Delete: Remove Old Alerts
```

## External API Integration Flow

```
AlienVault OTX:
Frontend → Backend → AlienVault Service → OTX API → Threat Data → Processing → Display

Ransomware.live:
Frontend → Backend → Ransomware Service → Ransomware.live API → Incident Data → Processing → Display

Hacker News:
Frontend → Backend → Hacker News Service → HN API → News Data → Filtering → Display
```

## State Management Flow

```
User Actions → Component State → Global State (Zustand) → API Calls 
→ Response Processing → State Update → Component Re-render → UI Update
```

## Error Handling Flow

```
API Error → Error Boundary → Error Logging → User Notification 
→ Fallback Data → Graceful Degradation → Retry Mechanism
```

## Security Flow

```
Request → JWT Validation → Permission Check → Rate Limiting 
→ Input Validation → Processing → Response → Security Headers
```
