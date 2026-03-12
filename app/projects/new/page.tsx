"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerationLoader } from "@/components/generation-loader";
import {
  useStore,
  useDispatch,
  createProjectAndGenerate,
  type GenerationStep,
} from "@/lib/store";

const INDUSTRIES = ["SaaS", "Cybersecurity", "Fintech", "Healthcare", "E-Commerce", "Manufacturing", "EdTech", "MarTech"];
const REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America"];
const SIZES = ["SMB", "Mid-Market", "Enterprise"];

export default function NewProjectPage() {
  const router = useRouter();
  const store = useStore();
  const dispatch = useDispatch();

  const [segmentName, setSegmentName] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    const projectId = await createProjectAndGenerate(
      dispatch, store,
      { segmentName, industry, region, companySize, notes },
      setSteps
    );
    await new Promise((r) => setTimeout(r, 600));
    router.push(`/projects/${projectId}`);
  }

  if (generating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GenerationLoader steps={steps} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600">
          <ArrowLeft className="size-3" />
          Back
        </Link>

        <h1 className="text-[28px] font-bold tracking-tight">New segment</h1>
        <p className="mt-2 text-[15px] text-neutral-400">
          Define who you want to reach.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-neutral-600">Segment name</label>
            <Input
              required
              placeholder="e.g. Mid-Market SaaS in North America"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="h-12 rounded-xl border-neutral-200 bg-white text-[15px] shadow-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">Industry</label>
              <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white text-[13px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">Region</label>
              <Select value={region} onValueChange={(v) => setRegion(v ?? "")}>
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white text-[13px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">Size</label>
              <Select value={companySize} onValueChange={(v) => setCompanySize(v ?? "")}>
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white text-[13px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
              Notes <span className="text-neutral-300">(optional)</span>
            </label>
            <Textarea
              rows={3}
              placeholder="Extra context about this segment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border-neutral-200 bg-white text-[14px]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-neutral-900 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Generate draft ICP →
          </button>
        </form>
      </div>
    </div>
  );
}
