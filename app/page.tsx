"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { projects } = useStore();
  const completed = projects.find((p) => p.status === "leads_ranked");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[12px] font-medium tracking-wide text-neutral-500">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          SignalRank
        </div>

        <h1 className="text-[42px] font-bold leading-[1.1] tracking-tight text-neutral-900">
          Find your best-fit
          <br />
          <span className="text-neutral-300">accounts, faster</span>
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-[16px] leading-relaxed text-neutral-400">
          Generate an ICP hypothesis, verify it with your expertise,
          and get a ranked list of who to call first.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          {completed && (
            <Link
              href={`/projects/${completed.id}`}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-neutral-900 px-7 py-4 text-[15px] font-semibold text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/10"
            >
              See Clay's demo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          <Link
            href="/projects/new"
            className="text-[13px] text-neutral-400 transition-colors hover:text-neutral-600"
          >
            or start a new segment →
          </Link>
        </div>

        {projects.length > 1 && (
          <div className="mt-16 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-300">Other segments</p>
            {projects.filter((p) => p.id !== completed?.id).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block text-[13px] text-neutral-400 transition-colors hover:text-neutral-600"
              >
                {p.segmentName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
