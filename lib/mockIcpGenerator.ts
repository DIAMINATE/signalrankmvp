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
  let score = 0;
  const maxScore = 100;

  if (input.industry && input.industry !== "") score += 25;
  if (input.region && input.region !== "") score += 20;
  if (input.companySize && input.companySize !== "") score += 20;
  if (input.websiteUrl && input.websiteUrl !== "") score += 10;

  const domainHint = extractDomainHint(input.websiteUrl);
  if (domainHint) score += 10;
  if (domainHint && domainHint === input.industry) score += 5;

  if (input.notes && input.notes.trim().length > 20) score += 10;

  return Math.min(score, maxScore);
}

function generateSummary(input: ICPInput): string {
  const sizeLabel =
    input.companySize === "SMB"
      ? "small-to-medium"
      : input.companySize === "Mid-Market"
      ? "mid-market"
      : "enterprise";

  return `${sizeLabel} ${input.industry} companies in ${input.region} that are likely experiencing operational inefficiencies addressable by ${input.companyName}'s solution. These organizations typically have established teams and budget authority for technology purchases, and are actively seeking to optimize their workflows and reduce costs.`;
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
