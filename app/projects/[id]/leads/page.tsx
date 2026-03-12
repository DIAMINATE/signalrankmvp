"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Zap } from "lucide-react";
import {
  useStore,
  useProject,
  useProjectIcps,
  useProjectLeads,
  useDispatch,
  generateLeadsForProject,
  submitFeedback,
  type GenerationStep,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FilterBar } from "@/components/filter-bar";
import { GenerationLoader } from "@/components/generation-loader";

function fitColor(score: number) {
  if (score > 80) return "text-emerald-700 bg-emerald-50";
  if (score >= 60) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

const BROAD_LIST = 500;

export default function LeadsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = useProject(id);
  const icps = useProjectIcps(id);
  const leads = useProjectLeads(id);
  const dispatch = useDispatch();

  const correctedIcp = icps.find((i) => i.versionType === "corrected");

  const [filters, setFilters] = useState({ region: "", industry: "", companySize: "", minFitScore: 0 });
  const [selectedLead, setSelectedLead] = useState<(typeof leads)[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([]);

  if (!project) {
    return <div className="py-20 text-center text-sm text-neutral-500">Project not found.</div>;
  }

  if (generating) {
    return <GenerationLoader steps={genSteps} title="Ranking Lead Candidates" />;
  }

  if (leads.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Zap className="mb-3 size-8 text-neutral-300" />
        <h2 className="text-lg font-semibold">No leads yet</h2>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">
          Generate ranked buyer recommendations based on your verified ICP.
        </p>
        <Button
          className="mt-5"
          disabled={!correctedIcp}
          onClick={async () => {
            if (!correctedIcp) return;
            setGenerating(true);
            await generateLeadsForProject(dispatch, project, correctedIcp, setGenSteps);
            setGenerating(false);
            router.refresh();
          }}
        >
          Generate Leads
        </Button>
        {!correctedIcp && (
          <p className="mt-2 text-xs text-neutral-400">
            <Link href={`/projects/${id}/verify`} className="underline">Verify the ICP</Link> first.
          </p>
        )}
      </div>
    );
  }

  const filtered = leads.filter((l) => {
    if (filters.region && l.region !== filters.region) return false;
    if (filters.industry && l.industry !== filters.industry) return false;
    if (filters.companySize && l.companySize !== filters.companySize) return false;
    if (l.fitScore < filters.minFitScore) return false;
    return true;
  });

  const topTier = leads.filter((l) => l.fitScore > 80).length;
  const avg = Math.round(leads.reduce((s, l) => s + l.fitScore, 0) / leads.length);
  const reduction = Math.round(((BROAD_LIST - leads.length) / BROAD_LIST) * 100);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/projects/${id}/icp`} className="text-xs text-neutral-400 hover:text-neutral-600">
          ← ICP
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          Ranked Buyer Recommendations
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{project.segmentName}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
        {[
          { label: "Recommended", value: leads.length },
          { label: "Top-tier (>80)", value: topTier },
          { label: "Avg Fit Score", value: avg },
          { label: "Est. Call Reduction", value: `~${reduction}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white px-4 py-3">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-lg font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs text-blue-700">
        Estimated efficiency gain: ~{BROAD_LIST} broad accounts → {leads.length} prioritized.
        <span className="text-blue-500"> Scenario estimate based on typical outbound list sizes.</span>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Fit</TableHead>
              <TableHead className="text-right">Conf.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-neutral-400">No leads match filters.</TableCell>
              </TableRow>
            ) : (
              filtered.map((lead, idx) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => { setSelectedLead(lead); setDrawerOpen(true); }}
                >
                  <TableCell className="text-neutral-400">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{lead.companyName}</TableCell>
                  <TableCell>{lead.contactName}</TableCell>
                  <TableCell className="text-neutral-500">{lead.title}</TableCell>
                  <TableCell className="text-neutral-500">{lead.region}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex min-w-[2.5rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${fitColor(lead.fitScore)}`}>
                      {lead.fitScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-neutral-500">{lead.confidence}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Link href={`/projects/${id}/learning`} className="text-xs text-neutral-400 hover:text-neutral-600">
          View learning loop →
        </Link>
      </div>

      {/* Lead detail drawer */}
      <Sheet open={drawerOpen} onOpenChange={(o) => { if (!o) { setDrawerOpen(false); setSelectedLead(null); } }}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLead.companyName}</SheetTitle>
                <SheetDescription>{selectedLead.contactName} · {selectedLead.title}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pt-4">
                <div className="flex gap-6">
                  <Meter label="Fit Score" value={selectedLead.fitScore} />
                  <Meter label="Confidence" value={selectedLead.confidence} />
                </div>

                <section>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Why This Account?</h4>
                  <ul className="space-y-1 text-sm text-neutral-600">
                    {selectedLead.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </section>

                <section>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Signals</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.signals.map((s, i) => (
                      <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{s}</span>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">Source Template</h4>
                  <p className="text-sm text-neutral-500">{selectedLead.sourceTemplateKey}</p>
                </section>

                <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                  {(["good_fit", "bad_fit", "contacted", "converted"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => submitFeedback(dispatch, id, selectedLead.id, type)}
                      className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      {type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
