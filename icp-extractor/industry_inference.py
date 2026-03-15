"""
Industry inference from company names/logos.
Rule-based mapping for known brands (e.g., Pixar -> Entertainment, Stripe -> Fintech).
"""

import re
from typing import Dict, List, Optional

# Known brand -> industry mapping (expandable)
BRAND_TO_INDUSTRY: Dict[str, str] = {
    "pixar": "Entertainment",
    "disney": "Entertainment",
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "stripe": "Fintech",
    "square": "Fintech",
    "plaid": "Fintech",
    "robinhood": "Fintech",
    "coinbase": "Fintech",
    "salesforce": "SaaS",
    "hubspot": "SaaS",
    "slack": "SaaS",
    "notion": "SaaS",
    "figma": "SaaS",
    "atlassian": "SaaS",
    "zoom": "SaaS",
    "dropbox": "SaaS",
    "airtable": "SaaS",
    "asana": "SaaS",
    "monday": "SaaS",
    "shopify": "E-Commerce",
    "amazon": "E-Commerce",
    "ebay": "E-Commerce",
    "walmart": "Retail",
    "target": "Retail",
    "nike": "Retail",
    "adobe": "Software",
    "microsoft": "Software",
    "google": "Software",
    "apple": "Technology",
    "ibm": "Technology",
    "oracle": "Technology",
    "snowflake": "Technology",
    "databricks": "Technology",
    "openai": "AI",
    "anthropic": "AI",
    "crowdstrike": "Cybersecurity",
    "palo alto": "Cybersecurity",
    "zscaler": "Cybersecurity",
    "okta": "Cybersecurity",
    "coursera": "EdTech",
    "udemy": "EdTech",
    "duolingo": "EdTech",
    "khan academy": "EdTech",
    "mayo clinic": "Healthcare",
    "cvs": "Healthcare",
    "cerner": "Healthcare",
    "epic": "Healthcare",
    "ge": "Manufacturing",
    "siemens": "Manufacturing",
    "bmw": "Manufacturing",
    "tesla": "Manufacturing",
}


def infer_industry_from_name(company_name: str) -> Optional[str]:
    """
    Infer industry from company name using rule-based lookup.
    Returns industry string or None if unknown.
    """
    if not company_name or len(company_name) < 2:
        return None
    normalized = re.sub(r"[^a-z0-9\s]", "", company_name.lower()).strip()
    if not normalized:
        return None
    for brand, industry in BRAND_TO_INDUSTRY.items():
        if brand in normalized or normalized in brand:
            return industry
    return None


def infer_industries_from_logos(logos: List[str]) -> List[str]:
    """
    Infer industries from a list of customer logos/names.
    Returns deduplicated list of inferred industries.
    """
    industries: set[str] = set()
    for logo in logos:
        industry = infer_industry_from_name(logo)
        if industry:
            industries.add(industry)
    return list(industries)
