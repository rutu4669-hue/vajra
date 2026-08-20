import httpx
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

async def scan_file(file_hash: str):
    """Scan a file hash using VirusTotal"""
    if not VIRUSTOTAL_API_KEY:
        logger.warning("VirusTotal API key not configured")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"x-apikey": VIRUSTOTAL_API_KEY}
            response = await client.get(
                f"{VIRUSTOTAL_BASE_URL}/files/{file_hash}",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error scanning file with VirusTotal: {e}")
        return None

async def scan_ip(ip_address: str):
    """Scan an IP address using VirusTotal"""
    if not VIRUSTOTAL_API_KEY:
        logger.warning("VirusTotal API key not configured")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"x-apikey": VIRUSTOTAL_API_KEY}
            response = await client.get(
                f"{VIRUSTOTAL_BASE_URL}/ip_addresses/{ip_address}",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error scanning IP with VirusTotal: {e}")
        return None
