"""
Data Extractor with Page Type Classification.
Classifies pages (Pricing, Case Studies, Testimonials, About/Solutions) before extraction.
"""

import re
from typing import Dict, List, Literal, Optional

import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

from industry_inference import infer_industries_from_logos

PageType = Literal["pricing", "case_studies", "testimonials", "about_solutions", "other"]


def _ensure_nltk() -> None:
    for resource in ["vader_lexicon", "punkt", "punkt_tab", "stopwords"]:
        try:
            nltk.data.find(f"tokenizers/{resource}")
        except LookupError:
            nltk.download(resource, quiet=True)


class PageTypeClassifier:
    """Classify page type from URL and content heuristics."""

    URL_PATTERNS: Dict[PageType, List[str]] = {
        "pricing": ["pricing", "plans", "price"],
        "case_studies": ["case-stud", "success", "stories", "customers", "clients"],
        "testimonials": ["testimonial", "review", "wall-of-love", "love"],
        "about_solutions": ["about", "solutions", "product", "features", "use-cases"],
    }

    CONTENT_HEURISTICS: Dict[PageType, List[str]] = {
        "pricing": ["$", "per month", "per year", "billing", "subscribe", "tier"],
        "case_studies": ["case study", "success story", "roi", "results", "customer story"],
        "testimonials": ["said", "quote", "testimonial", "review", "recommend"],
    }

    @classmethod
    def classify(cls, url: str, clean_text: str, has_pricing_tiers: bool) -> PageType:
        path = url.lower()
        text_lower = (clean_text or "")[:3000].lower()

        if has_pricing_tiers or any(h in text_lower for h in cls.CONTENT_HEURISTICS["pricing"]):
            if any(p in path for p in cls.URL_PATTERNS["pricing"]):
                return "pricing"

        for p in cls.URL_PATTERNS["case_studies"]:
            if p in path:
                return "case_studies"

        for p in cls.URL_PATTERNS["testimonials"]:
            if p in path:
                return "testimonials"

        for p in cls.URL_PATTERNS["about_solutions"]:
            if p in path:
                return "about_solutions"

        if any(h in text_lower for h in cls.CONTENT_HEURISTICS["case_studies"]):
            return "case_studies"
        if any(h in text_lower for h in cls.CONTENT_HEURISTICS["testimonials"]):
            return "testimonials"

        return "other"


class DataExtractor:
    JOB_TITLES = [
        "CEO",
        "CTO",
        "CFO",
        "CMO",
        "COO",
        "VP",
        "Vice President",
        "Director",
        "Head of",
        "Manager",
        "Lead",
        "Senior",
        "Chief",
        "Founder",
        "Co-founder",
        "Engineer",
        "Developer",
        "Marketing",
        "Sales",
        "Growth",
        "Product",
        "Operations",
        "RevOps",
        "SDR",
        "BDR",
    ]
    INDUSTRIES = [
        "SaaS",
        "Software",
        "Technology",
        "Tech",
        "AI",
        "ML",
        "Fintech",
        "Finance",
        "Healthcare",
        "E-commerce",
        "Retail",
        "Education",
        "EdTech",
        "Real Estate",
        "Manufacturing",
        "Media",
        "Entertainment",
        "B2B",
        "B2C",
        "Enterprise",
        "Startup",
    ]

    def __init__(self, pages_content: Dict[str, Dict]):
        self.pages = pages_content
        _ensure_nltk()
        self.sia = SentimentIntensityAnalyzer()
        self.extracted_data: Dict = {
            "customers": [],
            "testimonials": [],
            "job_titles": [],
            "industries": [],
            "industries_from_logos": [],
            "pain_points": [],
            "pricing": {},
            "company_sizes": [],
            "integrations": [],
            "entities": {},
            "page_types": {},
            "topics": [],
        }

    def extract_all(self) -> Dict:
        all_text = " ".join(
            [p.get("clean_text", "") for p in self.pages.values() if p]
        )

        for url, page in self.pages.items():
            if not page:
                continue
            clean_text = page.get("clean_text", "")
            has_tiers = bool(page.get("pricing", {}).get("tiers"))
            page_type = PageTypeClassifier.classify(url, clean_text, has_tiers)
            self.extracted_data["page_types"][url] = page_type

            self.extracted_data["customers"].extend(page.get("logos", []))
            self.extracted_data["testimonials"].extend(page.get("testimonials", []))
            if page.get("pricing", {}).get("tiers"):
                self.extracted_data["pricing"] = page["pricing"]

        self.extracted_data["customers"] = list(set(self.extracted_data["customers"]))
        self.extracted_data["industries_from_logos"] = infer_industries_from_logos(
            self.extracted_data["customers"]
        )

        for title in self.JOB_TITLES:
            if re.search(rf"\b{re.escape(title)}\b", all_text, re.IGNORECASE):
                self.extracted_data["job_titles"].append(title)

        for industry in self.INDUSTRIES:
            if re.search(rf"\b{re.escape(industry)}\b", all_text, re.IGNORECASE):
                self.extracted_data["industries"].append(industry)

        all_industries = list(
            set(
                self.extracted_data["industries"]
                + self.extracted_data["industries_from_logos"]
            )
        )
        self.extracted_data["industries"] = all_industries

        pain_indicators = [
            "struggle",
            "difficult",
            "challenge",
            "problem",
            "waste",
            "manual",
            "tedious",
            "expensive",
            "complex",
        ]
        for sentence in nltk.sent_tokenize(all_text) if all_text else []:
            sentiment = self.sia.polarity_scores(sentence)
            if (
                sentiment["neg"] > 0.3
                or any(ind in sentence.lower() for ind in pain_indicators)
            ) and len(sentence) > 20:
                self.extracted_data["pain_points"].append(
                    {
                        "text": sentence[:300],
                        "sentiment_score": sentiment["compound"],
                    }
                )
        self.extracted_data["pain_points"] = sorted(
            self.extracted_data["pain_points"],
            key=lambda x: x["sentiment_score"],
        )[:15]

        size_patterns = [
            r"(\d+)\+?\s*employees?",
            r"(small|medium|large|enterprise|startup|smb|mid-market)",
            r"series\s*([a-e])",
        ]
        for pattern in size_patterns:
            for m in re.findall(pattern, all_text, re.IGNORECASE):
                val = m if isinstance(m, str) else "-".join(m)
                self.extracted_data["company_sizes"].append(str(val))

        integrations = [
            "Salesforce",
            "HubSpot",
            "Slack",
            "Zapier",
            "Notion",
            "Google",
            "Microsoft",
            "Jira",
            "Asana",
            "LinkedIn",
            "Zoom",
            "Intercom",
        ]
        self.extracted_data["integrations"] = [
            i
            for i in integrations
            if re.search(rf"\b{re.escape(i)}\b", all_text, re.IGNORECASE)
        ]

        return self.extracted_data
