"""
GPT-4 ICP Profile Generation.
"""

import json
import os
import re
from typing import Any, Dict, Optional

from openai import OpenAI


class ICPAnalyzer:
    def __init__(self, client: Optional[OpenAI], extracted_data: Dict):
        self.client = client
        self.data = extracted_data

    def analyze(self, company_url: str) -> Dict[str, Any]:
        if not self.client:
            return {"error": "OpenAI client not configured. Set OPENAI_API_KEY."}

        sections = []
        if self.data.get("customers"):
            sections.append(
                f"Customers: {', '.join(self.data['customers'][:30])}"
            )
        if self.data.get("industries_from_logos"):
            sections.append(
                f"Industries inferred from logos: {', '.join(self.data['industries_from_logos'])}"
            )
        if self.data.get("testimonials"):
            quotes = [
                f'"{t["quote"][:200]}" - {t.get("attribution", "Unknown")}'
                for t in self.data["testimonials"][:10]
            ]
            sections.append("Testimonials:\n" + "\n".join(quotes))
        if self.data.get("job_titles"):
            sections.append(f"Job Titles: {', '.join(self.data['job_titles'])}")
        if self.data.get("industries"):
            sections.append(f"Industries: {', '.join(self.data['industries'])}")
        if self.data.get("pain_points"):
            sections.append(
                "Pain Points: "
                + "; ".join([p["text"][:100] for p in self.data["pain_points"][:10]])
            )
        if self.data.get("pricing"):
            sections.append(
                f"Pricing: {self.data['pricing'].get('tiers', [])}"
            )
        if self.data.get("company_sizes"):
            sections.append(
                f"Company Sizes: {', '.join(self.data['company_sizes'][:15])}"
            )
        if self.data.get("integrations"):
            sections.append(
                f"Integrations: {', '.join(self.data['integrations'])}"
            )
        if self.data.get("topics"):
            flat = [w for t in self.data["topics"] for w in t]
            sections.append(f"Topic themes: {', '.join(flat[:15])}")
        if self.data.get("pattern_analysis"):
            pa = self.data["pattern_analysis"]
            sections.append(
                f"Pattern analysis: themes={pa.get('recurring_themes', [])}, "
                f"confidence={pa.get('overall_confidence', 0):.2f}"
            )

        context = "\n\n".join(sections)

        prompt = f"""Analyze this data from {company_url} and create a detailed ICP profile.

Data:
{context}

Return JSON with this structure (no markdown, no code block):
{{"company_analyzed": "string", "primary_icp": {{"title": "string", "company_profile": {{"size_range": "string", "industries": [], "growth_stage": "string", "characteristics": "string", "confidence": 0.0}}, "buyer_persona": {{"primary_titles": [], "secondary_titles": [], "department": "string", "team_size": "string", "confidence": 0.0}}, "current_state": {{"tools_used": [], "process": "string", "challenges": "string", "confidence": 0.0}}, "pain_points": {{"primary": [], "evidence": [], "confidence": 0.0}}, "success_metrics": [], "budget_indicators": {{"expected_tier": "string", "decision_factors": [], "budget_owner": "string", "confidence": 0.0}}}}, "secondary_icp": {{"title": "string", "description": "string", "key_differences": "string", "confidence": 0.0}}, "anti_icp": {{"avoid": [], "reasons": []}}, "actionable_insights": {{"marketing_message": "string", "sales_qualification_questions": [], "product_priorities": "string"}}, "data_quality": {{"overall_confidence": 0.0, "data_gaps": [], "recommendations": []}}}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a B2B ICP analyst. Return valid JSON only, no markdown.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=4000,
            )
            content = response.choices[0].message.content or ""
            json_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content)
            if json_match:
                content = json_match.group(1)
            return json.loads(content)
        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON from model: {str(e)}"}
        except Exception as e:
            return {"error": f"Analysis failed: {str(e)}"}
