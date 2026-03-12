"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/status-badge";

function getHref(project: { id: string; status: string }) {
  switch (project.status) {
    case "draft":
      return `/projects/${project.id}/icp`;
    case "icp_generated":
      return `/projects/${project.id}/icp`;
    case "icp_verified":
      return `/projects/${project.id}/leads`;
    case "leads_ranked":
      return `/projects/${project.id}/leads`;
    default:
      return `/projects/${project.id}/icp`;
  }
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { projects } = useStore();

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Clay</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Targeting Segments
          </h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-neutral-500">
            Each segment represents an ICP hypothesis for a specific market.
            Corrections you make improve future generation accuracy.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="size-3.5" />
          New Segment
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-20 text-center">
          <p className="text-sm font-medium text-neutral-900">
            No segments yet
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Create your first targeting segment to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={getHref(project)}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-neutral-900">
                    {project.segmentName || project.companyName}
                  </span>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {project.industry} · {project.region} · {project.companySize}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {timeAgo(project.updatedAt)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-neutral-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
