"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProject, useProjectIcps } from "@/lib/store";

function diffArrays(original: string[], corrected: string[]) {
  const added = corrected.filter((c) => !original.includes(c));
  const removed = original.filter((o) => !corrected.includes(o));
  return { added, removed };
}

export default function LearningPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const icps = useProjectIcps(id);
  const initialIcp = icps.find((i) => i.versionType === "initial");
  const correctedIcp = icps.find((i) => i.versionType === "corrected");

  if (!project) {
    return <div className="py-20 text-center text-sm text-neutral-500">Project not found.</div>;
  }

  if (!initialIcp) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        Generate an ICP first. <Link href="/" className="underline">Back to segments</Link>
      </div>
    );
  }

  const painDiff = correctedIcp ? diffArrays(initialIcp.painPoints, correctedIcp.painPoints) : null;
  const titleDiff = correctedIcp ? diffArrays(initialIcp.buyerTitles, correctedIcp.buyerTitles) : null;
  const traitDiff = correctedIcp ? diffArrays(initialIcp.traits, correctedIcp.traits) : null;
  const exclDiff = correctedIcp ? diffArrays(initialIcp.excludedTraits, correctedIcp.excludedTraits) : null;
  const summaryChanged = correctedIcp && correctedIcp.summary !== initialIcp.summary;

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div>
        <Link href={`/projects/${id}/icp`} className="text-xs text-neutral-400 hover:text-neutral-600">
          ← ICP
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Learning Loop</h1>
        <p className="mt-1 text-sm text-neutral-500">{project.segmentName}</p>
      </div>

      {/* ICP Evolution */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">ICP Evolution</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-500">Original Draft</h3>
              <span className="text-xs text-neutral-400">{initialIcp.confidence}% conf.</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">{initialIcp.summary}</p>
          </div>
          {correctedIcp ? (
            <div className="rounded-xl border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Human-Verified</h3>
                <span className="text-xs text-emerald-600">{correctedIcp.confidence}% conf.</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700">{correctedIcp.summary}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-200 p-5 text-sm text-neutral-400">
              Not yet verified
            </div>
          )}
        </div>
      </section>

      {/* Delta */}
      {correctedIcp && (
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Changes Made</h2>
          <div className="space-y-3">
            {summaryChanged && (
              <p className="text-sm text-neutral-500">Summary was refined</p>
            )}
            <DiffBlock label="Pain Points" diff={painDiff!} />
            <DiffBlock label="Buyer Titles" diff={titleDiff!} />
            <DiffBlock label="Target Traits" diff={traitDiff!} />
            <DiffBlock label="Excluded Traits" diff={exclDiff!} />
            {!summaryChanged && !painDiff?.added.length && !painDiff?.removed.length &&
             !titleDiff?.added.length && !titleDiff?.removed.length &&
             !traitDiff?.added.length && !traitDiff?.removed.length &&
             !exclDiff?.added.length && !exclDiff?.removed.length && (
              <p className="text-sm text-neutral-400">No changes detected</p>
            )}
          </div>
        </section>
      )}

      {/* Learning loop narrative */}
      <section className="space-y-4 border-t border-neutral-100 pt-8">
        <h2 className="text-sm font-semibold tracking-tight">The SignalRank Learning Loop</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Each correction you make to an ICP hypothesis improves future ICP generation and
          lead ranking for similar customer segments. Over time, SignalRank builds a library of
          verified segment templates, reducing manual corrections and increasing recommendation accuracy.
        </p>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex gap-2"><span className="text-neutral-400">1.</span> Draft hypotheses start from website signals and industry patterns</li>
          <li className="flex gap-2"><span className="text-neutral-400">2.</span> Human verification captures domain expertise</li>
          <li className="flex gap-2"><span className="text-neutral-400">3.</span> Corrections train the model on what good-fit really means for your segment</li>
          <li className="flex gap-2"><span className="text-neutral-400">4.</span> Future projects in similar segments start with higher-quality drafts</li>
          <li className="flex gap-2"><span className="text-neutral-400">5.</span> Outcome feedback (contacted, converted) closes the loop</li>
        </ul>
        <p className="text-xs text-neutral-400">
          In production, outcome feedback from CRM integrations (Salesforce, HubSpot)
          would automatically refine the scoring model.
        </p>
      </section>
    </div>
  );
}

function DiffBlock({ label, diff }: { label: string; diff: { added: string[]; removed: string[] } }) {
  if (!diff.added.length && !diff.removed.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      {diff.added.map((a) => (
        <p key={a} className="text-sm text-emerald-600">+ {a}</p>
      ))}
      {diff.removed.map((r) => (
        <p key={r} className="text-sm text-red-500">− {r}</p>
      ))}
    </div>
  );
}
