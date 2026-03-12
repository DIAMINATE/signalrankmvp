"use client";

import { Check, Loader2 } from "lucide-react";
import type { GenerationStep } from "@/lib/store";

interface GenerationLoaderProps {
  steps: GenerationStep[];
  title?: string;
}

export function GenerationLoader({
  steps,
  title = "Generating Draft ICP Hypothesis",
}: GenerationLoaderProps) {
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          {!allDone && (
            <Loader2 className="mx-auto mb-4 size-6 animate-spin text-neutral-400" />
          )}
          {allDone && (
            <div className="mx-auto mb-4 flex size-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="size-4 text-emerald-600" />
            </div>
          )}
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {allDone ? "Complete" : "This takes a few seconds"}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 transition-opacity duration-300"
              style={{ opacity: step.done || i <= completedCount ? 1 : 0.3 }}
            >
              <div className="flex size-5 shrink-0 items-center justify-center">
                {step.done ? (
                  <Check className="size-4 text-emerald-500" />
                ) : i === completedCount ? (
                  <Loader2 className="size-4 animate-spin text-neutral-400" />
                ) : (
                  <div className="size-1.5 rounded-full bg-neutral-200" />
                )}
              </div>
              <span
                className={`text-sm ${
                  step.done
                    ? "text-neutral-900"
                    : i === completedCount
                    ? "text-neutral-600"
                    : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
