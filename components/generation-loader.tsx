"use client";

import { Check } from "lucide-react";
import type { GenerationStep } from "@/lib/store";

interface GenerationLoaderProps {
  steps: GenerationStep[];
  title?: string;
}

export function GenerationLoader({
  steps,
  title = "Generating draft ICP hypothesis",
}: GenerationLoaderProps) {
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length && steps.length > 0;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-neutral-400">
            {allDone ? "Done" : "Analyzing signals..."}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => {
            const isActive = !step.done && i === completedCount;
            const isPending = !step.done && i > completedCount;
            return (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  opacity: isPending ? 0.25 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                <div className="flex size-6 shrink-0 items-center justify-center">
                  {step.done ? (
                    <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <div className="size-5 animate-pulse rounded-full border-2 border-neutral-300" />
                  ) : (
                    <div className="size-2 rounded-full bg-neutral-200" />
                  )}
                </div>
                <span className={`text-[14px] ${step.done ? "text-neutral-900" : isActive ? "text-neutral-600" : "text-neutral-300"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="h-0.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-700 ease-out"
            style={{ width: steps.length > 0 ? `${(completedCount / steps.length) * 100}%` : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
