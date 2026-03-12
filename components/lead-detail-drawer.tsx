"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Lead {
  id: string
  companyName: string
  contactName: string
  title: string
  region: string
  industry: string
  companySize: string
  fitScore: number
  confidence: number
  reasons: string
  signals: string
  sourceTemplateKey: string
}

interface LeadDetailDrawerProps {
  lead: Lead | null
  open: boolean
  onClose: () => void
  projectId: string
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-red-500"
}

const feedbackTypes = [
  { type: "good_fit", label: "Good Fit", variant: "default" as const },
  { type: "bad_fit", label: "Bad Fit", variant: "destructive" as const },
  { type: "contacted", label: "Contacted", variant: "outline" as const },
  { type: "converted", label: "Converted", variant: "secondary" as const },
]

export function LeadDetailDrawer({
  lead,
  open,
  onClose,
  projectId,
}: LeadDetailDrawerProps) {
  const [submitting, setSubmitting] = useState<string | null>(null)

  if (!lead) return null

  const reasons = parseJsonArray(lead.reasons)
  const signals = parseJsonArray(lead.signals)

  async function handleFeedback(feedbackType: string) {
    setSubmitting(feedbackType)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          leadRecommendationId: lead!.id,
          feedbackType,
        }),
      })
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead.companyName}</SheetTitle>
          <SheetDescription>
            {lead.contactName} &middot; {lead.title}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{lead.region}</Badge>
            <Badge variant="outline">{lead.industry}</Badge>
            <Badge variant="outline">{lead.companySize}</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Fit Score</span>
                <span className="tabular-nums">{lead.fitScore}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(lead.fitScore)}`}
                  style={{ width: `${lead.fitScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Confidence</span>
                <span className="tabular-nums">{lead.confidence}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(lead.confidence)}`}
                  style={{ width: `${lead.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {reasons.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold">
                Why This Account?
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </section>
          )}

          {signals.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold">Signals</h4>
              <div className="flex flex-wrap gap-1.5">
                {signals.map((signal, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {signal}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-1 text-sm font-semibold">Source Template</h4>
            <p className="text-sm text-muted-foreground">
              {lead.sourceTemplateKey}
            </p>
          </section>
        </div>

        <SheetFooter className="flex-row flex-wrap gap-2">
          {feedbackTypes.map(({ type, label, variant }) => (
            <Button
              key={type}
              variant={variant}
              size="sm"
              disabled={submitting !== null}
              onClick={() => handleFeedback(type)}
            >
              {submitting === type ? "Sending…" : label}
            </Button>
          ))}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default LeadDetailDrawer
