from fastapi import APIRouter
from pydantic import BaseModel
from services.alienvault_service import alienvault_service

router = APIRouter()

class ThreatActor(BaseModel):
    name: str
    activity_level: str
    attacks_count: int
    last_seen: str
    targets: list[str]

@router.get("", response_model=list[ThreatActor])
async def get_threat_actors():
    # Use AlienVault API for real threat actors
    actors = await alienvault_service.get_threat_actors()
    
    if actors:
        return actors
    
    # Fallback to mock data if API fails
    return [
        {
            "name": "APT29 (Cozy Bear)",
            "activity_level": "HIGH",
            "attacks_count": 47,
            "last_seen": "2 hours ago",
            "targets": ["Government", "Healthcare", "Finance"]
        },
        {
            "name": "APT28 (Fancy Bear)",
            "activity_level": "HIGH",
            "attacks_count": 52,
            "last_seen": "1 hour ago",
            "targets": ["Government", "Military", "Diplomatic"]
        },
        {
            "name": "Lazarus Group",
            "activity_level": "CRITICAL",
            "attacks_count": 89,
            "last_seen": "30 min ago",
            "targets": ["Finance", "Cryptocurrency", "Manufacturing"]
        },
        {
            "name": "LockBit",
            "activity_level": "CRITICAL",
            "attacks_count": 156,
            "last_seen": "15 min ago",
            "targets": ["Healthcare", "Finance", "Manufacturing", "Government"]
        },
        {
            "name": "BlackCat/ALPHV",
            "activity_level": "HIGH",
            "attacks_count": 73,
            "last_seen": "45 min ago",
            "targets": ["Finance", "Retail", "Technology"]
        }
    ]
