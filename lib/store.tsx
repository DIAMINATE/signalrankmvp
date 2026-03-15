"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import {
  DEMO_DATA,
  CLAY_COMPANY,
  STATIC_PROJECT_IDS,
  type Project,
  type ICPGeneration,
  type LeadRecommendation,
  type FeedbackEvent,
} from "./demo-data";
import { generateICP } from "./mockIcpGenerator";
import { rankLeads } from "./mockLeadRanker";

interface StoreState {
  projects: Project[];
  icpGenerations: ICPGeneration[];
  leadRecommendations: LeadRecommendation[];
  feedbackEvents: FeedbackEvent[];
  nextNewIdx: number;
}

type Action =
  | { type: "ADD_PROJECT"; project: Project }
  | { type: "UPDATE_PROJECT"; id: string; updates: Partial<Project> }
  | { type: "ADD_ICP"; icp: ICPGeneration }
  | { type: "SET_LEADS"; projectId: string; leads: LeadRecommendation[] }
  | { type: "ADD_FEEDBACK"; event: FeedbackEvent };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "ADD_PROJECT":
      return { ...state, projects: [action.project, ...state.projects] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id ? { ...p, ...action.updates, updatedAt: new Date().toISOString() } : p
        ),
      };
    case "ADD_ICP":
      return { ...state, icpGenerations: [...state.icpGenerations, action.icp] };
    case "SET_LEADS":
      return {
        ...state,
        leadRecommendations: [
          ...state.leadRecommendations.filter((l) => l.projectId !== action.projectId),
          ...action.leads,
        ],
      };
    case "ADD_FEEDBACK":
      return { ...state, feedbackEvents: [...state.feedbackEvents, action.event] };
    default:
      return state;
  }
}

const initialState: StoreState = {
  projects: DEMO_DATA.projects,
  icpGenerations: DEMO_DATA.icpGenerations,
  leadRecommendations: DEMO_DATA.leadRecommendations,
  feedbackEvents: DEMO_DATA.feedbackEvents,
  nextNewIdx: 1,
};

const StoreContext = createContext<StoreState>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export function useDispatch() {
  return useContext(DispatchContext);
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Helpers for pages
export function useProject(id: string) {
  const store = useStore();
  return store.projects.find((p) => p.id === id) ?? null;
}

export function useProjectIcps(projectId: string) {
  const store = useStore();
  return store.icpGenerations.filter((i) => i.projectId === projectId);
}

export function useProjectLeads(projectId: string) {
  const store = useStore();
  return store.leadRecommendations
    .filter((l) => l.projectId === projectId)
    .sort((a, b) => b.fitScore - a.fitScore);
}

// Action helpers
export type GenerationStep = { label: string; done: boolean };

export async function createProjectAndGenerate(
  dispatch: Dispatch<Action>,
  state: StoreState,
  input: { segmentName: string; companyName: string; websiteUrl?: string; industry: string; region: string; companySize: string; notes: string },
  onStep: (steps: GenerationStep[]) => void
): Promise<string> {
  const availableIds = STATIC_PROJECT_IDS.filter(
    (id) => !state.projects.some((p) => p.id === id)
  );
  const projectId = availableIds[0] || `proj-new-${makeId()}`;
  const now = new Date().toISOString();

  const project: Project = {
    id: projectId,
    companyName: input.companyName || CLAY_COMPANY.companyName,
    websiteUrl: input.websiteUrl || CLAY_COMPANY.websiteUrl,
    industry: input.industry,
    region: input.region,
    companySize: input.companySize,
    notes: input.notes,
    status: "draft",
    segmentName: input.segmentName,
    createdAt: now,
    updatedAt: now,
  };

  dispatch({ type: "ADD_PROJECT", project });

  const name = input.companyName || CLAY_COMPANY.companyName;
  const hasWebsiteUrl = Boolean(input.websiteUrl?.trim());
  const steps: GenerationStep[] = [
    {
      label: hasWebsiteUrl
        ? `Crawling ${input.websiteUrl} for ICP data`
        : `Researching ${name}'s website & public data`,
      done: false,
    },
    { label: `Identifying ${input.industry || "industry"} pain points`, done: false },
    { label: `Matching buyer personas for ${name}`, done: false },
    { label: "Scoring confidence level", done: false },
  ];

  onStep([...steps]);

  let icp: Awaited<ReturnType<typeof generateICP>>;

  if (hasWebsiteUrl) {
    try {
      let extractorBase =
        (typeof process !== "undefined" &&
        process.env?.NEXT_PUBLIC_ICP_EXTRACTOR_URL?.trim()) || "";
      if (extractorBase && !extractorBase.startsWith("http")) {
        extractorBase = `https://${extractorBase}`;
      }
      const apiUrl = extractorBase
        ? `${extractorBase.replace(/\/$/, "")}/extract-icp`
        : "/api/extract-icp";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input.websiteUrl!.trim() }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await res.json();
      if (data?.success && data?.app_icp) {
        icp = {
          summary: data.app_icp.summary || "",
          painPoints: data.app_icp.painPoints || [],
          buyerTitles: data.app_icp.buyerTitles || [],
          traits: data.app_icp.traits || [],
          excludedTraits: data.app_icp.excludedTraits || [],
          confidence: data.app_icp.confidence ?? 70,
        };
      } else {
        throw new Error(data?.error || "Extraction failed");
      }
    } catch (err) {
      icp = generateICP({
        companyName: input.companyName || CLAY_COMPANY.companyName,
        websiteUrl: input.websiteUrl || CLAY_COMPANY.websiteUrl,
        industry: input.industry,
        region: input.region,
        companySize: input.companySize,
        notes: input.notes,
      });
    }
  } else {
    icp = generateICP({
      companyName: input.companyName || CLAY_COMPANY.companyName,
      websiteUrl: input.websiteUrl || CLAY_COMPANY.websiteUrl,
      industry: input.industry,
      region: input.region,
      companySize: input.companySize,
      notes: input.notes,
    });
  }

  await sleep(400);
  steps[0].done = true;
  onStep([...steps]);

  await sleep(500);
  steps[1].done = true;
  onStep([...steps]);

  await sleep(400);
  steps[2].done = true;
  onStep([...steps]);

  await sleep(300);
  steps[3].done = true;
  onStep([...steps]);

  const icpRecord: ICPGeneration = {
    id: `icp-${makeId()}`,
    projectId,
    versionType: "initial",
    summary: icp.summary,
    painPoints: icp.painPoints,
    buyerTitles: icp.buyerTitles,
    traits: icp.traits,
    excludedTraits: icp.excludedTraits,
    confidence: icp.confidence,
    createdAt: now,
  };

  dispatch({ type: "ADD_ICP", icp: icpRecord });
  dispatch({ type: "UPDATE_PROJECT", id: projectId, updates: { status: "icp_generated" } });

  await sleep(400);

  return projectId;
}

export function saveCorrectedIcp(
  dispatch: Dispatch<Action>,
  projectId: string,
  corrected: Omit<ICPGeneration, "id" | "projectId" | "versionType" | "createdAt">
) {
  const icpRecord: ICPGeneration = {
    id: `icp-${makeId()}`,
    projectId,
    versionType: "corrected",
    ...corrected,
    createdAt: new Date().toISOString(),
  };
  dispatch({ type: "ADD_ICP", icp: icpRecord });
  dispatch({ type: "UPDATE_PROJECT", id: projectId, updates: { status: "icp_verified" } });
}

export async function generateLeadsForProject(
  dispatch: Dispatch<Action>,
  project: Project,
  correctedIcp: ICPGeneration,
  onStep?: (steps: GenerationStep[]) => void
) {
  const steps: GenerationStep[] = [
    { label: "Scanning candidate pool", done: false },
    { label: "Scoring against verified ICP", done: false },
    { label: "Ranking recommendations", done: false },
  ];

  onStep?.([...steps]);
  await sleep(600);
  steps[0].done = true;
  onStep?.([...steps]);

  await sleep(800);
  const scored = rankLeads(
    {
      ...correctedIcp,
      industry: project.industry,
      region: project.region,
      companySize: project.companySize,
    },
    25
  );
  steps[1].done = true;
  onStep?.([...steps]);

  await sleep(500);
  const now = new Date().toISOString();
  const leads: LeadRecommendation[] = scored.map((s) => ({
    id: `lead-${makeId()}`,
    projectId: project.id,
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

  steps[2].done = true;
  onStep?.([...steps]);

  dispatch({ type: "SET_LEADS", projectId: project.id, leads });
  dispatch({ type: "UPDATE_PROJECT", id: project.id, updates: { status: "leads_ranked" } });
}

export function submitFeedback(
  dispatch: Dispatch<Action>,
  projectId: string,
  leadRecommendationId: string,
  feedbackType: string
) {
  dispatch({
    type: "ADD_FEEDBACK",
    event: {
      id: `fb-${makeId()}`,
      projectId,
      leadRecommendationId,
      feedbackType,
      notes: "",
      createdAt: new Date().toISOString(),
    },
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
