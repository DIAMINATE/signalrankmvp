"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Zap } from "lucide-react";
import {
  useProject,
  useProjectIcps,
  useProjectLeads,
  useDispatch,
  saveCorrectedIcp,
  generateLeadsForProject,
  submitFeedback,
  type GenerationStep,
} from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GenerationLoader } from "@/components/generation-loader";

function linesToArray(value: string): string[] {
  return value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

function fitColor(score: number) {
  if (score > 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const project = useProject(id);
  const icps = useProjectIcps(id);
  const leads = useProjectLeads(id);
  const dispatch = useDispatch();

  const initialIcp = icps.find((i) => i.versionType === "initial");
  const correctedIcp = icps.find((i) => i.versionType === "corrected");
  const displayIcp = correctedIcp ?? initialIcp;

  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(displayIcp?.summary ?? "");
  const [painPoints, setPainPoints] = useState(displayIcp?.painPoints.join("\n") ?? "");
  const [buyerTitles, setBuyerTitles] = useState(displayIcp?.buyerTitles.join("\n") ?? "");
  const [traits, setTraits] = useState(displayIcp?.traits.join("\n") ?? "");
  const [excludedTraits, setExcludedTraits] = useState(displayIcp?.excludedTraits.join("\n") ?? "");

  const [selectedLead, setSelectedLead] = useState<(typeof leads)[0] | null>(null);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [leadSteps, setLeadSteps] = useState<GenerationStep[]>([]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[14px] text-neutral-400">
        Not found. <Link href="/" className="ml-1 underline">Back</Link>
      </div>
    );
  }

  if (generatingLeads) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GenerationLoader steps={leadSteps} title="Ranking lead candidates" />
      </div>
    );
  }

  function handleSaveIcp() {
    saveCorrectedIcp(dispatch, id, {
      summary,
      painPoints: linesToArray(painPoints),
      buyerTitles: linesToArray(buyerTitles),
      traits: linesToArray(traits),
      excludedTraits: linesToArray(excludedTraits),
      confidence: Math.min(95, (displayIcp?.confidence ?? 70) + 8),
    });
    setEditing(false);
  }

  async function handleGenerateLeads() {
    const icp = correctedIcp ?? initialIcp;
    if (!icp) return;
    setGeneratingLeads(true);
    await generateLeadsForProject(dispatch, project!, icp, setLeadSteps);
    setGeneratingLeads(false);
  }

  const topTier = leads.filter((l) => l.fitScore > 80).length;
  const avg = leads.length ? Math.round(leads.reduce((s, l) => s + l.fitScore, 0) / leads.length) : 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 pb-32">
      {/* Header */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600">
        <ArrowLeft className="size-3" />
        Home
      </Link>

      <div className="mt-8 mb-20">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          {project.companyName}
        </p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight">
          {project.segmentName}
        </h1>
        <p className="mt-2 text-[15px] text-neutral-400">
          {project.industry} · {project.region} · {project.companySize}
        </p>
      </div>

      {/* ─── SECTION 1: ICP ─── */}
      {displayIcp && (
        <section className="mb-24">
          <SectionLabel>
            {correctedIcp ? "Verified ICP" : "Draft ICP Hypothesis"}
            <span className="ml-2 text-neutral-300">·</span>
            <span className={`ml-2 ${displayIcp.confidence >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
              {displayIcp.confidence}% confidence
            </span>
          </SectionLabel>

          {!correctedIcp && !editing && (
            <div className="mb-8 rounded-xl bg-amber-50/80 px-5 py-4 text-[14px] leading-relaxed text-amber-700/70">
              This is a generated hypothesis. Edit it below to improve accuracy.
            </div>
          )}

          {editing ? (
            <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
              <Field label="Summary">
                <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} className="border-neutral-200 text-[14px]" />
              </Field>
              <Field label="Pain points (one per line)">
                <Textarea rows={4} value={painPoints} onChange={(e) => setPainPoints(e.target.value)} className="border-neutral-200 text-[14px]" />
              </Field>
              <Field label="Buyer titles (one per line)">
                <Textarea rows={3} value={buyerTitles} onChange={(e) => setBuyerTitles(e.target.value)} className="border-neutral-200 text-[14px]" />
              </Field>
              <Field label="Target traits (one per line)">
                <Textarea rows={3} value={traits} onChange={(e) => setTraits(e.target.value)} className="border-neutral-200 text-[14px]" />
              </Field>
              <Field label="Exclusions (one per line)">
                <Textarea rows={2} value={excludedTraits} onChange={(e) => setExcludedTraits(e.target.value)} className="border-neutral-200 text-[14px]" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveIcp} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-neutral-800">
                  Save changes
                </button>
                <button onClick={() => setEditing(false)} className="text-[13px] text-neutral-400 hover:text-neutral-600">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-[15px] leading-[1.8] text-neutral-600">{displayIcp.summary}</p>

              <div>
                <MiniLabel>Pain points</MiniLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displayIcp.painPoints.map((p) => (
                    <span key={p} className="rounded-full bg-white px-3 py-1.5 text-[13px] text-neutral-600 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)]">{p}</span>
                  ))}
                </div>
              </div>

              <div>
                <MiniLabel>Buyer titles</MiniLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {displayIcp.buyerTitles.map((t) => (
                    <span key={t} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] text-neutral-600">{t}</span>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <MiniLabel>Target traits</MiniLabel>
                  <ul className="mt-2 space-y-1.5">
                    {displayIcp.traits.map((t) => (
                      <li key={t} className="text-[14px] text-neutral-500">→ {t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <MiniLabel>Exclusions</MiniLabel>
                  <ul className="mt-2 space-y-1.5">
                    {displayIcp.excludedTraits.map((t) => (
                      <li key={t} className="text-[14px] text-neutral-400">✕ {t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-neutral-900"
              >
                Edit ICP →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ─── SECTION 2: RANKED LEADS ─── */}
      <section className="mb-24">
        <SectionLabel>Ranked leads</SectionLabel>

        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
            <Zap className="mx-auto mb-3 size-6 text-neutral-200" />
            <p className="text-[15px] font-medium text-neutral-900">No leads yet</p>
            <p className="mt-1 text-[13px] text-neutral-400">
              {correctedIcp || initialIcp
                ? "Generate ranked recommendations from your ICP."
                : "Generate an ICP first."}
            </p>
            {(correctedIcp || initialIcp) && (
              <button
                onClick={handleGenerateLeads}
                className="mt-5 rounded-xl bg-neutral-900 px-6 py-3 text-[14px] font-medium text-white hover:bg-neutral-800"
              >
                Generate leads
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 flex gap-10">
              <Stat value={leads.length} label="accounts" />
              <Stat value={topTier} label="top-tier" />
              <Stat value={avg} label="avg fit" />
              <Stat value={`~${Math.round(((500 - leads.length) / 500) * 100)}%`} label="call reduction*" accent />
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {["#", "Company", "Contact", "Title", "Fit", "Conf."].map((h) => (
                      <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400 ${h === "Fit" || h === "Conf." ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="cursor-pointer border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/60"
                    >
                      <td className="px-4 py-3.5 text-[12px] text-neutral-300">{idx + 1}</td>
                      <td className="px-4 py-3.5 text-[14px] font-medium text-neutral-900">{lead.companyName}</td>
                      <td className="px-4 py-3.5 text-[13px] text-neutral-500">{lead.contactName}</td>
                      <td className="px-4 py-3.5 text-[13px] text-neutral-400">{lead.title}</td>
                      <td className={`px-4 py-3.5 text-right text-[14px] font-semibold tabular-nums ${fitColor(lead.fitScore)}`}>{lead.fitScore}</td>
                      <td className="px-4 py-3.5 text-right text-[13px] tabular-nums text-neutral-400">{lead.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-neutral-300">
              *Estimated reduction vs ~500 broad accounts. Scenario estimate.
            </p>
          </>
        )}
      </section>

      {/* ─── SECTION 3: LEARNING LOOP ─── */}
      {initialIcp && (
        <section className="mb-16">
          <SectionLabel>Learning loop</SectionLabel>

          {correctedIcp ? (
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-100/60 p-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  Draft · {initialIcp.confidence}%
                </p>
                <p className="text-[13px] leading-relaxed text-neutral-500 line-clamp-4">{initialIcp.summary}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-500">
                  Verified · {correctedIcp.confidence}%
                </p>
                <p className="text-[13px] leading-relaxed text-neutral-700 line-clamp-4">{correctedIcp.summary}</p>
              </div>
            </div>
          ) : (
            <p className="mb-8 text-[14px] text-neutral-400">Verify the ICP to see how corrections improve the model.</p>
          )}

          <div className="rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[15px] font-semibold text-neutral-900">How this makes SignalRank better</p>
            <p className="mt-3 text-[14px] leading-[1.7] text-neutral-500">
              Every correction improves future ICP generation for similar segments. Over time,
              SignalRank builds verified templates — reducing manual effort and increasing ranking accuracy.
            </p>
            <ol className="mt-5 space-y-2 text-[14px] text-neutral-500">
              <li><span className="mr-2 text-neutral-300">1</span>Hypotheses start from website signals & industry patterns</li>
              <li><span className="mr-2 text-neutral-300">2</span>Your verification captures domain expertise</li>
              <li><span className="mr-2 text-neutral-300">3</span>Corrections train the model on what "good fit" means</li>
              <li><span className="mr-2 text-neutral-300">4</span>Future segments start with higher-quality drafts</li>
              <li><span className="mr-2 text-neutral-300">5</span>Outcome feedback (contacted → converted) closes the loop</li>
            </ol>
          </div>
        </section>
      )}

      {/* Lead detail drawer */}
      <Sheet open={!!selectedLead} onOpenChange={(o) => { if (!o) setSelectedLead(null); }}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[18px]">{selectedLead.companyName}</SheetTitle>
                <SheetDescription>{selectedLead.contactName} · {selectedLead.title}</SheetDescription>
              </SheetHeader>
              <div className="space-y-7 px-4 pt-6">
                <div className="flex gap-6">
                  <Meter label="Fit score" value={selectedLead.fitScore} />
                  <Meter label="Confidence" value={selectedLead.confidence} />
                </div>
                <div>
                  <MiniLabel>Why this account?</MiniLabel>
                  <ul className="mt-2 space-y-1.5 text-[13px] text-neutral-600">
                    {selectedLead.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div>
                  <MiniLabel>Signals</MiniLabel>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedLead.signals.map((s, i) => (
                      <span key={i} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
                  {["good_fit", "bad_fit", "contacted", "converted"].map((type) => (
                    <button
                      key={type}
                      onClick={() => submitFeedback(dispatch, id, selectedLead.id, type)}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{children}</h2>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-[24px] font-bold tabular-nums leading-none ${accent ? "text-emerald-600" : "text-neutral-900"}`}>{value}</p>
      <p className="mt-1 text-[11px] text-neutral-400">{label}</p>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex-1">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] text-neutral-400">{label}</span>
        <span className="text-[14px] font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
