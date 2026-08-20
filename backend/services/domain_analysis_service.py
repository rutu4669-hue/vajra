import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
import re
import json
from dotenv import load_dotenv
from services.nvd_service import nvd_service

load_dotenv()

class DomainAnalysisService:
    def __init__(self):
        self.abuseipdb_api_key = os.getenv("ABUSEIPDB_API_KEY")
        self.virustotal_api_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.alienvault_api_key = os.getenv("ALIENVAULT_OTX_API_KEY")
        self.urlscan_api_key = os.getenv("URLSCAN_API_KEY")
        self.whoisxml_api_key = os.getenv("WHOISXML_API_KEY")
        self.gridinsoft_api_key = os.getenv("GRIDINSOFT_API_KEY")
        self.domscan_api_key = os.getenv("DOMSCAN_API_KEY")
        
        self.threat_history_cache: Dict[str, List[Dict[str, Any]]] = {}
    
    def is_valid_domain(self, domain: str) -> bool:
        """Validate domain format"""
        domain_pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        return bool(re.match(domain_pattern, domain)) if domain else False
    
    def is_valid_ip(self, ip: str) -> bool:
        """Validate IP address format"""
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        if not re.match(ip_pattern, ip):
            return False
        octets = ip.split('.')
        return all(0 <= int(octet) <= 255 for octet in octets)

    async def fetch_google_dns(self, domain: str) -> Dict[str, Any]:
        """Fetch live DNS records from Google Public DNS API"""
        record_types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA']
        results = {'a_records': 0, 'mx_records': 0, 'txt_records': 0, 'ips': [], 'raw': {}}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for rtype in record_types:
                    res = await client.get(f"https://dns.google/resolve?name={domain}&type={rtype}")
                    if res.status_code == 200:
                        data = res.json()
                        answers = data.get("Answer", [])
                        results['raw'][rtype] = answers
                        if rtype == 'A':
                            results['a_records'] = len(answers)
                            results['ips'] = [ans.get('data') for ans in answers if ans.get('data')]
                        elif rtype == 'MX':
                            results['mx_records'] = len(answers)
                        elif rtype == 'TXT':
                            results['txt_records'] = len(answers)
        except Exception as e:
            print(f"Error fetching Google DNS for {domain}: {e}")
        
        return results

    async def fetch_rdap_whois(self, domain: str) -> Dict[str, Any]:
        """Fetch WHOIS & Domain Age via ICANN RDAP REST API"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"https://rdap.org/domain/{domain}")
                if res.status_code == 200:
                    data = res.json()
                    created_date = None
                    expires_date = None
                    
                    for event in data.get("events", []):
                        if event.get("eventAction") == "registration":
                            created_date = event.get("eventDate")
                        elif event.get("eventAction") == "expiration":
                            expires_date = event.get("eventDate")
                    
                    domain_age_days = 0
                    if created_date:
                        try:
                            # Handle ISO format dates
                            c_date = datetime.fromisoformat(created_date.replace("Z", "+00:00"))
                            domain_age_days = (datetime.now(c_date.tzinfo) - c_date).days
                        except Exception:
                            pass
                    
                    expires_days = 0
                    if expires_date:
                        try:
                            e_date = datetime.fromisoformat(expires_date.replace("Z", "+00:00"))
                            expires_days = (e_date - datetime.now(e_date.tzinfo)).days
                        except Exception:
                            pass

                    registrar = "Unknown Registrar"
                    for entity in data.get("entities", []):
                        if "registrar" in entity.get("roles", []):
                            vcard = entity.get("vcardArray", [])
                            if len(vcard) > 1:
                                for item in vcard[1]:
                                    if item[0] == "fn":
                                        registrar = item[3]
                    
                    return {
                        "domain_age_days": domain_age_days,
                        "expires_days": expires_days,
                        "registrar": registrar,
                        "created_date": created_date,
                        "expires_date": expires_date,
                        "status": data.get("status", [])
                    }
        except Exception as e:
            print(f"Error fetching RDAP WHOIS for {domain}: {e}")
        return {}

    async def fetch_crt_sh_ssl(self, domain: str) -> Dict[str, Any]:
        """Fetch Certificate Transparency logs via crt.sh API"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"https://crt.sh/?q={domain}&output=json")
                if res.status_code == 200:
                    certs = res.json()
                    if certs and len(certs) > 0:
                        latest = certs[0]
                        issuer = latest.get("issuer_name", "Unknown CA")
                        not_after = latest.get("not_after")
                        
                        expires_days = 90
                        if not_after:
                            try:
                                exp_dt = datetime.strptime(not_after.split("T")[0], "%Y-%m-%d")
                                expires_days = max(0, (exp_dt - datetime.now()).days)
                            except Exception:
                                pass

                        return {
                            "valid": True,
                            "issuer": issuer,
                            "expires_days": expires_days,
                            "subject": latest.get("common_name", domain)
                        }
        except Exception as e:
            print(f"Error fetching crt.sh SSL for {domain}: {e}")
        return {}

    async def fetch_ip_geolocation(self, ip: str) -> Dict[str, Any]:
        """Fetch IP Geolocation & ISP via ipapi.co / ip-api.com API"""
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"https://ipapi.co/{ip}/json/")
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "ip": ip,
                        "country": data.get("country_name", "United States"),
                        "country_code": data.get("country_code", "US"),
                        "isp": data.get("org") or data.get("isp") or "CDN / Cloud Provider",
                        "city": data.get("city", "Unknown"),
                        "asn": data.get("asn", "Unknown")
                    }
        except Exception:
            pass

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"http://ip-api.com/json/{ip}")
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "ip": ip,
                        "country": data.get("country", "United States"),
                        "country_code": data.get("countryCode", "US"),
                        "isp": data.get("org") or data.get("isp") or "Global Network",
                        "city": data.get("city", "Unknown"),
                        "asn": data.get("as", "Unknown")
                    }
        except Exception as e:
            print(f"Error fetching IP Geolocation: {e}")

        return {}

    async def analyze_abuseipdb(self, target: str) -> Dict[str, Any]:
        """Analyze using AbuseIPDB API"""
        if not self.abuseipdb_api_key or self.abuseipdb_api_key == "your_abuseipdb_api_key":
            return {}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"Key": self.abuseipdb_api_key}
                params = {"ipAddress": target, "maxAgeInDays": 90}
                response = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "abuse_confidence_score": data.get("data", {}).get("abuseConfidenceScore", 0),
                    "total_reports": data.get("data", {}).get("totalReports", 0),
                    "last_reported_at": data.get("data", {}).get("lastReportedAt", "Never"),
                    "country": data.get("data", {}).get("countryCode", "Unknown")
                }
        except Exception as e:
            print(f"Error fetching AbuseIPDB data: {e}")
            return {}
    
    async def analyze_virustotal(self, target: str) -> Dict[str, Any]:
        """Analyze using VirusTotal API"""
        if not self.virustotal_api_key or self.virustotal_api_key == "your_virustotal_api_key":
            return {}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"x-apikey": self.virustotal_api_key}
                response = await client.get(
                    f"https://www.virustotal.com/api/v3/ip_addresses/{target}",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                attributes = data.get("data", {}).get("attributes", {})
                return {
                    "reputation": attributes.get("reputation", 0),
                    "last_analysis_stats": attributes.get("last_analysis_stats", {}),
                    "country": attributes.get("country", "Unknown")
                }
        except Exception as e:
            print(f"Error fetching VirusTotal data: {e}")
            return {}
    
    async def analyze_alienvault(self, target: str) -> Dict[str, Any]:
        """Analyze using AlienVault OTX API"""
        if not self.alienvault_api_key or self.alienvault_api_key == "your_otx_api_key":
            return {}
        
        try:
            indicator_type = "IPv4" if self.is_valid_ip(target) else "domain"
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"X-OTX-API-KEY": self.alienvault_api_key}
                response = await client.get(
                    f"https://otx.alienvault.com/api/v1/indicators/{indicator_type}/{target}",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "pulse_count": len(data.get("pulse_info", {}).get("pulses", [])),
                    "sections": data.get("sections", []),
                    "reputation": data.get("reputation", 0)
                }
        except Exception as e:
            print(f"Error fetching AlienVault data: {e}")
            return {}
    
    async def analyze_urlscan(self, target: str) -> Dict[str, Any]:
        """Analyze using URLScan.io API"""
        if not self.urlscan_api_key or self.urlscan_api_key == "your_urlscan_api_key":
            return {}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"API-Key": self.urlscan_api_key}
                search_endpoint = "https://urlscan.io/api/v1/search/"
                
                query = f'ip:"{target}"' if self.is_valid_ip(target) else f'domain:"{target}"'
                params = {"q": query, "size": 100}
                
                response = await client.get(search_endpoint, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = data.get("results", [])
                total_scans = len(results)
                
                if total_scans == 0:
                    return {}
                
                malicious_count = 0
                suspicious_count = 0
                countries = []
                tags = []
                
                for result in results[:10]:
                    page = result.get("page", {})
                    if page.get("malicious", False):
                        malicious_count += 1
                    elif page.get("suspicious", False):
                        suspicious_count += 1
                    
                    if "country" in page:
                        countries.append(page["country"])
                    if "tags" in result:
                        tags.extend(result["tags"])
                    if "tags" in page:
                        tags.extend(page["tags"])
                
                return {
                    "total_scans": total_scans,
                    "malicious_scans": malicious_count,
                    "suspicious_scans": suspicious_count,
                    "harmless_scans": total_scans - malicious_count - suspicious_count,
                    "countries": list(set(countries)),
                    "tags": list(set(tags)),
                    "results": results[:5]
                }
        except Exception as e:
            print(f"Error fetching URLScan data: {e}")
            return {}

    async def analyze_domain(self, target: str) -> Dict[str, Any]:
        """Main Domain Analysis Pipeline integrating Google DNS, RDAP WHOIS, crt.sh SSL, IP Geolocation, NVD, URLScan, AlienVault, AbuseIPDB, VirusTotal"""
        clean_target = target.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0].strip()
        
        is_domain = self.is_valid_domain(clean_target)
        is_ip = self.is_valid_ip(clean_target)
        
        if not is_domain and not is_ip:
            return {
                "target": clean_target,
                "risk_level": "UNKNOWN",
                "active_incidents": 0,
                "security_score": 0,
                "last_scanned": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "threats": []
            }
        
        # Parallel Execution of all Domain Intelligence APIs
        dns_data = await self.fetch_google_dns(clean_target)
        whois_rdap = await self.fetch_rdap_whois(clean_target)
        ssl_crt = await self.fetch_crt_sh_ssl(clean_target)
        
        primary_ip = dns_data.get("ips", [None])[0] if dns_data.get("ips") else (clean_target if is_ip else None)
        geo_info = {}
        if primary_ip:
            geo_info = await self.fetch_ip_geolocation(primary_ip)

        # Threat Intelligence APIs
        urlscan_data = await self.analyze_urlscan(clean_target)
        abuseipdb_data = await self.analyze_abuseipdb(primary_ip or clean_target)
        virustotal_data = await self.analyze_virustotal(primary_ip or clean_target)
        alienvault_data = await self.analyze_alienvault(clean_target)
        nvd_data = await nvd_service.get_domain_vulnerabilities(clean_target)

        # Base Analysis Object
        result = {
            "target": clean_target,
            "risk_level": "LOW",
            "active_incidents": 0,
            "security_score": 100,
            "last_scanned": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "threats": [],
            "country": geo_info.get("country") or whois_rdap.get("country") or "United States",
            "isp": geo_info.get("isp") or "Resolved via DNS",
            "abuse_confidence_score": abuseipdb_data.get("abuse_confidence_score", 0),
            "total_reports": abuseipdb_data.get("total_reports", 0),
            "domain_age_days": whois_rdap.get("domain_age_days", 365),
            "ssl_certificate": {
                "valid": ssl_crt.get("valid", True),
                "issuer": ssl_crt.get("issuer", "Standard CA"),
                "expires_days": ssl_crt.get("expires_days", 90)
            },
            "dns_records": {
                "a_records": dns_data.get("a_records", 1),
                "mx_records": dns_data.get("mx_records", 1),
                "txt_records": dns_data.get("txt_records", 1)
            },
            "reputation_score": 100,
            "last_reported": abuseipdb_data.get("last_reported_at", "Never"),
            "connections": {
                "ip_addresses": dns_data.get("ips", []),
                "asn_info": {"asn": geo_info.get("asn", "Unknown")} if geo_info.get("asn") else {}
            }
        }

        # Inject NVD Vulnerabilities
        if nvd_data:
            result["vulnerabilities"] = nvd_data.get("vulnerabilities", [])
            result["total_vulnerabilities"] = nvd_data.get("total_vulnerabilities", 0)
            result["vulnerability_risk_score"] = nvd_data.get("risk_score", 0)
            result["high_critical_vulnerabilities"] = nvd_data.get("high_critical_count", 0)

        # Inject URLScan Feeds
        if urlscan_data:
            result["urlscan_data"] = urlscan_data
            if urlscan_data.get("malicious_scans", 0) > 0:
                result["risk_level"] = "HIGH"
                result["security_score"] = min(result["security_score"], 45)
                result["threats"].append({
                    "type": "Malicious Web Detection",
                    "severity": "HIGH",
                    "first_seen": datetime.now().strftime("%Y-%m-%d"),
                    "last_seen": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "confidence": 95,
                    "source": "URLScan.io"
                })

        # Inject AbuseIPDB Feeds
        if abuseipdb_data and abuseipdb_data.get("abuse_confidence_score", 0) > 20:
            score = abuseipdb_data.get("abuse_confidence_score")
            if score > 50:
                result["risk_level"] = "HIGH"
                result["security_score"] = min(result["security_score"], 50)
            result["threats"].append({
                "type": "Abuse Activity Reported",
                "severity": "HIGH" if score > 50 else "MEDIUM",
                "first_seen": datetime.now().strftime("%Y-%m-%d"),
                "last_seen": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "confidence": score,
                "source": "AbuseIPDB"
            })

        # Inject AlienVault OTX Feeds
        if alienvault_data:
            result["alienvault_data"] = alienvault_data
            pulse_count = alienvault_data.get("pulse_count", 0)
            if pulse_count > 0:
                result["threats"].append({
                    "type": f"OTX Threat Pulses ({pulse_count})",
                    "severity": "MEDIUM",
                    "first_seen": datetime.now().strftime("%Y-%m-%d"),
                    "last_seen": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "confidence": 85,
                    "source": "AlienVault OTX"
                })

        return result

domain_analysis_service = DomainAnalysisService()
domain_service = domain_analysis_service
