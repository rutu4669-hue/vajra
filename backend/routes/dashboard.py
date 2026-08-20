from fastapi import APIRouter
from datetime import datetime
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.alert import Alert
from schemas.dashboard import DashboardSummary, Alert, AttackMapData
from services.alienvault_service import alienvault_service

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    # Get threat intelligence from AlienVault
    threat_intel = await alienvault_service.get_threat_intelligence()
    
    # Get alerts from AlienVault
    alerts = await alienvault_service.get_alerts()
    
    # Use AlienVault & Ransomware.live data for global attacks
    total_attacks = threat_intel.get("iocCount", 12847)
    active_threat_actors = threat_intel.get("threatActors", 395)
    critical_attacks = len([a for a in alerts if a.get("severity") == "CRITICAL"])
    
    return DashboardSummary(
        total_attacks=total_attacks,
        active_threat_actors=active_threat_actors,
        critical_attacks=critical_attacks,
        last_updated=datetime.utcnow()
    )

@router.get("/alerts", response_model=list[Alert])
async def get_alerts():
    return [
        {
            "id": 1,
            "title": "Ransomware Attack Detected",
            "severity": "critical",
            "description": "Healthcare Organization",
            "time": "2 min ago",
            "source": "Threat Intelligence"
        },
        {
            "id": 2,
            "title": "CVE-2026-1234 Exploited in the Wild",
            "severity": "critical",
            "description": "High exploitation activity detected",
            "time": "15 min ago",
            "source": "Vulnerability Scanner"
        },
        {
            "id": 3,
            "title": "Credential Leak Detected",
            "severity": "critical",
            "description": "17 accounts found on dark web",
            "time": "32 min ago",
            "source": "Dark Web Monitor"
        },
        {
            "id": 4,
            "title": "Malicious IP Detected",
            "severity": "critical",
            "description": "185.234.217.16 - C2 Communication",
            "time": "45 min ago",
            "source": "Network Monitor"
        }
    ]

@router.get("/attack-map", response_model=list[AttackMapData])
async def get_attack_map():
    return [
        {
            "source": "Russia",
            "target": "India",
            "latitude_from": 55.0,
            "longitude_from": 37.0,
            "latitude_to": 20.0,
            "longitude_to": 78.0,
            "count": 34
        },
        {
            "source": "China",
            "target": "USA",
            "latitude_from": 35.0,
            "longitude_from": 105.0,
            "latitude_to": 38.0,
            "longitude_to": -97.0,
            "count": 28
        },
        {
            "source": "North Korea",
            "target": "South Korea",
            "latitude_from": 40.0,
            "longitude_from": 127.0,
            "latitude_to": 36.0,
            "longitude_to": 128.0,
            "count": 22
        },
        {
            "source": "Iran",
            "target": "Israel",
            "latitude_from": 32.0,
            "longitude_from": 53.0,
            "latitude_to": 31.0,
            "longitude_to": 35.0,
            "count": 19
        },
        {
            "source": "Brazil",
            "target": "USA",
            "latitude_from": -14.0,
            "longitude_from": -51.0,
            "latitude_to": 38.0,
            "longitude_to": -97.0,
            "count": 15
        }
    ]
