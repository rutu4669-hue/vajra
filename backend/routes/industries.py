from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class IndustryTarget(BaseModel):
    id: int
    name: str
    attack_percentage: float
    attack_count: int
    trend: str
    risk_level: str
    primary_threat_vectors: List[str]
    top_adversaries: List[str]
    common_cves: List[str]
    impact_summary: str
    recommended_defenses: List[str]
    description: str

    model_config = {"extra": "allow"}

INDUSTRIES_DATA: List[dict] = [
    {
        "id": 1,
        "name": "Healthcare & Medical",
        "attack_percentage": 28.5,
        "attack_count": 356,
        "trend": "↑ 12%",
        "risk_level": "CRITICAL",
        "primary_threat_vectors": ["Double Extortion Ransomware", "Medical IoT & PACS Exploit", "Phishing Credential Harvesters", "Third-Party Vendor Supply Chain"],
        "top_adversaries": ["LockBit 3.0", "BlackCat (ALPHV)", "Royal Ransomware", "Lazarus Group"],
        "common_cves": ["CVE-2023-4966 (Citrix Bleed)", "CVE-2023-2868 (Barracuda ESG)", "CVE-2024-21887 (Ivanti Connect Secure)"],
        "impact_summary": "Disruption of emergency care systems, patient medical record (EHR) leakage on dark web forums, high vulnerability due to legacy diagnostic equipment that cannot be easily patched.",
        "recommended_defenses": [
            "Strict network segmentation separating clinical diagnostic devices from general IT networks",
            "FIDO2 MFA enforcement on all electronic health record (EHR) portals and telehealth endpoints",
            "Immutable, off-site air-gapped backups for hospital critical database clusters",
            "Continuous 24/7 MDR/EDR monitoring on all workstations and hospital IoT gateways"
        ],
        "description": "Healthcare remains the #1 most targeted sector globally due to high urgency, sensitive patient data value on the dark web, and critical operational dependency on 24/7 uptime."
    },
    {
        "id": 2,
        "name": "Financial Services & Banking",
        "attack_percentage": 22.3,
        "attack_count": 278,
        "trend": "↑ 8%",
        "risk_level": "CRITICAL",
        "primary_threat_vectors": ["SWIFT Protocol Manipulation", "API Credential Stuffing & Takeover", "Cryptocurrency Smart Contract Drainers", "Banking Trojans"],
        "top_adversaries": ["Lazarus Group", "FIN7", "Evil Corp", "Silence Group"],
        "common_cves": ["CVE-2023-38606 (Kernel Memory Exposure)", "CVE-2024-1709 (ConnectWise Auth Bypass)", "CVE-2023-48788 (FortiClient EMS)"],
        "impact_summary": "Direct wire fraud and asset transfer theft, regulatory compliance penalties (GLBA/GDPR), massive brand reputation damage, customer account takeover surges.",
        "recommended_defenses": [
            "Hardware Security Module (HSM) key isolation for all transaction signing systems",
            "AI-powered behavioral fraud and anomalous transaction velocity detectors",
            "Mandatory dual-authorization workflows on all funds transfer and wire operations",
            "Zero Trust Network Access (ZTNA) on developer and privileged banking terminals"
        ],
        "description": "Financial institutions face persistent attacks from both state-sponsored actors seeking revenue and sophisticated cybercrime syndicates targeting payment gateways and banking APIs."
    },
    {
        "id": 3,
        "name": "Government & Defense",
        "attack_percentage": 18.7,
        "attack_count": 234,
        "trend": "↑ 15%",
        "risk_level": "CRITICAL",
        "primary_threat_vectors": ["State-Sponsored Espionage", "Spear-Phishing on Diplomatic Staff", "Living-off-the-Land (LotL)", "Zero-Day Exploits on Edge Gateways"],
        "top_adversaries": ["APT29 (Cozy Bear)", "APT28 (Fancy Bear)", "Volt Typhoon", "Mustang Panda"],
        "common_cves": ["CVE-2023-23397 (Microsoft Outlook NTLM)", "CVE-2024-3400 (Palo Alto Networks PAN-OS)", "CVE-2023-46805 (Ivanti VPN)"],
        "impact_summary": "Theft of classified defense designs, diplomatic communication eavesdropping, compromise of voter registration and municipal service databases.",
        "recommended_defenses": [
            "Strict Cross-Domain Solutions (CDS) and air-gapped classification enclaves",
            "Elimination of legacy NTLM protocols across government Active Directory forests",
            "Real-time memory anomaly detection and firmware integrity verification on boundary firewalls",
            "Comprehensive supply chain security vetting for all defense contractor deliverables"
        ],
        "description": "Government agencies and defense industrial base contractors are prime targets for nation-state cyber espionage seeking strategic, geopolitical, and military advantages."
    },
    {
        "id": 4,
        "name": "Manufacturing & Supply Chain",
        "attack_percentage": 14.2,
        "attack_count": 178,
        "trend": "↓ 3%",
        "risk_level": "HIGH",
        "primary_threat_vectors": ["SCADA/ICS Protocol Hijacking", "Ransomware Halting Assembly Lines", "Compromised Vendor Firmware", "RDP Brute-Forcing"],
        "top_adversaries": ["LockBit 3.0", "Cl0p", "BlackBasta", "Dragonfly (Energetic Bear)"],
        "common_cves": ["CVE-2023-34362 (MOVEit Transfer SQLi)", "CVE-2023-27997 (FortiOS SSL-VPN)", "CVE-2022-26134 (Confluence OGNL)"],
        "impact_summary": "Factory production line halts costing millions per hour, intellectual property and blueprint theft, cascade failures across downstream supplier networks.",
        "recommended_defenses": [
            "Physical and logical air-gapping of Purdue Model Industrial Control (ICS) networks",
            "Deprecation of default credentials on programmable logic controllers (PLCs)",
            "Software Bill of Materials (SBOM) tracking for all embedded industrial software",
            "Unified visibility platforms bridging IT security operations with OT engineering"
        ],
        "description": "Manufacturing combines legacy operational technology (OT) with internet-connected ERP systems, creating lucrative extortion targets for ransomware operators."
    },
    {
        "id": 5,
        "name": "Technology & Cloud Services",
        "attack_percentage": 10.8,
        "attack_count": 135,
        "trend": "↑ 5%",
        "risk_level": "HIGH",
        "primary_threat_vectors": ["CI/CD Pipeline Poisoning", "Open-Source Package Typosquatting", "Cloud IAM Role Misconfigurations", "API Key & Secret Leakage"],
        "top_adversaries": ["Lazarus (Zinc)", "APT29 (Nobelium)", "Scattered Spider (0ktapus)", "Lapsus$ Group"],
        "common_cves": ["CVE-2024-3094 (XZ Utils Backdoor)", "CVE-2023-44487 (HTTP/2 Rapid Reset)", "CVE-2024-27198 (TeamCity Auth Bypass)"],
        "impact_summary": "Downstream supply chain compromises affecting millions of software users, cloud tenant credential theft, unauthorized cryptomining on cloud clusters.",
        "recommended_defenses": [
            "Automated secret scanning on all Git repositories and continuous build pipelines",
            "Mandatory signed commits and multi-party reviews on production deployment branches",
            "Least-privilege Cloud IAM roles with short-lived STS session credentials",
            "Automated dependency vulnerability audits with lockfile integrity validation"
        ],
        "description": "Tech companies and cloud providers are high-value targets because compromising a single service can grant adversaries access to thousands of downstream customers."
    },
    {
        "id": 6,
        "name": "Retail & E-Commerce",
        "attack_percentage": 5.5,
        "attack_count": 69,
        "trend": "↓ 2%",
        "risk_level": "MEDIUM",
        "primary_threat_vectors": ["Magecart Digital Skimming", "Point-of-Sale (PoS) Memory Scrapers", "Account Takeover via Stolen Combos", "DDoS Extortion During Peak Sales"],
        "top_adversaries": ["Magecart Group 8", "FIN6", "TA505", "Snatch Ransomware"],
        "common_cves": ["CVE-2023-3824 (PHP Buffer Overflow)", "CVE-2024-20767 (Adobe ColdFusion)", "CVE-2023-22515 (Confluence Auth Bypass)"],
        "impact_summary": "Payment card number (PAN) and CVV theft directly from browser checkouts, consumer class-action lawsuits, PCI-DSS compliance audits and sanctions.",
        "recommended_defenses": [
            "Content Security Policy (CSP) headers and Subresource Integrity (SRI) on checkout scripts",
            "Tokenization of payment data to ensure zero plaintext card exposure",
            "Automated bot mitigation and rate-limiting on user login and gift card verification portals",
            "Continuous vulnerability scanning of web application firewalls (WAFs)"
        ],
        "description": "Retail platforms process high volumes of consumer payment cards and personal identities, attracting digital skimming syndicates and automated credential testing bots."
    }
]

@router.get("", response_model=List[IndustryTarget])
async def get_targeted_industries():
    return INDUSTRIES_DATA
