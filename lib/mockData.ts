export const INDUSTRIES = [
  "SaaS",
  "Cybersecurity",
  "Fintech",
  "Healthcare",
  "E-Commerce",
  "Manufacturing",
  "EdTech",
  "MarTech",
] as const;

export const REGIONS = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
] as const;

export const COMPANY_SIZES = [
  "SMB",
  "Mid-Market",
  "Enterprise",
] as const;

export const PAIN_POINTS: Record<string, string[]> = {
  SaaS: [
    "Low outbound reply rates",
    "Pipeline efficiency declining",
    "SDR ramp time too long",
    "Tool sprawl across sales stack",
    "Poor lead-to-opportunity conversion",
    "Wasted outbound effort on bad-fit accounts",
  ],
  Cybersecurity: [
    "Compliance burden increasing",
    "Risk exposure from unvetted vendors",
    "Vendor consolidation pressure",
    "Security team bandwidth constraints",
    "Incident response time too slow",
    "Board-level risk reporting gaps",
  ],
  Fintech: [
    "Regulatory compliance complexity",
    "Fraud detection overhead",
    "Customer onboarding friction",
    "Reconciliation inefficiency",
    "Manual KYC/AML processes",
    "Cross-border payment complexity",
  ],
  Healthcare: [
    "Administrative burden on clinical staff",
    "HIPAA compliance complexity",
    "Fragmented EHR systems",
    "Procurement cycle too long",
    "Patient data interoperability gaps",
    "Billing and coding errors",
  ],
  "E-Commerce": [
    "Cart abandonment rates",
    "Customer acquisition cost rising",
    "Inventory management complexity",
    "Return logistics overhead",
    "Personalization at scale",
    "Multi-channel coordination",
  ],
  Manufacturing: [
    "Supply chain visibility gaps",
    "Quality control inconsistency",
    "Equipment downtime costs",
    "Workforce scheduling complexity",
    "Raw material price volatility",
    "Regulatory compliance tracking",
  ],
  EdTech: [
    "Student engagement measurement",
    "Content personalization at scale",
    "Institutional procurement cycles",
    "Data privacy regulations",
    "Integration with existing LMS",
    "Proving learning outcomes",
  ],
  MarTech: [
    "Attribution model complexity",
    "Data silo fragmentation",
    "Campaign performance visibility",
    "Customer journey tracking",
    "Tool fatigue across teams",
    "Privacy regulation compliance",
  ],
};

export const BUYER_TITLES: Record<string, Record<string, string[]>> = {
  SaaS: {
    SMB: ["Head of Sales", "Founder / CEO", "Sales Manager", "Growth Lead"],
    "Mid-Market": ["VP Sales", "RevOps Manager", "SDR Manager", "CRO", "Head of Growth"],
    Enterprise: ["CRO", "SVP Sales", "VP Revenue Operations", "Chief Growth Officer"],
  },
  Cybersecurity: {
    SMB: ["IT Manager", "CTO", "Security Lead"],
    "Mid-Market": ["CISO", "VP Engineering", "Head of IT Security", "Compliance Manager"],
    Enterprise: ["CISO", "SVP Information Security", "Chief Risk Officer", "VP Compliance"],
  },
  Fintech: {
    SMB: ["CTO", "Head of Product", "Compliance Officer"],
    "Mid-Market": ["VP Engineering", "Head of Compliance", "CPO", "Risk Manager"],
    Enterprise: ["CTO", "Chief Compliance Officer", "SVP Product", "Head of Risk"],
  },
  Healthcare: {
    SMB: ["Practice Manager", "IT Director", "Office Administrator"],
    "Mid-Market": ["CIO", "VP Operations", "Chief Medical Officer", "Compliance Director"],
    Enterprise: ["CIO", "CMIO", "SVP Operations", "Chief Digital Officer"],
  },
  "E-Commerce": {
    SMB: ["Founder", "Head of Marketing", "Operations Manager"],
    "Mid-Market": ["VP E-Commerce", "CMO", "Head of Digital", "Director of Operations"],
    Enterprise: ["Chief Digital Officer", "SVP E-Commerce", "CMO", "VP Supply Chain"],
  },
  Manufacturing: {
    SMB: ["Plant Manager", "Operations Director", "Owner"],
    "Mid-Market": ["VP Operations", "Head of Supply Chain", "CTO", "Quality Director"],
    Enterprise: ["COO", "SVP Manufacturing", "Chief Supply Chain Officer", "VP Quality"],
  },
  EdTech: {
    SMB: ["Founder", "Head of Product", "Academic Director"],
    "Mid-Market": ["VP Product", "CTO", "Head of Curriculum", "Director of Partnerships"],
    Enterprise: ["Chief Learning Officer", "SVP Product", "CTO", "VP Academic Affairs"],
  },
  MarTech: {
    SMB: ["Head of Marketing", "Growth Lead", "Founder"],
    "Mid-Market": ["CMO", "VP Marketing", "Head of Demand Gen", "Marketing Ops Manager"],
    Enterprise: ["CMO", "SVP Marketing", "Chief Growth Officer", "VP Marketing Technology"],
  },
};

export const TARGET_TRAITS: Record<string, string[]> = {
  SaaS: [
    "Uses outbound as primary GTM",
    "Has SDR team of 5+",
    "Recently raised Series A/B",
    "Growing headcount in sales",
    "Uses Salesforce or HubSpot CRM",
  ],
  Cybersecurity: [
    "Handles sensitive customer data",
    "Subject to SOC2 / ISO 27001",
    "Recently experienced security incident",
    "Growing engineering team",
    "Multi-cloud infrastructure",
  ],
  Fintech: [
    "Regulated by financial authority",
    "Processes high volume transactions",
    "Expanding to new markets",
    "B2B payments focus",
    "Recently received banking license",
  ],
  Healthcare: [
    "Multi-location health system",
    "EHR migration underway",
    "Value-based care model",
    "Telehealth capabilities",
    "500+ bed facility",
  ],
  "E-Commerce": [
    "DTC brand with online presence",
    "Multi-channel retail",
    "Annual revenue $10M+",
    "International shipping",
    "Subscription model",
  ],
  Manufacturing: [
    "Multiple production facilities",
    "Just-in-time manufacturing",
    "ISO certified",
    "Automation investment recent",
    "Global supply chain",
  ],
  EdTech: [
    "B2B institutional sales",
    "100K+ learner base",
    "Content marketplace model",
    "LMS integration partnerships",
    "Federal funding eligible",
  ],
  MarTech: [
    "Multi-channel campaign execution",
    "Enterprise client base",
    "Data platform built",
    "Integrates with major CRMs",
    "ABM strategy deployed",
  ],
};

export const EXCLUDED_TRAITS: Record<string, string[]> = {
  SaaS: [
    "No outbound motion",
    "Pre-revenue stage",
    "Product-led only with no sales team",
    "Less than 10 employees",
  ],
  Cybersecurity: [
    "Consumer-only product",
    "No compliance requirements",
    "Single-person IT team",
    "No sensitive data handling",
  ],
  Fintech: [
    "No regulatory oversight",
    "Consumer lending only",
    "Pre-product stage",
    "Single-market focus with no growth",
  ],
  Healthcare: [
    "Single practitioner office",
    "No EHR system",
    "Non-clinical focus",
    "Purely elective services",
  ],
  "E-Commerce": [
    "Physical retail only",
    "No online presence",
    "Under $1M annual revenue",
    "Local market only",
  ],
  Manufacturing: [
    "Job shop with no repeat production",
    "Under 20 employees",
    "No quality certification",
    "Manual-only processes",
  ],
  EdTech: [
    "Purely B2C tutoring",
    "No institutional sales",
    "Under 1000 learners",
    "No content platform",
  ],
  MarTech: [
    "No marketing team",
    "Under $500K marketing spend",
    "Single-channel only",
    "No CRM integration",
  ],
};

export const DOMAIN_KEYWORDS: Record<string, string> = {
  cyber: "Cybersecurity",
  security: "Cybersecurity",
  secure: "Cybersecurity",
  shield: "Cybersecurity",
  guard: "Cybersecurity",
  fintech: "Fintech",
  pay: "Fintech",
  bank: "Fintech",
  finance: "Fintech",
  health: "Healthcare",
  med: "Healthcare",
  care: "Healthcare",
  clinic: "Healthcare",
  shop: "E-Commerce",
  store: "E-Commerce",
  buy: "E-Commerce",
  cart: "E-Commerce",
  saas: "SaaS",
  cloud: "SaaS",
  platform: "SaaS",
  app: "SaaS",
  learn: "EdTech",
  edu: "EdTech",
  academy: "EdTech",
  market: "MarTech",
  campaign: "MarTech",
  factory: "Manufacturing",
  build: "Manufacturing",
  make: "Manufacturing",
};

export function parseJsonField<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return [] as unknown as T;
  }
}

export function stringifyJsonField(value: unknown): string {
  return JSON.stringify(value);
}
