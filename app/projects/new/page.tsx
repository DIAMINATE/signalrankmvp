"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
      dispatch,
      store,
      { segmentName, industry, region, companySize, notes },
      setSteps
    );

    await new Promise((r) => setTimeout(r, 600));
    router.push(`/projects/${projectId}/icp`);
  }

  if (generating) {
    return <GenerationLoader steps={steps} />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <p className="text-sm text-neutral-500">Clay</p>
        <h1 className="text-xl font-semibold tracking-tight">New Segment</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Define a target market segment. We'll generate a Draft ICP Hypothesis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="segmentName">Segment Name</Label>
          <Input
            id="segmentName"
            required
            placeholder="e.g. Mid-Market SaaS — North America"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select value={region} onValueChange={(v) => setRegion(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Company Size</Label>
            <Select value={companySize} onValueChange={(v) => setCompanySize(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Any additional context about this segment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Generate Draft ICP
        </Button>
      </form>
    </div>
  );
}
