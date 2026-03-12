"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useProject, useProjectIcps } from "@/lib/store";
import { Button } from "@/components/ui/button";

function ConfidenceIndicator({ value }: { value: number }) {
  const label = value >= 80 ? "High" : value >= 60 ? "Medium" : "Low";
  const color = value >= 80 ? "text-emerald-600" : value >= 60 ? "text-amber-600" : "text-neutral-500";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {label} confidence · {value}%
    </span>
  );
}

export default function IcpPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const icps = useProjectIcps(id);
  const initialIcp = icps.find((i) => i.versionType === "initial");
  const correctedIcp = icps.find((i) => i.versionType === "corrected");

  if (!project) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        Project not found. <Link href="/" className="underline">Back to segments</Link>
      </div>
    );
  }

  if (!initialIcp) {
    return (
      <div className="py-20 text-center text-sm text-neutral-500">
        No ICP generated yet. <Link href="/" className="underline">Back to segments</Link>
      </div>
    );
  }

  const icp = correctedIcp ?? initialIcp;
  const isVerified = !!correctedIcp;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600">
          ← Segments
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          {project.segmentName || project.companyName}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {isVerified ? "Human-Verified ICP" : "Draft ICP Hypothesis"}
          </span>
          <span className="text-neutral-200">·</span>
          <ConfidenceIndicator value={icp.confidence} />
        </div>
      </div>

      {!isVerified && (
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
          This is an initial hypothesis generated from your company profile. Review and
          correct it to improve targeting accuracy.
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Summary</h2>
        <p className="text-sm leading-relaxed text-neutral-700">{icp.summary}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Pain Points</h2>
        <div className="flex flex-wrap gap-1.5">
          {icp.painPoints.map((p) => (
            <span key={p} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">{p}</span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Buyer Titles</h2>
        <div className="flex flex-wrap gap-1.5">
          {icp.buyerTitles.map((t) => (
            <span key={t} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700">{t}</span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Target Traits</h2>
        <ul className="space-y-1">
          {icp.traits.map((t) => (
            <li key={t} className="text-sm text-neutral-600">• {t}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">Excluded Traits</h2>
        <ul className="space-y-1">
          {icp.excludedTraits.map((t) => (
            <li key={t} className="text-sm text-red-500/80">✕ {t}</li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-3 border-t border-neutral-100 pt-6">
        {!isVerified ? (
          <Link
            href={`/projects/${id}/verify`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Edit & Verify ICP
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <>
            <Link
              href={`/projects/${id}/leads`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              View Ranked Leads
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href={`/projects/${id}/verify`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Edit ICP
            </Link>
          </>
        )}
        <Link
          href={`/projects/${id}/learning`}
          className="ml-auto text-xs text-neutral-400 hover:text-neutral-600"
        >
          Learning loop →
        </Link>
      </div>
    </div>
  );
}
