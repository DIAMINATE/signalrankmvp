"""
Pattern Analysis: Cross-reference data points, identify recurring themes, score confidence.
"""

from typing import Dict, List, Tuple


class PatternAnalyzer:
    """Cross-reference extracted data, find contradictions, assign confidence."""

    @staticmethod
    def cross_reference(extracted_data: Dict) -> Dict:
        """
        Cross-reference data points and identify potential contradictions.
        Returns analysis dict with themes, contradictions, confidence scores.
        """
        analysis: Dict = {
            "recurring_themes": [],
            "contradictions": [],
            "confidence_factors": [],
            "overall_confidence": 0.5,
        }

        customers = extracted_data.get("customers", [])
        industries = extracted_data.get("industries", [])
        industries_from_logos = extracted_data.get("industries_from_logos", [])
        pain_points = extracted_data.get("pain_points", [])
        pricing = extracted_data.get("pricing", {})
        testimonials = extracted_data.get("testimonials", [])
        topics = extracted_data.get("topics", [])

        confidence_score = 0.5

        if len(customers) >= 5:
            analysis["recurring_themes"].append(
                f"Strong customer evidence ({len(customers)} logos/names)"
            )
            confidence_score += 0.08
        elif len(customers) >= 1:
            confidence_score += 0.04

        if len(testimonials) >= 3:
            analysis["recurring_themes"].append(
                f"Multiple testimonials ({len(testimonials)} quotes)"
            )
            confidence_score += 0.08
        elif len(testimonials) >= 1:
            confidence_score += 0.04

        if industries_from_logos and industries:
            overlap = set(industries_from_logos) & set(industries)
            if overlap:
                analysis["recurring_themes"].append(
                    f"Industry alignment: logos and content both mention {', '.join(overlap)}"
                )
                confidence_score += 0.06
            elif set(industries_from_logos) != set(industries):
                analysis["contradictions"].append(
                    f"Industries from logos ({industries_from_logos}) differ from "
                    f"content keywords ({industries})"
                )
                confidence_score -= 0.02

        if pricing.get("tiers"):
            analysis["recurring_themes"].append(
                f"Explicit pricing: {pricing.get('tiers', [])}"
            )
            confidence_score += 0.06

        if len(pain_points) >= 3:
            confidence_score += 0.05
        elif len(pain_points) >= 1:
            confidence_score += 0.02

        if topics:
            flat_topics = [w for t in topics for w in t]
            analysis["recurring_themes"].append(
                f"Topic themes: {', '.join(flat_topics[:10])}"
            )
            confidence_score += 0.03

        analysis["confidence_factors"] = [
            f"Data sources: {len(extracted_data.get('page_types', {}))} pages analyzed",
            f"Customer logos: {len(customers)}",
            f"Testimonials: {len(testimonials)}",
            f"Pain points: {len(pain_points)}",
        ]
        analysis["overall_confidence"] = min(0.95, max(0.3, confidence_score))

        return analysis
