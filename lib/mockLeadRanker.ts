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

function norm(s: string): string {
  return s.toLowerCase().trim();
}

function arrayOverlap(a: string[], b: string[]): string[] {
  const nb = b.map(norm);
  return a.filter((item) => nb.includes(norm(item)));
}

function partialMatch(source: string, targets: string[]): boolean {
  const s = norm(source);
  return targets.some((t) => { const nt = norm(t); return s.includes(nt) || nt.includes(s); });
}

export function rankLeads(icp: CorrectedICP, topN: number = 25): ScoredLead[] {
  const raw: { candidate: LeadCandidate; rawFit: number; signalCount: number; reasons: string[]; signals: string[] }[] = [];

  for (const candidate of LEAD_POOL) {
    let rawFit = 0;
    let signalCount = 0;
    const reasons: string[] = [];
    const signals: string[] = [];

    if (norm(candidate.industry) === norm(icp.industry)) {
      rawFit += 25; signalCount++; reasons.push(`Industry match: ${candidate.industry}`); signals.push("industry-match");
    }
    if (norm(candidate.region) === norm(icp.region)) {
      rawFit += 20; signalCount++; reasons.push(`Region match: ${candidate.region}`); signals.push("region-match");
    }
    if (norm(candidate.companySize) === norm(icp.companySize)) {
      rawFit += 20; signalCount++; reasons.push(`Company size match: ${candidate.companySize}`); signals.push("size-match");
    }

    const titleMatches = icp.buyerTitles.filter((bt) => partialMatch(candidate.title, [bt]));
    if (titleMatches.length > 0) {
      rawFit += 20; signalCount++; reasons.push(`Buyer title match: ${candidate.title}`); signals.push("title-match");
    }

    const painOverlap = arrayOverlap(candidate.painPointSignals, icp.painPoints);
    if (painOverlap.length > 0) {
      rawFit += Math.round(Math.min(15, (painOverlap.length / Math.max(icp.painPoints.length, 1)) * 15));
      signalCount += painOverlap.length;
      reasons.push(`${painOverlap.length} pain point signal(s) matched`);
      painOverlap.forEach((p) => signals.push(`pain:${p.toLowerCase().replace(/\s+/g, "-")}`));
    }

    const traitOverlap = arrayOverlap(candidate.traits, icp.traits);
    if (traitOverlap.length > 0) {
      rawFit += Math.min(5, traitOverlap.length * 2);
      signalCount += traitOverlap.length;
      traitOverlap.forEach((t) => signals.push(`trait:${t.toLowerCase().replace(/\s+/g, "-")}`));
    }

    const excludedOverlap = arrayOverlap(candidate.traits, icp.excludedTraits);
    if (excludedOverlap.length > 0) {
      rawFit -= excludedOverlap.length * 5;
      reasons.push(`Excluded trait penalty`);
      signals.push("exclusion-flag");
    }

    rawFit = Math.max(0, rawFit);
    raw.push({ candidate, rawFit, signalCount, reasons, signals });
  }

  raw.sort((a, b) => b.rawFit - a.rawFit || b.signalCount - a.signalCount);
  const top = raw.slice(0, topN);

  if (top.length === 0) return [];

  const maxRaw = top[0].rawFit;
  const minRaw = top[top.length - 1].rawFit;
  const rawRange = Math.max(maxRaw - minRaw, 1);

  return top.map((entry, idx) => {
    const rankPct = 1 - idx / Math.max(top.length - 1, 1);
    const fitScore = Math.round(68 + rankPct * 26);
    const confBase = entry.signalCount >= 5 ? 88 : entry.signalCount >= 3 ? 82 : 75;
    const confidence = Math.min(95, confBase + Math.round(rankPct * 7));

    return {
      candidate: entry.candidate,
      fitScore,
      confidence,
      reasons: entry.reasons,
      signals: entry.signals,
    };
  });
}
