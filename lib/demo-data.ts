import { rankLeads } from "./mockLeadRanker";

export interface Project {
  id: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  region: string;
  companySize: string;
  notes: string;
  status: string;
  segmentName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICPGeneration {
  id: string;
  projectId: string;
  versionType: "initial" | "corrected";
  summary: string;
  painPoints: string[];
  buyerTitles: string[];
  traits: string[];
  excludedTraits: string[];
  confidence: number;
  createdAt: string;
}

export interface LeadRecommendation {
  id: string;
  projectId: string;
  companyName: string;
  contactName: string;
  title: string;
  region: string;
  industry: string;
  companySize: string;
  fitScore: number;
  confidence: number;
  reasons: string[];
  signals: string[];
  sourceTemplateKey: string;
  createdAt: string;
}

export interface FeedbackEvent {
  id: string;
  projectId: string;
  leadRecommendationId: string;
  feedbackType: string;
  notes: string;
  createdAt: string;
}

export const CLAY_COMPANY = {
  companyName: "Clay",
  websiteUrl: "https://www.clay.com",
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildDemoData() {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  const projects: Project[] = [
    {
      id: "proj-clay-mm",
      companyName: "Clay",
      websiteUrl: "https://www.clay.com",
      industry: "SaaS",
      region: "North America",
      companySize: "Mid-Market",
      notes: "Focus on B2B SaaS companies with active outbound motions and 50-500 employees. Prioritize companies using Clay competitors or doing manual enrichment.",
      status: "leads_ranked",
      segmentName: "Mid-Market SaaS — North America",
      createdAt: twoDaysAgo,
      updatedAt: now,
    },
    {
      id: "proj-clay-ent",
      companyName: "Clay",
      websiteUrl: "https://www.clay.com",
      industry: "SaaS",
      region: "North America",
      companySize: "Enterprise",
      notes: "Enterprise expansion — targeting large SaaS companies with 500+ employees and complex outbound stacks.",
      status: "icp_verified",
      segmentName: "Enterprise SaaS — North America",
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "proj-clay-eu",
      companyName: "Clay",
      websiteUrl: "https://www.clay.com",
      industry: "SaaS",
      region: "Europe",
      companySize: "Mid-Market",
      notes: "European market entry. Targeting mid-market SaaS companies in EU with outbound sales teams.",
      status: "icp_generated",
      segmentName: "Mid-Market SaaS — Europe",
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "proj-clay-draft",
      companyName: "Clay",
      websiteUrl: "https://www.clay.com",
      industry: "Fintech",
      region: "North America",
      companySize: "Mid-Market",
      notes: "",
      status: "draft",
      segmentName: "Fintech Expansion",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const icpGenerations: ICPGeneration[] = [
    // Fully completed project — initial
    {
      id: "icp-mm-initial",
      projectId: "proj-clay-mm",
      versionType: "initial",
      summary: "Mid-market SaaS companies in North America that are likely experiencing operational inefficiencies addressable by Clay's data enrichment and outbound automation platform. These organizations typically have established sales teams and budget authority for GTM tooling purchases.",
      painPoints: ["Low outbound reply rates", "Pipeline efficiency declining", "SDR ramp time too long", "Tool sprawl across sales stack", "Poor lead-to-opportunity conversion"],
      buyerTitles: ["VP Sales", "RevOps Manager", "SDR Manager", "CRO", "Head of Growth"],
      traits: ["Uses outbound as primary GTM", "Has SDR team of 5+", "Recently raised Series A/B", "Uses Salesforce or HubSpot CRM"],
      excludedTraits: ["No outbound motion", "Pre-revenue stage", "Product-led only with no sales team"],
      confidence: 82,
      createdAt: twoDaysAgo,
    },
    // Fully completed project — corrected
    {
      id: "icp-mm-corrected",
      projectId: "proj-clay-mm",
      versionType: "corrected",
      summary: "Mid-market B2B SaaS companies (50-500 employees) in North America with active outbound sales motions and dedicated RevOps or sales operations functions. Ideal targets have recently raised Series A through C, are scaling GTM teams, and are experiencing friction from manual prospecting workflows or fragmented enrichment tooling.",
      painPoints: ["Low outbound reply rates", "Wasted outbound effort on bad-fit accounts", "Pipeline efficiency declining", "Tool sprawl across sales stack", "SDR ramp time too long", "Poor lead-to-opportunity conversion"],
      buyerTitles: ["VP Sales", "RevOps Manager", "SDR Manager", "CRO", "Head of Growth"],
      traits: ["Uses outbound as primary GTM", "Has SDR team of 5+", "Recently raised Series A/B", "Uses Salesforce or HubSpot CRM", "Growing headcount in sales"],
      excludedTraits: ["No outbound motion", "Pre-revenue stage", "Product-led only with no sales team", "Less than 10 employees"],
      confidence: 91,
      createdAt: yesterday,
    },

    // Enterprise project — initial + corrected
    {
      id: "icp-ent-initial",
      projectId: "proj-clay-ent",
      versionType: "initial",
      summary: "Enterprise SaaS companies in North America with large sales organizations and complex outbound operations addressable by Clay's platform.",
      painPoints: ["Pipeline efficiency declining", "Tool sprawl across sales stack", "SDR ramp time too long", "Low outbound reply rates"],
      buyerTitles: ["CRO", "SVP Sales", "VP Revenue Operations", "Chief Growth Officer"],
      traits: ["Uses outbound as primary GTM", "Has SDR team of 5+", "Uses Salesforce or HubSpot CRM", "Growing headcount in sales"],
      excludedTraits: ["No outbound motion", "Pre-revenue stage"],
      confidence: 78,
      createdAt: yesterday,
    },
    {
      id: "icp-ent-corrected",
      projectId: "proj-clay-ent",
      versionType: "corrected",
      summary: "Enterprise SaaS and infrastructure companies (500+ employees) in North America with dedicated outbound teams of 20+. These companies have outgrown point solutions for data enrichment and need a scalable, automated pipeline for prospecting and signal detection.",
      painPoints: ["Pipeline efficiency declining", "Tool sprawl across sales stack", "SDR ramp time too long", "Wasted outbound effort on bad-fit accounts", "Poor lead-to-opportunity conversion"],
      buyerTitles: ["CRO", "SVP Sales", "VP Revenue Operations", "Chief Growth Officer"],
      traits: ["Uses outbound as primary GTM", "Has SDR team of 5+", "Uses Salesforce or HubSpot CRM", "Growing headcount in sales"],
      excludedTraits: ["No outbound motion", "Pre-revenue stage", "Product-led only with no sales team"],
      confidence: 87,
      createdAt: yesterday,
    },

    // EU project — initial only
    {
      id: "icp-eu-initial",
      projectId: "proj-clay-eu",
      versionType: "initial",
      summary: "Mid-market SaaS companies in Europe that are likely experiencing outbound inefficiencies addressable by Clay's platform. European GTM teams often face additional complexity from multi-market operations and GDPR compliance.",
      painPoints: ["Low outbound reply rates", "Pipeline efficiency declining", "SDR ramp time too long", "Tool sprawl across sales stack"],
      buyerTitles: ["VP Sales", "RevOps Manager", "SDR Manager", "CRO"],
      traits: ["Uses outbound as primary GTM", "Has SDR team of 5+", "Recently raised Series A/B"],
      excludedTraits: ["No outbound motion", "Pre-revenue stage", "Product-led only with no sales team"],
      confidence: 72,
      createdAt: yesterday,
    },
  ];

  // Generate ranked leads for the completed project
  const correctedIcp = icpGenerations.find((i) => i.id === "icp-mm-corrected")!;
  const scored = rankLeads(
    {
      ...correctedIcp,
      industry: "SaaS",
      region: "North America",
      companySize: "Mid-Market",
    },
    25
  );

  const leadRecommendations: LeadRecommendation[] = scored.map((s) => ({
    id: `lead-${makeId()}`,
    projectId: "proj-clay-mm",
    companyName: s.candidate.companyName,
    contactName: s.candidate.contactName,
    title: s.candidate.title,
    region: s.candidate.region,
    industry: s.candidate.industry,
    companySize: s.candidate.companySize,
    fitScore: s.fitScore,
    confidence: s.confidence,
    reasons: s.reasons,
    signals: s.signals,
    sourceTemplateKey: s.candidate.sourceTemplateKey,
    createdAt: now,
  }));

  const feedbackEvents: FeedbackEvent[] = leadRecommendations.slice(0, 3).map((lead, i) => ({
    id: `fb-${makeId()}`,
    projectId: "proj-clay-mm",
    leadRecommendationId: lead.id,
    feedbackType: i === 0 ? "good_fit" : i === 1 ? "contacted" : "good_fit",
    notes: i === 0 ? "Strong alignment — they use three separate enrichment tools" : "",
    createdAt: now,
  }));

  return { projects, icpGenerations, leadRecommendations, feedbackEvents };
}

export const DEMO_DATA = buildDemoData();

export const STATIC_PROJECT_IDS = [
  "proj-clay-mm",
  "proj-clay-ent",
  "proj-clay-eu",
  "proj-clay-draft",
  "proj-new-1",
  "proj-new-2",
  "proj-new-3",
];
