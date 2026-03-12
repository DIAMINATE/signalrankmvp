"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, ArrowRight } from "lucide-react";
import {
  useProject,
  useProjectIcps,
  useDispatch,
  saveCorrectedIcp,
  generateLeadsForProject,
  type GenerationStep,
} from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GenerationLoader } from "@/components/generation-loader";

function linesToArray(value: string): string[] {
  return value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = useProject(id);
  const icps = useProjectIcps(id);
  const dispatch = useDispatch();

  const initialIcp = icps.find((i) => i.versionType === "initial");
  const correctedIcp = icps.find((i) => i.versionType === "corrected");
  const sourceIcp = correctedIcp ?? initialIcp;

  const [summary, setSummary] = useState(sourceIcp?.summary ?? "");
  const [painPoints, setPainPoints] = useState(sourceIcp?.painPoints.join("\n") ?? "");
  const [buyerTitles, setBuyerTitles] = useState(sourceIcp?.buyerTitles.join("\n") ?? "");
  const [traits, setTraits] = useState(sourceIcp?.traits.join("\n") ?? "");
  const [excludedTraits, setExcludedTraits] = useState(sourceIcp?.excludedTraits.join("\n") ?? "");
  const [saved, setSaved] = useState(false);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [leadSteps, setLeadSteps] = useState<GenerationStep[]>([]);

  if (!project || !initialIcp) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        No ICP to verify. <Link href="/" className="underline">Back to segments</Link>
      </div>
    );
  }

  function handleSave() {
    const corrected = {
      summary,
      painPoints: linesToArray(painPoints),
      buyerTitles: linesToArray(buyerTitles),
      traits: linesToArray(traits),
      excludedTraits: linesToArray(excludedTraits),
      confidence: Math.min(95, (sourceIcp?.confidence ?? 70) + 8),
    };
    saveCorrectedIcp(dispatch, id, corrected);
    setSaved(true);
  }

  async function handleGenerateLeads() {
    setGeneratingLeads(true);
    const latestCorrected = {
      id: "",
      projectId: id,
      versionType: "corrected" as const,
      summary,
      painPoints: linesToArray(painPoints),
      buyerTitles: linesToArray(buyerTitles),
      traits: linesToArray(traits),
      excludedTraits: linesToArray(excludedTraits),
      confidence: 90,
      createdAt: new Date().toISOString(),
    };
    await generateLeadsForProject(dispatch, project!, latestCorrected, setLeadSteps);
    await new Promise((r) => setTimeout(r, 500));
    router.push(`/projects/${id}/leads`);
  }

  if (generatingLeads) {
    return <GenerationLoader steps={leadSteps} title="Ranking Lead Candidates" />;
  }

  if (saved) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-emerald-100">
          <Check className="size-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold">ICP Verified</h2>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          Your corrected ICP has been saved. Generate ranked leads based on
          this profile.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleGenerateLeads}>
            Generate Ranked Leads
            <ArrowRight className="size-3.5" />
          </Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/projects/${id}/icp`} className="text-xs text-neutral-400 hover:text-neutral-600">
          ← ICP
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Verify ICP</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Compare the generated draft with your corrections. Edit the right column.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Original — read only */}
        <div className="space-y-5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">Original Draft</h3>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">read-only</span>
          </div>
          <ReadOnlyField label="Summary" value={initialIcp.summary} />
          <ReadOnlyField label="Pain Points" items={initialIcp.painPoints} />
          <ReadOnlyField label="Buyer Titles" items={initialIcp.buyerTitles} />
          <ReadOnlyField label="Target Traits" items={initialIcp.traits} />
          <ReadOnlyField label="Excluded Traits" items={initialIcp.excludedTraits} />
        </div>

        {/* Editable corrected */}
        <div className="space-y-5">
          <h3 className="text-sm font-medium">Human-Verified ICP</h3>
          <div className="space-y-1.5">
            <Label>Summary</Label>
            <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Pain Points <span className="text-neutral-400">(one per line)</span></Label>
            <Textarea rows={4} value={painPoints} onChange={(e) => setPainPoints(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Buyer Titles <span className="text-neutral-400">(one per line)</span></Label>
            <Textarea rows={3} value={buyerTitles} onChange={(e) => setBuyerTitles(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Target Traits <span className="text-neutral-400">(one per line)</span></Label>
            <Textarea rows={3} value={traits} onChange={(e) => setTraits(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Excluded Traits <span className="text-neutral-400">(one per line)</span></Label>
            <Textarea rows={3} value={excludedTraits} onChange={(e) => setExcludedTraits(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-6">
        <Button onClick={handleSave} size="lg">
          <Check className="size-4" />
          Save Verified ICP
        </Button>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, items }: { label: string; value?: string; items?: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      {value && <p className="text-sm leading-relaxed text-neutral-600">{value}</p>}
      {items && (
        <ul className="space-y-0.5 text-sm text-neutral-600">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      )}
    </div>
  );
}
