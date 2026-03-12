import { LEAD_POOL, type LeadCandidate } from "./mockLeadPool";

interface CorrectedICP {
  summary: string;
  painPoints: string[];
  buyerTitles: string[];
  traits: string[];
  excludedTraits: string[];
  industry: string;
  region: string;
  companySize: string;
}

export interface ScoredLead {
  candidate: LeadCandidate;
  fitScore: number;
  confidence: number;
  reasons: string[];
  signals: string[];
}

function normalizeForComparison(s: string): string {
  return s.toLowerCase().trim();
}

function arrayOverlap(a: string[], b: string[]): string[] {
  const normalB = b.map(normalizeForComparison);
  return a.filter((item) => normalB.includes(normalizeForComparison(item)));
}

function partialMatch(source: string, targets: string[]): boolean {
  const s = normalizeForComparison(source);
  return targets.some((t) => {
    const nt = normalizeForComparison(t);
    return s.includes(nt) || nt.includes(s);
  });
}

export function rankLeads(icp: CorrectedICP, topN: number = 30): ScoredLead[] {
  const scored: ScoredLead[] = [];

  for (const candidate of LEAD_POOL) {
    let fitScore = 0;
    let signalCount = 0;
    const reasons: string[] = [];
    const signals: string[] = [];

    // Industry match: +25
    if (normalizeForComparison(candidate.industry) === normalizeForComparison(icp.industry)) {
      fitScore += 25;
      signalCount += 1;
      reasons.push(`Industry match: ${candidate.industry}`);
      signals.push("industry-match");
    } else {
      reasons.push(`Industry mismatch: ${candidate.industry} vs ${icp.industry}`);
    }

    // Region match: +20
    if (normalizeForComparison(candidate.region) === normalizeForComparison(icp.region)) {
      fitScore += 20;
      signalCount += 1;
      reasons.push(`Region match: ${candidate.region}`);
      signals.push("region-match");
    }

    // Company size match: +20
    if (normalizeForComparison(candidate.companySize) === normalizeForComparison(icp.companySize)) {
      fitScore += 20;
      signalCount += 1;
      reasons.push(`Company size match: ${candidate.companySize}`);
      signals.push("size-match");
    }

    // Buyer title overlap: +20 (scaled by match count)
    const titleMatches = icp.buyerTitles.filter((bt) => partialMatch(candidate.title, [bt]));
    if (titleMatches.length > 0) {
      fitScore += 20;
      signalCount += 1;
      reasons.push(`Buyer title match: ${candidate.title} aligns with target titles`);
      signals.push("title-match");
    }

    // Pain point / signal overlap: +15 (scaled)
    const painOverlap = arrayOverlap(candidate.painPointSignals, icp.painPoints);
    if (painOverlap.length > 0) {
      const painScore = Math.min(15, (painOverlap.length / Math.max(icp.painPoints.length, 1)) * 15);
      fitScore += Math.round(painScore);
      signalCount += painOverlap.length;
      reasons.push(`${painOverlap.length} pain point signal(s) matched`);
      painOverlap.forEach((p) => signals.push(`pain:${p.toLowerCase().replace(/\s+/g, "-")}`));
    }

    // Trait overlap bonus: up to +5
    const traitOverlap = arrayOverlap(candidate.traits, icp.traits);
    if (traitOverlap.length > 0) {
      const traitBonus = Math.min(5, traitOverlap.length * 2);
      fitScore += traitBonus;
      signalCount += traitOverlap.length;
      traitOverlap.forEach((t) => signals.push(`trait:${t.toLowerCase().replace(/\s+/g, "-")}`));
    }

    // Check excluded traits — penalize if candidate matches exclusions
    const excludedOverlap = arrayOverlap(candidate.traits, icp.excludedTraits);
    if (excludedOverlap.length > 0) {
      fitScore -= excludedOverlap.length * 10;
      reasons.push(`Matched ${excludedOverlap.length} excluded trait(s) — score penalized`);
      signals.push("exclusion-flag");
    }

    fitScore = Math.max(0, Math.min(100, fitScore));

    // Scale fit into 60-95 range for leads that scored anything meaningful
    if (fitScore > 0) {
      fitScore = Math.round(60 + (fitScore / 100) * 35);
    }

    // Confidence: base of 65, plus signal coverage bonus up to 30
    const coverageRatio = signalCount / Math.max(5, signalCount + 2);
    const confidence = Math.min(97, Math.round(65 + coverageRatio * 30));

    scored.push({
      candidate,
      fitScore,
      confidence,
      reasons,
      signals,
    });
  }

  scored.sort((a, b) => b.fitScore - a.fitScore || b.confidence - a.confidence);

  return scored.slice(0, topN);
}
