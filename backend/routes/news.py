from fastapi import APIRouter, Query
from schemas.news import NewsItem
from datetime import datetime
from services.hackernews_service import hackernews_service

router = APIRouter()

# Cybersecurity-related keywords for filtering
CYBER_KEYWORDS = [
    'security', 'cyber', 'hack', 'breach', 'vulnerability', 'exploit',
    'malware', 'ransomware', 'phishing', 'attack', 'threat', 'cve',
    'encryption', 'firewall', 'intrusion', 'zero-day', 'zero day', 'patch',
    'incident', 'compromise', 'injection', 'xss', 'csrf', 'ddos',
    'botnet', 'trojan', 'spyware', 'adware', 'rootkit', 'backdoor',
    'credential', 'password', 'authentication', 'authorization',
    'penetration', 'audit', 'compliance', 'gdpr', 'privacy',
    'data leak', 'data breach', 'identity theft', 'social engineering',
    'network security', 'cloud security', 'api security', 'server security',
    'database security', 'linux security', 'windows security', 'microsoft security',
    'google security', 'amazon security', 'aws security', 'azure security',
    'software security', 'hardware security', 'system security', 'code security',
    'web security', 'application security', 'mobile security', 'iot security',
    'virus', 'worm', 'keylogger', 'ransomware', 'spyware', 'malware',
    'cyberattack', 'cybercrime', 'cyberwarfare', 'cyberterrorism',
    'threat intelligence', 'threat hunting', 'threat detection',
    'security breach', 'security incident', 'security vulnerability',
    'exploit kit', 'zero day exploit', 'remote code execution',
    'privilege escalation', 'lateral movement', 'persistence',
    'command and control', 'c2', 'apt', 'advanced persistent threat',
    'spear phishing', 'whaling', 'business email compromise',
    'man-in-the-middle', 'mitm', 'session hijacking',
    'sql injection', 'nosql injection', 'blind injection',
    'cross-site scripting', 'cross-site request forgery',
    'denial of service', 'distributed denial of service',
    'buffer overflow', 'heap overflow', 'stack overflow',
    'race condition', 'integer overflow', 'format string',
    'memory corruption', 'use-after-free', 'double free',
    'arbitrary code execution', 'remote execution', 'local execution',
    'information disclosure', 'data exfiltration', 'data theft',
    'supply chain attack', 'third-party risk', 'vendor risk',
    'insider threat', 'privileged access', 'access control',
    'identity and access management', 'iam', 'single sign-on',
    'multi-factor authentication', 'mfa', 'two-factor authentication',
    'biometric', 'smart card', 'token', 'certificate',
    'public key infrastructure', 'pki', 'digital signature',
    'secure socket layer', 'ssl', 'transport layer security', 'tls',
    'virtual private network', 'vpn', 'secure shell', 'ssh',
    'firewall', 'intrusion detection system', 'ids',
    'intrusion prevention system', 'ips', 'security information',
    'event management', 'siem', 'security operations center', 'soc',
    'incident response', 'forensics', 'malware analysis',
    'reverse engineering', 'penetration testing', 'red team',
    'blue team', 'purple team', 'threat modeling',
    'security architecture', 'secure design', 'secure coding',
    'devsecops', 'shift left', 'security as code',
    'container security', 'kubernetes security', 'docker security',
    'serverless security', 'function security', 'lambda security',
    'microservices security', 'api gateway security',
    'web application firewall', 'waf', 'network firewall',
    'next-generation firewall', 'ngfw', 'unified threat management',
    'utm', 'secure web gateway', 'swg', 'cloud access security broker',
    'casb', 'secure email gateway', 'seg', 'data loss prevention',
    'dlp', 'endpoint detection and response', 'edr',
    'endpoint protection platform', 'epp', 'antivirus', 'anti-malware',
    'host-based intrusion detection', 'hids', 'host-based intrusion prevention',
    'hips', 'network access control', 'nac', 'network segmentation',
    'zero trust', 'zero trust architecture', 'zero trust network',
    'software defined perimeter', 'sdp', 'secure access service edge',
    'sase', 'secure service edge', 'sse'
]

def is_cybersecurity_related(title: str, text: str = None) -> bool:
    """Check if story is related to cybersecurity"""
    if not title:
        return False
    
    title_lower = title.lower()
    text_lower = text.lower() if text else ""
    
    # Check if any cyber keyword appears in title or text
    for keyword in CYBER_KEYWORDS:
        if keyword in title_lower or keyword in text_lower:
            return True
    
    # Only include stories that match cybersecurity keywords
    return False

@router.get("", response_model=list[NewsItem])
async def get_news(
    story_type: str = Query("top", description="Type of stories: top, new, or best"),
    limit: int = Query(30, description="Number of stories to fetch")
):
    """Fetch cybersecurity-related news from Hacker News"""
    stories = []
    
    try:
        if story_type == "top":
            hn_stories = await hackernews_service.get_top_stories(limit * 5)  # Fetch more to filter
        elif story_type == "new":
            hn_stories = await hackernews_service.get_new_stories(limit * 5)
        elif story_type == "best":
            hn_stories = await hackernews_service.get_best_stories(limit * 5)
        else:
            hn_stories = await hackernews_service.get_top_stories(limit * 5)
        
        for story in hn_stories:
            title = story.get("title", "")
            text = story.get("text", "")
            
            # Filter for cybersecurity-related stories only
            if is_cybersecurity_related(title, text):
                # Calculate time ago
                story_time = story.get("time", 0)
                time_ago = ""
                if story_time:
                    hours_ago = (datetime.utcnow().timestamp() - story_time) / 3600
                    if hours_ago < 1:
                        time_ago = f"{int(hours_ago * 60)} minutes ago"
                    elif hours_ago < 24:
                        time_ago = f"{int(hours_ago)} hours ago"
                    else:
                        time_ago = f"{int(hours_ago / 24)} days ago"
                
                stories.append({
                    "id": story.get("id"),
                    "title": title,
                    "content": text,
                    "source": "Hacker News",
                    "url": story.get("url"),
                    "published_at": datetime.fromtimestamp(story.get("time", 0)) if story.get("time") else None,
                    "created_at": datetime.utcnow(),
                    "author": story.get("by"),
                    "score": story.get("score"),
                    "descendants": story.get("descendants"),
                    "time": story.get("time"),
                    "hn_type": story.get("type"),
                    "time_ago": time_ago
                })
            
            # Stop once we have enough stories
            if len(stories) >= limit:
                break
    except Exception as e:
        print(f"Error fetching news: {e}")
        # Return empty list on error
    
    return stories
