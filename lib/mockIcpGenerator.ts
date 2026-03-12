import {
  PAIN_POINTS,
  BUYER_TITLES,
  TARGET_TRAITS,
  EXCLUDED_TRAITS,
  DOMAIN_KEYWORDS,
} from "./mockData";

export interface GeneratedICP {
  summary: string;
  painPoints: string[];
  buyerTitles: string[];
  traits: string[];
  excludedTraits: string[];
  confidence: number;
}

interface ICPInput {
  companyName: string;
  websiteUrl: string;
  industry: string;
  region: string;
  companySize: string;
  notes?: string;
}

function extractDomainHint(url: string): string | null {
  try {
    const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    for (const [keyword, industry] of Object.entries(DOMAIN_KEYWORDS)) {
      if (domain.includes(keyword)) return industry;
    }
  } catch {}
  return null;
}

function calculateConfidence(input: ICPInput): number {
  let score = 72;

  if (input.industry && input.industry !== "") score += 6;
  if (input.region && input.region !== "") score += 5;
  if (input.companySize && input.companySize !== "") score += 5;
  if (input.websiteUrl && input.websiteUrl !== "") score += 2;

  const domainHint = extractDomainHint(input.websiteUrl);
  if (domainHint) score += 2;
  if (domainHint && domainHint === input.industry) score += 1;

  if (input.notes && input.notes.trim().length > 20) score += 3;

  return Math.min(score, 96);
}

function generateSummary(input: ICPInput): string {
  const sizeLabel =
    input.companySize === "SMB"
      ? "small-to-medium"
      : input.companySize === "Mid-Market"
      ? "mid-market"
      : "enterprise";

  const industry = input.industry || "technology";
  const region = input.region || "global";

  return `Based on an analysis of ${input.companyName}'s web presence and market positioning, the strongest-fit prospects appear to be ${sizeLabel} ${industry} companies in ${region}. These organizations are likely experiencing operational challenges that align with ${input.companyName}'s core value proposition. They typically have established teams with budget authority for technology purchases, and show signals of actively evaluating solutions in this space.`;
}

export function generateICP(input: ICPInput): GeneratedICP {
  const industry = input.industry || "SaaS";
  const companySize = input.companySize || "Mid-Market";

  const painPoints = (PAIN_POINTS[industry] || PAIN_POINTS["SaaS"]).slice(0, 5);

  const titleMap = BUYER_TITLES[industry] || BUYER_TITLES["SaaS"];
  const buyerTitles = (titleMap[companySize] || titleMap["Mid-Market"]).slice(0, 4);

  const traits = (TARGET_TRAITS[industry] || TARGET_TRAITS["SaaS"]).slice(0, 4);

  const excludedTraits = (EXCLUDED_TRAITS[industry] || EXCLUDED_TRAITS["SaaS"]).slice(0, 3);

  const confidence = calculateConfidence(input);

  return {
    summary: generateSummary(input),
    painPoints,
    buyerTitles,
    traits,
    excludedTraits,
    confidence,
  };
}
