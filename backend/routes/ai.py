from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_service import gemini_service
from services.cloudsec_service import cloudsec_service

router = APIRouter()

class AIRequest(BaseModel):
    prompt: str
    context: str = ""

class CloudSecRequest(BaseModel):
    query: str

@router.post("/generate")
async def generate_ai_response(request: AIRequest):
    """Generate AI response using Gemini"""
    try:
        response = await gemini_service.generate_response(request.prompt, request.context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cloudsec-chat")
async def cloudsec_chat(request: CloudSecRequest):
    """Send query to Cloud Sec AI"""
    try:
        response = await cloudsec_service.ask_ai(request.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
