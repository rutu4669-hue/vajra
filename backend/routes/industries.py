from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class IndustryTarget(BaseModel):
    name: str
    attack_percentage: float
    attack_count: int
    trend: str

@router.get("", response_model=list[IndustryTarget])
async def get_targeted_industries():
    return [
        {
            "name": "Healthcare",
            "attack_percentage": 28.5,
            "attack_count": 356,
            "trend": "↑ 12%"
        },
        {
            "name": "Finance",
            "attack_percentage": 22.3,
            "attack_count": 278,
            "trend": "↑ 8%"
        },
        {
            "name": "Government",
            "attack_percentage": 18.7,
            "attack_count": 234,
            "trend": "↑ 15%"
        },
        {
            "name": "Manufacturing",
            "attack_percentage": 14.2,
            "attack_count": 178,
            "trend": "↓ 3%"
        },
        {
            "name": "Technology",
            "attack_percentage": 10.8,
            "attack_count": 135,
            "trend": "↑ 5%"
        },
        {
            "name": "Retail",
            "attack_percentage": 5.5,
            "attack_count": 69,
            "trend": "↓ 2%"
        }
    ]
