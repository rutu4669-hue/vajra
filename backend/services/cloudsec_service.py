import httpx
import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CloudSecService:
    def __init__(self):
        self.token = os.getenv("CLOUDSEC_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOjc5NywidHlwZSI6ImludGVncmF0aW9uc19wb2xsaW5nX2FwaSIsImlzcyI6ImF1dGhfc2VydmljZSIsInV1aWQiOiJmZmMxMzA0ZS1kOWU4LTQ5NmEtYjkyMS1hNWQ5ZmY5MDQxOTAiLCJpbnRlZ3JhdGlvbl9jb25maWd1cmF0aW9uX2lkIjoiNmE1NzJlMTUzYzExYTQ5NDg1M2ZkYjJjIiwiaWF0IjoxNzg0MDk4MzI1LCJleHAiOjE4MTU2NTU5MjV9.tORb_6pqzwDx3taItBzIchOZJmF2aJrFMOtd6YDZPBs")
        # Updated base URL based on the token structure
        self.base_url = "https://integrations.pollinations.ai"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    async def get_integrations(self) -> Dict[str, Any]:
        """Fetch integrations data from Cloud Sec API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/integrations",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching integrations: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error fetching integrations: {e}")
            return {"error": str(e)}
    
    async def get_security_events(self, limit: int = 50) -> Dict[str, Any]:
        """Fetch security events from Cloud Sec API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/security-events",
                    headers=self.headers,
                    params={"limit": limit},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching security events: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error fetching security events: {e}")
            return {"error": str(e)}
    
    async def get_threat_intelligence(self) -> Dict[str, Any]:
        """Fetch threat intelligence data from Cloud Sec API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/threat-intelligence",
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching threat intelligence: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error fetching threat intelligence: {e}")
            return {"error": str(e)}
    
    async def ask_ai(self, query: str) -> Dict[str, Any]:
        """Send query to Cloud Sec AI"""
        try:
            async with httpx.AsyncClient() as client:
                # Add strict boundaries to the prompt
                system_prompt = "You are Phoenix, an AI security assistant. You MUST ONLY answer questions related to cybersecurity, threat intelligence, and security analysis. If the question is outside these topics (like math, coding, recipes, general knowledge), reply exactly with: 'I am Phoenix, an AI dedicated strictly to cybersecurity. I cannot assist with topics outside of threat intelligence and security analysis.' Question: "
                
                import urllib.parse
                full_query = urllib.parse.quote(system_prompt + query)
                
                # Try Pollinations AI API with correct endpoint
                response = await client.get(
                    f"https://text.pollinations.ai/{full_query}",
                    timeout=30.0
                )
                response.raise_for_status()
                return {"response": response.text}
        except httpx.HTTPError as e:
            logger.error(f"HTTP error asking AI: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error asking AI: {e}")
            return {"error": str(e)}
    
    async def get_ransomware_incidents(self, limit: int = 50) -> Dict[str, Any]:
        """Fetch ransomware incidents from Cloud Sec API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/ransomware/incidents",
                    headers=self.headers,
                    params={"limit": limit},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching ransomware incidents: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error fetching ransomware incidents: {e}")
            return {"error": str(e)}
    
    async def get_threat_actors(self, limit: int = 50) -> Dict[str, Any]:
        """Fetch threat actors from Cloud Sec API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/threat-actors",
                    headers=self.headers,
                    params={"limit": limit},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching threat actors: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error fetching threat actors: {e}")
            return {"error": str(e)}

cloudsec_service = CloudSecService()
