import httpx
from typing import List, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class HackerNewsService:
    BASE_URL = "https://hacker-news.firebaseio.com/v0"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        await self.client.aclose()
    
    async def get_top_story_ids(self) -> List[int]:
        """Get IDs of top stories from Hacker News"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/topstories.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching top story IDs: {e}")
            return []
    
    async def get_new_story_ids(self) -> List[int]:
        """Get IDs of new stories from Hacker News"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/newstories.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching new story IDs: {e}")
            return []
    
    async def get_best_story_ids(self) -> List[int]:
        """Get IDs of best stories from Hacker News"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/beststories.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching best story IDs: {e}")
            return []
    
    async def get_story_details(self, story_id: int) -> Dict[str, Any]:
        """Get details of a specific story"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/item/{story_id}.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching story details for ID {story_id}: {e}")
            return {}
    
    async def get_top_stories(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Get top stories with details"""
        story_ids = await self.get_top_story_ids()
        if not story_ids:
            return []
        
        stories = []
        for story_id in story_ids[:limit]:
            story = await self.get_story_details(story_id)
            if story and story.get("type") == "story":
                stories.append(story)
        
        return stories
    
    async def get_new_stories(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Get new stories with details"""
        story_ids = await self.get_new_story_ids()
        if not story_ids:
            return []
        
        stories = []
        for story_id in story_ids[:limit]:
            story = await self.get_story_details(story_id)
            if story and story.get("type") == "story":
                stories.append(story)
        
        return stories
    
    async def get_best_stories(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Get best stories with details"""
        story_ids = await self.get_best_story_ids()
        if not story_ids:
            return []
        
        stories = []
        for story_id in story_ids[:limit]:
            story = await self.get_story_details(story_id)
            if story and story.get("type") == "story":
                stories.append(story)
        
        return stories

# Global instance
hackernews_service = HackerNewsService()
