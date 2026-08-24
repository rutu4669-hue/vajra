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

    def get_virustotal_keys(self) -> List[str]:
        """Get list of active VirusTotal API keys for failover and rotation"""
        keys_str = os.getenv("VIRUSTOTAL_API_KEYS", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
        default_key = "cb8128bd4aee51f23697aa6535be0242e24723847323a0d91a835cada2d697f7"
        
        raw_keys = [k.strip() for k in keys_str.split(",") if k.strip() and k.strip() != "your_virustotal_api_key"]
        if not raw_keys:
            raw_keys = [default_key]
        elif default_key not in raw_keys:
            raw_keys.append(default_key)
            
        return raw_keys
    
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
    
    async def analyze_virustotal(self, target: str, ip_target: Optional[str] = None) -> Dict[str, Any]:
        """Analyze using VirusTotal v3 API with multi-key rotation, domain and IP intelligence"""
        keys = self.get_virustotal_keys()
        if not keys:
            return {}
        
        is_domain = self.is_valid_domain(target)
        is_ip = self.is_valid_ip(target)

        vt_domain_data: Optional[Dict[str, Any]] = None
        vt_ip_data: Optional[Dict[str, Any]] = None

        # 1. Fetch domain or IP report from VirusTotal
        for key in keys:
            try:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    headers = {"x-apikey": key}
                    if is_domain:
                        response = await client.get(
                            f"https://www.virustotal.com/api/v3/domains/{target}",
                            headers=headers
                        )
                        if response.status_code == 200:
                            vt_domain_data = response.json().get("data", {})
                            break
                        elif response.status_code in (429, 401, 403):
                            continue
                    elif is_ip:
                        response = await client.get(
                            f"https://www.virustotal.com/api/v3/ip_addresses/{target}",
                            headers=headers
                        )
                        if response.status_code == 200:
                            vt_ip_data = response.json().get("data", {})
                            break
                        elif response.status_code in (429, 401, 403):
                            continue
            except Exception as e:
                print(f"Error connecting to VirusTotal API: {e}")
                continue

        # 2. If target is a domain and an IP address was discovered, also fetch IP telemetry
        effective_ip = ip_target if (ip_target and self.is_valid_ip(ip_target)) else (target if is_ip else None)
        if is_domain and effective_ip and not vt_ip_data:
            for key in keys:
                try:
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        headers = {"x-apikey": key}
                        response = await client.get(
                            f"https://www.virustotal.com/api/v3/ip_addresses/{effective_ip}",
                            headers=headers
                        )
                        if response.status_code == 200:
                            vt_ip_data = response.json().get("data", {})
                            break
                except Exception:
                    pass

        if not vt_domain_data and not vt_ip_data:
            return {}

        domain_attr = vt_domain_data.get("attributes", {}) if vt_domain_data else {}
        ip_attr = vt_ip_data.get("attributes", {}) if vt_ip_data else {}

        # Last analysis stats
        stats = domain_attr.get("last_analysis_stats") or ip_attr.get("last_analysis_stats") or {
            "malicious": 0, "suspicious": 0, "harmless": 0, "undetected": 0, "timeout": 0
        }

        # Antivirus engine detections
        analysis_results = domain_attr.get("last_analysis_results") or ip_attr.get("last_analysis_results") or {}
        flagged_engines = []
        for engine_name, res in analysis_results.items():
            cat = res.get("category", "")
            if cat in ["malicious", "suspicious"]:
                flagged_engines.append({
                    "engine_name": engine_name,
                    "category": cat,
                    "result": res.get("result", cat),
                    "method": res.get("method", "blacklist")
                })

        # Resolved IPs from VirusTotal DNS records
        resolved_ips: List[str] = []
        for record in domain_attr.get("last_dns_records", []):
            if record.get("type") == "A" and record.get("value") and self.is_valid_ip(record.get("value")):
                resolved_ips.append(record.get("value"))
        if effective_ip and effective_ip not in resolved_ips:
            resolved_ips.append(effective_ip)

        # Categories & Tags
        cat_dict = domain_attr.get("categories", {})
        categories = list(set(cat_dict.values())) if isinstance(cat_dict, dict) else []
        tags = list(set(domain_attr.get("tags", []) + ip_attr.get("tags", [])))

        total_scanners = sum(stats.values()) if stats else 0
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)
        harmless_count = stats.get("harmless", 0)
        undetected_count = stats.get("undetected", 0)

        detection_ratio = f"{malicious_count + suspicious_count}/{total_scanners}" if total_scanners > 0 else "0/0"
        reputation = domain_attr.get("reputation", ip_attr.get("reputation", 0))

        return {
            "reputation": reputation,
            "last_analysis_stats": {
                "malicious": malicious_count,
                "suspicious": suspicious_count,
                "harmless": harmless_count,
                "undetected": undetected_count,
                "timeout": stats.get("timeout", 0)
            },
            "detection_ratio": detection_ratio,
            "total_engines": total_scanners,
            "flagged_engines": flagged_engines,
            "categories": categories,
            "tags": tags,
            "resolved_ips": list(set(resolved_ips)),
            "country": ip_attr.get("country") or domain_attr.get("country", "Unknown"),
            "as_owner": ip_attr.get("as_owner") or domain_attr.get("as_owner", "Unknown"),
            "network": ip_attr.get("network", "Unknown"),
            "popularity_ranks": domain_attr.get("popularity_ranks", {}),
            "total_votes": domain_attr.get("total_votes") or ip_attr.get("total_votes", {"harmless": 0, "malicious": 0})
        }
    
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
        
        # Parallel Execution of DNS, WHOIS, and SSL Certificates
        dns_data = await self.fetch_google_dns(clean_target)
        whois_rdap = await self.fetch_rdap_whois(clean_target)
        ssl_crt = await self.fetch_crt_sh_ssl(clean_target)
        
        primary_ip = dns_data.get("ips", [None])[0] if dns_data.get("ips") else (clean_target if is_ip else None)
        geo_info = {}
        if primary_ip:
            geo_info = await self.fetch_ip_geolocation(primary_ip)

        # Threat Intelligence APIs (URLScan, AbuseIPDB, VirusTotal, AlienVault, NVD)
        urlscan_data = await self.analyze_urlscan(clean_target)
        abuseipdb_data = await self.analyze_abuseipdb(primary_ip or clean_target)
        virustotal_data = await self.analyze_virustotal(clean_target, ip_target=primary_ip)
        alienvault_data = await self.analyze_alienvault(clean_target)
        nvd_data = await nvd_service.get_domain_vulnerabilities(clean_target)

        # Combine all discovered IP addresses from Google DNS & VirusTotal
        all_resolved_ips = list(dns_data.get("ips", []))
        if virustotal_data and virustotal_data.get("resolved_ips"):
            for ip in virustotal_data["resolved_ips"]:
                if ip not in all_resolved_ips:
                    all_resolved_ips.append(ip)
        if primary_ip and primary_ip not in all_resolved_ips:
            all_resolved_ips.append(primary_ip)

        # Base Analysis Object
        result = {
            "target": clean_target,
            "risk_level": "LOW",
            "active_incidents": 0,
            "security_score": 100,
            "last_scanned": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "threats": [],
            "country": geo_info.get("country") or virustotal_data.get("country") or whois_rdap.get("country") or "United States",
            "isp": geo_info.get("isp") or virustotal_data.get("as_owner") or "Resolved via DNS",
            "abuse_confidence_score": abuseipdb_data.get("abuse_confidence_score", 0),
            "total_reports": abuseipdb_data.get("total_reports", 0),
            "domain_age_days": whois_rdap.get("domain_age_days", 365),
            "ssl_certificate": {
                "valid": ssl_crt.get("valid", True),
                "issuer": ssl_crt.get("issuer", "Standard CA"),
                "expires_days": ssl_crt.get("expires_days", 90)
            },
            "dns_records": {
                "a_records": max(len(all_resolved_ips), dns_data.get("a_records", 1)),
                "mx_records": dns_data.get("mx_records", 1),
                "txt_records": dns_data.get("txt_records", 1)
            },
            "reputation_score": virustotal_data.get("reputation", 100) if virustotal_data else 100,
            "last_reported": abuseipdb_data.get("last_reported_at", "Never"),
            "connections": {
                "ip_addresses": all_resolved_ips,
                "asn_info": {
                    "asn": geo_info.get("asn") or virustotal_data.get("as_owner", "Unknown"),
                    "network": virustotal_data.get("network", "Unknown")
                }
            }
        }

        # Inject NVD Vulnerabilities
        if nvd_data:
            result["vulnerabilities"] = nvd_data.get("vulnerabilities", [])
            result["total_vulnerabilities"] = nvd_data.get("total_vulnerabilities", 0)
            result["vulnerability_risk_score"] = nvd_data.get("risk_score", 0)
            result["high_critical_vulnerabilities"] = nvd_data.get("high_critical_count", 0)

        # Inject VirusTotal Intelligence
        if virustotal_data:
            result["virustotal_data"] = virustotal_data
            vt_stats = virustotal_data.get("last_analysis_stats", {})
            vt_malicious = vt_stats.get("malicious", 0)
            vt_suspicious = vt_stats.get("suspicious", 0)

            if vt_malicious > 0:
                result["risk_level"] = "CRITICAL" if vt_malicious >= 3 else "HIGH"
                result["security_score"] = max(15, min(result["security_score"], 40 - vt_malicious * 5))
                result["active_incidents"] += vt_malicious
                result["threats"].append({
                    "type": f"VirusTotal Detection: {vt_malicious} Security Vendors Flagged Malicious",
                    "severity": "CRITICAL" if vt_malicious >= 3 else "HIGH",
                    "first_seen": datetime.now().strftime("%Y-%m-%d"),
                    "last_seen": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "confidence": min(100, 75 + vt_malicious * 5),
                    "source": "VirusTotal Multi-Engine"
                })
            elif vt_suspicious > 0:
                if result["risk_level"] == "LOW":
                    result["risk_level"] = "MEDIUM"
                result["security_score"] = min(result["security_score"], 70)
                result["threats"].append({
                    "type": f"VirusTotal Suspicious Engine Detections ({vt_suspicious})",
                    "severity": "MEDIUM",
                    "first_seen": datetime.now().strftime("%Y-%m-%d"),
                    "last_seen": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "confidence": 70,
                    "source": "VirusTotal"
                })

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
