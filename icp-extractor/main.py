"""
FastAPI ICP Extractor API.
POST /extract-icp with {"url": "https://example.com"} returns structured ICP.
"""

import os
from typing import Any, Dict

import spacy
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from crawler import WebsiteCrawler
from extractor import DataExtractor
from icp_analyzer import ICPAnalyzer
from nlp_pipeline import NLPPipeline
from pattern_analyzer import PatternAnalyzer
from openai import OpenAI


def _load_nlp():
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        import subprocess
        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
        return spacy.load("en_core_web_sm")


nlp = _load_nlp()
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY")) if os.environ.get("OPENAI_API_KEY") else None

app = FastAPI(title="ICP Extractor API", version="1.0.0")

# CORS for static deployments (GitHub Pages, etc.) - client calls this API directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    url: str


class ExtractResponse(BaseModel):
    success: bool
    icp: Dict[str, Any] | None = None
    app_icp: Dict[str, Any] | None = None
    error: str | None = None


def _to_app_icp(icp_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map GPT-4 ICP output to app ICPGeneration shape.
    """
    if "error" in icp_data:
        return {}

    primary = icp_data.get("primary_icp", {})
    cp = primary.get("company_profile", {})
    bp = primary.get("buyer_persona", {})
    pp = primary.get("pain_points", {})
    bi = primary.get("budget_indicators", {})
    anti = icp_data.get("anti_icp", {})
    quality = icp_data.get("data_quality", {})
    insights = icp_data.get("actionable_insights", {})

    size_range = cp.get("size_range", "")
    industries = cp.get("industries", [])
    characteristics = cp.get("characteristics", "")
    primary_titles = bp.get("primary_titles", [])
    secondary_titles = bp.get("secondary_titles", [])
    pain_primary = pp.get("primary", [])
    avoid = anti.get("avoid", [])
    confidence = quality.get("overall_confidence", 0.5)
    if isinstance(confidence, float) and confidence <= 1:
        confidence = int(round(confidence * 100))

    traits = [characteristics] if characteristics else []
    traits.extend(industries[:2])

    summary_parts = []
    if size_range:
        summary_parts.append(size_range)
    if industries:
        summary_parts.append(", ".join(industries[:3]))
    summary = " ".join(summary_parts)
    if not summary:
        summary = "Based on website analysis, ideal customers align with the pain points and buyer personas below."

    return {
        "summary": summary,
        "painPoints": pain_primary[:8] if pain_primary else [],
        "buyerTitles": list(primary_titles)[:6] + list(secondary_titles)[:4],
        "traits": traits[:6] if traits else [],
        "excludedTraits": avoid[:5] if avoid else [],
        "confidence": min(95, max(30, confidence)),
    }


@app.post("/extract-icp", response_model=ExtractResponse)
def extract_icp(req: ExtractRequest) -> ExtractResponse:
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    if not url.startswith("http"):
        url = "https://" + url

    if not openai_client:
        return ExtractResponse(
            success=False,
            error="OPENAI_API_KEY not set. Configure it to use ICP extraction.",
        )

    try:
        crawler = WebsiteCrawler(url, max_pages=15)
        pages = crawler.crawl()
        if not pages:
            return ExtractResponse(
                success=False,
                error="Could not crawl any pages. Check URL and try again.",
            )

        extractor = DataExtractor(pages)
        extracted_data = extractor.extract_all()

        nlp_pipeline = NLPPipeline(nlp=nlp)
        extracted_data = nlp_pipeline.process(pages, extracted_data)

        pattern_analysis = PatternAnalyzer.cross_reference(extracted_data)
        extracted_data["pattern_analysis"] = pattern_analysis

        analyzer = ICPAnalyzer(openai_client, extracted_data)
        icp_result = analyzer.analyze(url)

        if "error" in icp_result:
            return ExtractResponse(
                success=False,
                icp=icp_result,
                error=icp_result["error"],
            )

        app_icp = _to_app_icp(icp_result)
        return ExtractResponse(
            success=True,
            icp=icp_result,
            app_icp=app_icp,
        )
    except Exception as e:
        return ExtractResponse(
            success=False,
            error=str(e),
        )


@app.get("/health")
def health():
    return {"status": "ok", "openai_configured": bool(openai_client)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
